import "server-only";
import { createHmac, randomInt, timingSafeEqual } from "node:crypto";
import { and, desc, eq, gt, isNotNull, isNull } from "drizzle-orm";
import { db, schema } from "@/db";

export const OTP_TTL_SECONDS = 5 * 60;
const MAX_ATTEMPTS = 5;
/** How long a verified contact may be used to issue stamps without a new OTP. */
const VERIFIED_WINDOW_SECONDS = 30 * 60;

function hash(code: string) {
  return createHmac("sha256", process.env.AUTH_SECRET ?? "").update(code).digest("hex");
}

/** Placeholder for a real SMS gateway (e.g. Twilio). In this demo the code is only logged. */
async function sendSms(contact: string, message: string) {
  console.log(`[SMS to ${contact}] ${message}`);
}

export type SendResult = { ok: true; resendIn: number; devCode?: string } | { ok: false; error: string };

export async function sendOtp(contact: string): Promise<SendResult> {
  const [latest] = await db
    .select()
    .from(schema.otpCodes)
    .where(and(eq(schema.otpCodes.contact, contact), isNull(schema.otpCodes.consumedAt)))
    .orderBy(desc(schema.otpCodes.createdAt))
    .limit(1);

  // A still-valid code exists: don't send another, just tell the UI how long to wait.
  if (latest && latest.expiresAt > new Date()) {
    return { ok: true, resendIn: Math.ceil((latest.expiresAt.getTime() - Date.now()) / 1000) };
  }

  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
  await db.insert(schema.otpCodes).values({
    contact,
    codeHash: hash(code),
    expiresAt: new Date(Date.now() + OTP_TTL_SECONDS * 1000),
  });
  await sendSms(contact, `Your e-Stamp Demo verification code is ${code}`);

  return {
    ok: true,
    resendIn: OTP_TTL_SECONDS,
    devCode: process.env.NODE_ENV === "production" ? undefined : code,
  };
}

export async function verifyOtp(contact: string, code: string): Promise<boolean> {
  const [latest] = await db
    .select()
    .from(schema.otpCodes)
    .where(
      and(
        eq(schema.otpCodes.contact, contact),
        isNull(schema.otpCodes.consumedAt),
        gt(schema.otpCodes.expiresAt, new Date()),
      ),
    )
    .orderBy(desc(schema.otpCodes.createdAt))
    .limit(1);
  if (!latest || latest.attempts >= MAX_ATTEMPTS) return false;

  const a = Buffer.from(hash(code));
  const b = Buffer.from(latest.codeHash);
  const ok = a.length === b.length && timingSafeEqual(a, b);

  await db
    .update(schema.otpCodes)
    .set(ok ? { consumedAt: new Date() } : { attempts: latest.attempts + 1 })
    .where(eq(schema.otpCodes.id, latest.id));
  return ok;
}

/** True if this contact passed OTP recently, or belongs to an applicant verified earlier with the same CNIC. */
export async function isContactVerified(contact: string, cnic?: string): Promise<boolean> {
  const [recent] = await db
    .select({ id: schema.otpCodes.id })
    .from(schema.otpCodes)
    .where(
      and(
        eq(schema.otpCodes.contact, contact),
        isNotNull(schema.otpCodes.consumedAt),
        gt(schema.otpCodes.consumedAt, new Date(Date.now() - VERIFIED_WINDOW_SECONDS * 1000)),
      ),
    )
    .limit(1);
  if (recent) return true;

  if (!cnic) return false;
  const [applicant] = await db
    .select({ contact: schema.applicants.contact, verifiedAt: schema.applicants.contactVerifiedAt })
    .from(schema.applicants)
    .where(eq(schema.applicants.cnic, cnic));
  return !!applicant?.verifiedAt && applicant.contact === contact;
}
