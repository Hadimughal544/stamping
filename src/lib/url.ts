import "server-only";
import { headers } from "next/headers";

/**
 * Absolute base URL of the site, used in QR codes. Set APP_URL when the address a phone should open
 * differs from the one in the browser (e.g. a LAN IP instead of localhost, or the deployed domain).
 */
export async function getBaseUrl() {
  if (process.env.APP_URL) return process.env.APP_URL.replace(/\/+$/, "");
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}
