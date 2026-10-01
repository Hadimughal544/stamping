import { redirect } from "next/navigation";

/** Older printed stamps link here; the public verification page now lives at /verify-stamp. */
export default async function StampScanPage({ params }: { params: Promise<{ serial: string }> }) {
  const serial = decodeURIComponent((await params).serial);
  redirect(`/verify-stamp?serial=${encodeURIComponent(serial)}`);
}
