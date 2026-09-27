"use server";

import { and, eq, inArray } from "drizzle-orm";
import { db, schema } from "@/db";
import { getCurrentUser } from "@/lib/auth";
import { isContactVerified, sendOtp, verifyOtp, type SendResult } from "@/lib/otp";
import { contactSchema, issueSchema, type IssueInput } from "@/lib/validators";

const VALIDITY_DAYS = 7;

/** OTP contact verification is off unless OTP_ENABLED="true" is set in the environment. */
const otpEnabled = () => process.env.OTP_ENABLED === "true";

export type StartVerificationResult = { verified: true } | ({ verified: false } & SendResult);

/** Called on NEXT: skips OTP for an already-verified contact, otherwise sends one. */
export async function startVerification(contact: string, cnic?: string): Promise<StartVerificationResult> {
  if (!(await getCurrentUser())) return { verified: false, ok: false, error: "Session expired. Please log in again." };
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
  const verifierCnic = data.through === "self" ? data.applicant.cnic : undefined;
  if (otpEnabled() && !(await isContactVerified(verifier.contact, verifierCnic))) {
    return { ok: false, error: "Contact number is not verified." };
  }

  const stockIds = data.items.map((i) => i.stockId);
  if (new Set(stockIds).size !== stockIds.length) return { ok: false, error: "A serial number was added twice." };

  try {
    const serial = await db.transaction(async (tx) => {
      // Lock the chosen serials so two vendors/tabs can never issue the same stamp.
      const stock = await tx
        .select()
        .from(schema.stampStock)
        .where(
          and(
            inArray(schema.stampStock.id, stockIds),
            eq(schema.stampStock.vendorId, user.id),
            eq(schema.stampStock.status, "AVAILABLE"),
          ),
        )
        .for("update");
      if (stock.length !== stockIds.length) {
        throw new IssueError("One or more selected serial numbers are no longer available.");
      }

      const a = data.applicant;
      const applicantValues = {
        name: a.name,
        cnic: a.cnic,
        relation: a.relation,
        relationName: a.relationName,
        contact: a.contact,
        email: a.email || null,
        address: a.address,
        ...(otpEnabled() && data.through === "self" ? { contactVerifiedAt: new Date() } : {}),
      };
      const [applicant] = await tx
        .insert(schema.applicants)
        .values(applicantValues)
        .onConflictDoUpdate({ target: schema.applicants.cnic, set: applicantValues })
        .returning({ id: schema.applicants.id });

      const issuedAt = new Date();
      const [txn] = await tx
        .insert(schema.transactions)
        .values({
          vendorId: user.id,
          applicantId: applicant.id,
          agentJson: data.through === "agent" ? { ...data.agent!, email: data.agent!.email || undefined } : null,
          totalAmount: stock.reduce((sum, s) => sum + s.denomination, 0),
          issuedAt,
          validUntil: new Date(issuedAt.getTime() + VALIDITY_DAYS * 24 * 60 * 60 * 1000),
        })
        .returning({ id: schema.transactions.id });

      await tx
        .update(schema.stampStock)
        .set({ status: "ISSUED" })
        .where(inArray(schema.stampStock.id, stockIds));

      await tx.insert(schema.transactionItems).values(
        data.items.map((i) => ({
          transactionId: txn.id,
          stockId: i.stockId,
          purposeId: i.purposeId,
          purposeOther: i.purposeId ? null : i.purposeOther,
          reason: i.reason,
        })),
      );

      await tx.insert(schema.activityLog).values({ userId: user.id, action: `ISSUE_STAMPS txn=${txn.id}` });

      return stock.find((s) => s.id === stockIds[0])!.serial;
    });
    return { ok: true, serial };
  } catch (err) {
    if (err instanceof IssueError) return { ok: false, error: err.message };
    console.error(err);
    return { ok: false, error: "Could not issue stamps. Please try again." };
  }
}

class IssueError extends Error {}
