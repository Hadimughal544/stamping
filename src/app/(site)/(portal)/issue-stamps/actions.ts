"use server";

import { and, eq, inArray } from "drizzle-orm";
import { db, schema } from "@/db";
import { getCurrentUser } from "@/lib/auth";
import { isContactVerified, sendOtp, verifyOtp, type SendResult } from "@/lib/otp";
import { issueDateAt } from "@/lib/stamps";
import { contactSchema, issueSchema, type IssueInput } from "@/lib/validators";

const VALIDITY_DAYS = 7;

/** OTP contact verification is off unless OTP_ENABLED="true" is set in the environment. */
const otpEnabled = () => process.env.OTP_ENABLED === "true";

export type StartVerificationResult = { verified: true } | ({ verified: false } & SendResult);

/** Called on NEXT: skips OTP when no contact is given or it is already verified, otherwise sends one. */
export async function startVerification(contact: string, cnic?: string): Promise<StartVerificationResult> {
  if (!(await getCurrentUser())) return { verified: false, ok: false, error: "Session expired. Please log in again." };
  if (!contact) return { verified: true };
  if (!contactSchema.safeParse(contact).success) return { verified: false, ok: false, error: "Invalid contact number." };

  if (!otpEnabled() || (await isContactVerified(contact, cnic))) return { verified: true };
  return { verified: false, ...(await sendOtp(contact)) };
}

export async function resendOtp(contact: string): Promise<SendResult> {
  if (!(await getCurrentUser())) return { ok: false, error: "Session expired. Please log in again." };
  if (!contactSchema.safeParse(contact).success) return { ok: false, error: "Invalid contact number." };
  return sendOtp(contact);
}

export async function confirmOtp(contact: string, code: string): Promise<{ ok: boolean }> {
  if (!(await getCurrentUser())) return { ok: false };
  if (!/^\d{6}$/.test(code)) return { ok: false };
  return { ok: await verifyOtp(contact, code) };
}

export type IssueResult = { ok: true; serial: string } | { ok: false; error: string };

export async function issueStamps(input: IssueInput): Promise<IssueResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Session expired. Please log in again." };

  const parsed = issueSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid data" };
  const data = parsed.data;

  const verifier = data.through === "agent" ? data.agent! : data.applicant;
  const verifierCnic = data.through === "self" ? data.applicant.cnic || undefined : undefined;
  if (otpEnabled() && verifier.contact && !(await isContactVerified(verifier.contact, verifierCnic))) {
    return { ok: false, error: "Contact number is not verified." };
  }

  const stockIds = data.items.flatMap((i) => (i.stockId === null ? [] : [i.stockId]));
  const customItems = data.items.filter((i) => i.customSerial !== null);
  const customSerials = customItems.map((i) => i.customSerial!);
  if (new Set(stockIds).size !== stockIds.length || new Set(customSerials).size !== customSerials.length) {
    return { ok: false, error: "A serial number was added twice." };
  }

  try {
    const serial = await db.transaction(async (tx) => {
      // Lock the chosen serials so two vendors/tabs can never issue the same stamp.
      const stock = stockIds.length
        ? await tx
            .select()
            .from(schema.stampStock)
            .where(
              and(
                inArray(schema.stampStock.id, stockIds),
                eq(schema.stampStock.vendorId, user.id),
                eq(schema.stampStock.status, "AVAILABLE"),
              ),
            )
            .for("update")
        : [];
      if (stock.length !== stockIds.length) {
        throw new IssueError("One or more selected serial numbers are no longer available.");
      }

      // Custom serials typed by the vendor go straight into stock as issued; the unique serial rejects reuse.
      const custom = customItems.length
        ? await tx
            .insert(schema.stampStock)
            .values(
              customItems.map((i) => ({
                serial: i.customSerial!,
                denomination: i.denomination,
                vendorId: user.id,
                status: "ISSUED" as const,
              })),
            )
            .onConflictDoNothing()
            .returning()
        : [];
      if (custom.length !== customItems.length) {
        const taken = customSerials.filter((s) => !custom.some((c) => c.serial === s));
        throw new IssueError(`Serial number ${taken.join(", ")} already exists.`);
      }

      const a = data.applicant;
      const applicantValues = {
        name: a.name || null,
        cnic: a.cnic || null,
        relation: a.relation || null,
        relationName: a.relationName || null,
        contact: a.contact || null,
        email: a.email || null,
        address: a.address || null,
        ...(otpEnabled() && data.through === "self" && a.contact ? { contactVerifiedAt: new Date() } : {}),
      };
      const insertApplicant = tx.insert(schema.applicants).values(applicantValues);
      const [applicant] = await (a.cnic
        ? insertApplicant.onConflictDoUpdate({ target: schema.applicants.cnic, set: applicantValues })
        : insertApplicant
      ).returning({ id: schema.applicants.id });

      const issuedAt = issueDateAt(data.issueDate);
      const [txn] = await tx
        .insert(schema.transactions)
        .values({
          vendorId: user.id,
          applicantId: applicant.id,
          agentJson: data.through === "agent" ? agentInfo(data.agent!) : null,
          totalAmount: [...stock, ...custom].reduce((sum, s) => sum + s.denomination, 0),
          issuedAt,
          validUntil: new Date(issuedAt.getTime() + VALIDITY_DAYS * 24 * 60 * 60 * 1000),
        })
        .returning({ id: schema.transactions.id });

      if (stockIds.length) {
        await tx
          .update(schema.stampStock)
          .set({ status: "ISSUED" })
          .where(inArray(schema.stampStock.id, stockIds));
      }

      const customIds = new Map(custom.map((c) => [c.serial, c.id]));
      await tx.insert(schema.transactionItems).values(
        data.items.map((i) => ({
          transactionId: txn.id,
          stockId: i.stockId ?? customIds.get(i.customSerial!)!,
          purposeId: i.purposeId,
          purposeOther: i.purposeId ? null : i.purposeOther || null,
          reason: i.reason || null,
        })),
      );

      await tx.insert(schema.activityLog).values({ userId: user.id, action: `ISSUE_STAMPS txn=${txn.id}` });

      const first = data.items[0];
      return first.customSerial ?? stock.find((s) => s.id === first.stockId)!.serial;
    });
    return { ok: true, serial };
  } catch (err) {
    if (err instanceof IssueError) return { ok: false, error: err.message };
    console.error(err);
    return { ok: false, error: "Could not issue stamps. Please try again." };
  }
}

class IssueError extends Error {}

/** Agent details as stored on the transaction, leaving out fields that were left empty. */
function agentInfo(agent: NonNullable<IssueInput["agent"]>) {
  return Object.fromEntries(Object.entries(agent).filter(([, v]) => v)) as Partial<typeof agent>;
}
