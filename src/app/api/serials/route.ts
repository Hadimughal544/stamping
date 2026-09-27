import { NextResponse, type NextRequest } from "next/server";
import { and, asc, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { getCurrentUser } from "@/lib/auth";
import { ensureStock } from "@/lib/serial";

/** GET /api/serials?denomination=N → available serials of that denomination, generating more when low. */
export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const denomination = Number(req.nextUrl.searchParams.get("denomination"));
  if (!Number.isInteger(denomination) || denomination < 1 || denomination > 99999) {
    return NextResponse.json({ error: "Invalid denomination" }, { status: 400 });
  }

  await ensureStock(user.id, denomination);

  const { stampStock } = schema;
  const serials = await db
    .select({ id: stampStock.id, serial: stampStock.serial })
    .from(stampStock)
    .where(
      and(eq(stampStock.vendorId, user.id), eq(stampStock.status, "AVAILABLE"), eq(stampStock.denomination, denomination)),
    )
    .orderBy(asc(stampStock.id))
    .limit(100);
  return NextResponse.json({ serials });
}
