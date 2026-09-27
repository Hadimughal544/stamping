import "server-only";
import { randomInt } from "node:crypto";
import { and, eq, sql } from "drizzle-orm";
import { db, schema } from "@/db";

/** A new stamp serial such as "ES-LHR-482917365" (9 random digits). */
export function generateSerial() {
  return `PB-LHR-${randomInt(0, 1_000_000_000).toString().padStart(9, "0")}`;
}

/**
 * Makes sure the vendor has at least `min` unissued serials of this denomination, generating new
 * random ones when short. A rare serial collision is skipped; the next call tops up again.
 */
export async function ensureStock(vendorId: number, denomination: number, min = 50) {
  const { stampStock } = schema;
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(stampStock)
    .where(
      and(eq(stampStock.vendorId, vendorId), eq(stampStock.denomination, denomination), eq(stampStock.status, "AVAILABLE")),
    );
  if (count >= min) return;

  await db
    .insert(stampStock)
    .values(Array.from({ length: min - count }, () => ({ serial: generateSerial(), denomination, vendorId })))
    .onConflictDoNothing();
}
