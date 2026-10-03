import { config } from "dotenv";
config({ path: ".env.local" });

import { randomInt } from "node:crypto";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { VENDORS } from "../src/lib/vendors";

// No look-alike characters (0/O, 1/l/I).
const UPPER = "ABCDEFGHJKLMNPQRSTUVWXYZ";
const LOWER = "abcdefghijkmnpqrstuvwxyz";
const DIGITS = "23456789";
const SYMBOLS = "@#$%&*";

/** A random 12-character password with at least one upper, lower, digit and symbol. */
function generatePassword(length = 12) {
  const all = UPPER + LOWER + DIGITS + SYMBOLS;
  const chars = [UPPER, LOWER, DIGITS, SYMBOLS].map((set) => set[randomInt(set.length)]);
  while (chars.length < length) chars.push(all[randomInt(all.length)]);
  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join("");
}

/**
 * Creates a login for each vendor in VENDORS, or resets its password if it already exists
 * (which also signs out its open session). Passwords are printed once and not stored anywhere.
 */
async function main() {
  // Imported after dotenv so DATABASE_URL is set before the pool is created.
  const { db, schema } = await import("../src/db");
  const { users } = schema;

  const rows = [];
  for (const v of VENDORS) {
    const password = generatePassword();
    const values = { passwordHash: await bcrypt.hash(password, 10), displayName: v.name, vendorCode: v.code };
    const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.username, v.username));
    if (existing) {
      await db.update(users).set({ ...values, activeSessionId: null }).where(eq(users.id, existing.id));
    } else {
      await db.insert(users).values({ username: v.username, ...values });
    }
    rows.push({ username: v.username, password, vendor: `${v.name} | ${v.code} | ${v.office}`, status: existing ? "password reset" : "created" });
  }

  console.table(rows);
  console.log("Save these passwords now; they are not stored anywhere else.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
