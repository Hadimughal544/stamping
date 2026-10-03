import { config } from "dotenv";
config({ path: ".env.local" });

import bcrypt from "bcryptjs";
import { and, eq, like } from "drizzle-orm";

const PURPOSES: [string, string][] = [
  ["ACKNOWLEDGEMENT", "1"],
  ["ADMINISTRATION BOND", "2"],
  ["AFFIDAVIT", "4"],
  ["AGREEMENT OR MEMORANDUM OF AGREEMENT", "5"],
  ["APPOINTMENT IN EXECUTION OF A POWER", "8"],
  ["APPRAISEMENT OR VALUATION", "9"],
  ["APPRENTICESHIP DEED", "10"],
  ["BILL OF EXCHANGE", "13(a)(i)"],
  ["BILL OF EXCHANGE", "13(b)(i)"],
  ["BILL OF EXCHANGE", "13(b)(ii)"],
  ["BILL OF EXCHANGE", "13(b)(iii)"],
  ["BILL OF LADING", "14"],
  ["BOND", "15"],
  ["CERTIFICATE OR OTHER DOCUMENT", "19"],
  ["CHARTER PARTY", "21"],
  ["COPY OR EXTRACT", "24"],
  ["COUNTERPART OR DUPLICATE", "25"],
  ["DELIVERY ORDER IN RESPECT OF GOODS", "26"],
  ["INDEMNITY BOND", "34"],
  ["LETTER OF CREDIT", "39"],
  ["NOTARIAL ACT", "43"],
  ["POWER OF ATTORNEY", "48"],
  ["RECEIPT", "53"],
];

async function main() {
  // Imported after dotenv so DATABASE_URL is set before the pool is created.
  const { db, schema } = await import("../src/db");

  const passwordHash = await bcrypt.hash("Demo@123", 10);
  let [vendor] = await db.select().from(schema.users).where(eq(schema.users.username, "demo.vendor"));
  if (!vendor) {
    [vendor] = await db
      .insert(schema.users)
      .values({ username: "demo.vendor", passwordHash, displayName: "demo.vendor", vendorCode: "DV-0001" })
      .returning();
    console.log("Created vendor demo.vendor / Demo@123");
  } else {
    console.log("Vendor demo.vendor already exists");
  }

  const existingPurposes = await db.select().from(schema.purposes);
  if (existingPurposes.length === 0) {
    await db.insert(schema.purposes).values(PURPOSES.map(([name, articleCode]) => ({ name, articleCode })));
    console.log(`Inserted ${PURPOSES.length} purposes`);
  }

  // Serials are generated in the browser on the issue form (see src/lib/serial.ts).
  // Clear old unissued DEMO- stock.
  const removed = await db
    .delete(schema.stampStock)
    .where(and(like(schema.stampStock.serial, "DEMO-%"), eq(schema.stampStock.status, "AVAILABLE")))
    .returning({ id: schema.stampStock.id });
  if (removed.length) console.log(`Removed ${removed.length} unissued DEMO- serials`);

  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
