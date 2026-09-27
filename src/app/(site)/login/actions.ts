"use server";

import { randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db, schema } from "@/db";
import { getCurrentUser, logActivity } from "@/lib/auth";
import { SESSION_COOKIE, SESSION_TTL_SECONDS, signSession } from "@/lib/session";

export type LoginState = { error?: string };

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!username || !password) return { error: "Please enter username and password." };

  const [user] = await db.select().from(schema.users).where(eq(schema.users.username, username));
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return { error: "Invalid username or password." };
  }

  // Single login at a time: a fresh session id replaces any previous one.
  const sid = randomUUID();
  await db.update(schema.users).set({ activeSessionId: sid }).where(eq(schema.users.id, user.id));
  await logActivity(user.id, "LOGIN");

  (await cookies()).set(SESSION_COOKIE, await signSession({ uid: user.id, sid, username: user.username }), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
  redirect("/");
}

export async function logoutAction() {
  const user = await getCurrentUser();
  if (user) {
    await db.update(schema.users).set({ activeSessionId: null }).where(eq(schema.users.id, user.id));
    await logActivity(user.id, "LOGOUT");
  }
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/login");
}
