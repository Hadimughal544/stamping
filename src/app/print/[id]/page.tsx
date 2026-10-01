import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getTransaction } from "@/lib/stamps";
import { renderStampCodes } from "@/lib/stampCodes";
import { getBaseUrl } from "@/lib/url";
import { StampPaper } from "@/components/StampPaper";
import { AutoPrint } from "./AutoPrint";

export default async function PrintPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();
  const txn = await getTransaction({ id }, user.id);
  if (!txn) notFound();

  // Each QR opens that stamp's public verification page.
  const base = await getBaseUrl();
  const links = txn.items.map((it) => `${base}/verify-stamp?serial=${encodeURIComponent(it.serial)}`);
  const codes = await Promise.all(txn.items.map((it, i) => renderStampCodes(it.serial, links[i])));
  const a = txn.applicant;

  return (
    <main className="stamp-print-root bg-white text-black">
      <AutoPrint />
      {txn.items.map((it, i) => (
        <StampPaper
          key={it.serial}
          serial={it.serial}
          denomination={it.denomination}
          purpose={it.purpose}
          reason={it.reason ?? ""}
          applicant={a.cnic ? `${a.name ?? ""} [${a.cnic}]` : (a.name ?? "")}
          relationLabel={a.relation ?? ""}
          relationName={a.relationName ?? ""}
          agent={txn.agentJson?.name || "Self"}
          address={a.address ?? ""}
          issuedAt={txn.issuedAt}
          validUntil={txn.validUntil}
          vendor={`${user.displayName} | ${user.username}`}
          link={links[i]}
          {...codes[i]}
        />
      ))}
    </main>
  );
}
