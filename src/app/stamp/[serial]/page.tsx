import type { Metadata } from "next";
import { getStampBySerial, maskCnic, publicAddress } from "@/lib/stamps";
import { renderStampCodes } from "@/lib/stampCodes";
import { getBaseUrl } from "@/lib/url";
import { StampPaper } from "@/components/StampPaper";

export const metadata: Metadata = { title: "Stamp Verification", robots: { index: false } };

/**
 * Public page opened by scanning the QR code on a printed stamp. No login and no site chrome: only
 * the stamp paper, with personal data reduced (CNIC masked, only the city of the address).
 */
export default async function StampScanPage({ params }: { params: Promise<{ serial: string }> }) {
  const serial = decodeURIComponent((await params).serial);
  const stamp = await getStampBySerial(serial);

  if (!stamp) {
    return (
      <main className="stamp-print-root flex items-start justify-center px-4">
        <div className="mt-16 max-w-md bg-white px-8 py-10 text-center text-black">
          <p className="text-[18px] font-bold">No issued stamp found against this serial number.</p>
          <p className="mt-2 break-all text-[14px] text-muted">{serial}</p>
        </div>
      </main>
    );
  }

  const link = `${await getBaseUrl()}/stamp/${encodeURIComponent(stamp.serial)}`;
  const codes = await renderStampCodes(stamp.serial, link);

  return (
    <main className="stamp-print-root stamp-scale bg-white text-black">
      <StampPaper
        serial={stamp.serial}
        denomination={stamp.denomination}
        purpose={stamp.purpose}
        reason={stamp.reason}
        applicant={`${stamp.applicantName} [${maskCnic(stamp.cnic)}]`}
        relation={`${stamp.relation} ${stamp.relationName}`}
        agent={stamp.agent?.name ?? "Self"}
        address={publicAddress(stamp.address)}
        issuedAt={stamp.issuedAt}
        validUntil={stamp.validUntil}
        vendor={`${stamp.vendorName} | ${stamp.vendorUsername}`}
        expired={stamp.validUntil < new Date()}
        link={link}
        {...codes}
      />
    </main>
  );
}
