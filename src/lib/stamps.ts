import "server-only";
import { and, asc, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { renderStampCodes } from "@/lib/stampCodes";
import type { StampPaperProps } from "@/components/StampPaper";

export type TransactionDetails = NonNullable<Awaited<ReturnType<typeof getTransaction>>>;

/**
 * Loads a transaction (found by id or by any of its serials) with its stamps and applicant.
 * Scoped to the vendor when `vendorId` is given; unscoped for the public QR verification page.
 */
export async function getTransaction(by: { id: number } | { serial: string }, vendorId?: number) {
  const { transactions, transactionItems, stampStock, applicants, purposes, users } = schema;

  let txnId: number;
  if ("id" in by) {
    txnId = by.id;
  } else {
    const [hit] = await db
      .select({ txnId: transactionItems.transactionId })
      .from(transactionItems)
      .innerJoin(stampStock, eq(stampStock.id, transactionItems.stockId))
      .where(eq(stampStock.serial, by.serial.trim().toUpperCase()));
    if (!hit) return null;
    txnId = hit.txnId;
  }

  const [txn] = await db
    .select({
      txn: transactions,
      applicant: applicants,
      vendor: { displayName: users.displayName, vendorCode: users.vendorCode },
    })
    .from(transactions)
    .innerJoin(applicants, eq(applicants.id, transactions.applicantId))
    .innerJoin(users, eq(users.id, transactions.vendorId))
    .where(and(eq(transactions.id, txnId), vendorId === undefined ? undefined : eq(transactions.vendorId, vendorId)));
  if (!txn) return null;

  const items = await db
    .select({
      serial: stampStock.serial,
      denomination: stampStock.denomination,
      purposeName: purposes.name,
      articleCode: purposes.articleCode,
      purposeOther: transactionItems.purposeOther,
      reason: transactionItems.reason,
    })
    .from(transactionItems)
    .innerJoin(stampStock, eq(stampStock.id, transactionItems.stockId))
    .leftJoin(purposes, eq(purposes.id, transactionItems.purposeId))
    .where(eq(transactionItems.transactionId, txnId))
    .orderBy(asc(transactionItems.id));

  return {
    ...txn.txn,
    applicant: txn.applicant,
    vendor: txn.vendor,
    items: items.map((i) => ({
      ...i,
      purpose: i.purposeName ? `${i.purposeName} - ${i.articleCode}` : (i.purposeOther ?? "").toUpperCase(),
    })),
  };
}

/** Stamps below Rs 500 use the low-denomination design, and their QR opens the stamp paper itself. */
export const isLowDenomination = (denomination: number) => denomination < 500;

/** What a stamp's QR opens: the public stamp paper for low denominations, otherwise the verification page. */
export function stampLink(base: string, serial: string, denomination: number) {
  const s = encodeURIComponent(serial);
  return isLowDenomination(denomination) ? `${base}/stamp/${s}` : `${base}/verify-stamp?serial=${s}`;
}

/** Everything one stamp sheet shows, for the print page and the public scan page. */
export async function stampPaperProps(
  txn: TransactionDetails,
  item: TransactionDetails["items"][number],
  base: string,
): Promise<StampPaperProps> {
  const link = stampLink(base, item.serial, item.denomination);
  const a = txn.applicant;
  return {
    serial: item.serial,
    denomination: item.denomination,
    purpose: item.purpose,
    reason: item.reason ?? "",
    applicant: a.cnic ? `${a.name ?? ""} [${a.cnic}]` : (a.name ?? ""),
    relationLabel: a.relation ?? "",
    relationName: a.relationName ?? "",
    agent: txn.agentJson?.name || "Self",
    address: a.address ?? "",
    issuedAt: txn.issuedAt,
    validUntil: txn.validUntil,
    vendor: `${txn.vendor.displayName} | ${txn.vendor.vendorCode}`,
    link,
    expired: txn.validUntil < new Date(),
    ...(await renderStampCodes(item.serial, link)),
  };
}

/** Only the last comma-separated part of an address (usually the city), for public pages. */
export function publicAddress(address: string | null) {
  const parts = (address ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  return parts.length > 1 ? parts[parts.length - 1] : "—";
}

/** "35202-1234567-1" → "35202-*******-1" */
export function maskCnic(cnic: string | null) {
  return (cnic ?? "").replace(/^(\d{5})-\d{7}-(\d)$/, "$1-*******-$2");
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const PKT_OFFSET_MS = 5 * 60 * 60 * 1000; // Pakistan time is UTC+5 all year.

/** "21-Sep-2026 10:14:10 AM" style, in Pakistan time; `padHour: false` gives "1:20:31 PM" instead of "01:20:31 PM". */
export function formatDateTime(d: Date, { padHour = true } = {}) {
  const t = new Date(d.getTime() + PKT_OFFSET_MS);
  const pad = (n: number) => String(n).padStart(2, "0");
  const h = t.getUTCHours();
  return (
    `${pad(t.getUTCDate())}-${MONTHS[t.getUTCMonth()]}-${t.getUTCFullYear()} ` +
    `${padHour ? pad(h % 12 || 12) : h % 12 || 12}:${pad(t.getUTCMinutes())}:${pad(t.getUTCSeconds())} ${h < 12 ? "AM" : "PM"}`
  );
}

export function formatDate(d: Date) {
  return formatDateTime(d).split(" ")[0];
}

/**
 * Issue time for a new transaction: now when no date is given, otherwise the chosen calendar
 * day (Pakistan time) at the current Pakistan time of day.
 */
export function issueDateAt(date: string) {
  const now = new Date();
  if (!date) return now;
  const [y, m, d] = date.split("-").map(Number);
  const dayMs = 24 * 60 * 60 * 1000;
  const timeOfDay = (now.getTime() + PKT_OFFSET_MS) % dayMs;
  return new Date(Date.UTC(y, m - 1, d) + timeOfDay - PKT_OFFSET_MS);
}
