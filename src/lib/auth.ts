import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { SESSION_COOKIE, verifySession } from "./session";

export type CurrentUser = { id: number; username: string; displayName: string };

/**
 * Returns the logged-in vendor, or null. A token is only valid while its session id
 * matches users.active_session_id, so a newer login elsewhere invalidates this one.
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const session = await verifySession(token);
  if (!session) return null;

  const [user] = await db
    .select({
      id: schema.users.id,
      username: schema.users.username,
      displayName: schema.users.displayName,
      activeSessionId: schema.users.activeSessionId,
    })
    .from(schema.users)
    .where(eq(schema.users.id, session.uid));

  if (!user || user.activeSessionId !== session.sid) return null;
  return { id: user.id, username: user.username, displayName: user.displayName };
}

export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login?expired=1");
  return user;
}

export async function logActivity(userId: number, action: string) {
  await db.insert(schema.activityLog).values({ userId, action });
}
