import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getTransaction, isLowDenomination, stampPaperProps } from "@/lib/stamps";
import { getBaseUrl } from "@/lib/url";
import { StampPaper } from "@/components/StampPaper";
import { LowStampPaper } from "@/components/LowStampPaper";
import { AutoPrint } from "./AutoPrint";

export default async function PrintPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();
  const txn = await getTransaction({ id }, user.id);
  if (!txn) notFound();

  // Each QR opens the stamp paper (below Rs 500) or the public verification page.
  const base = await getBaseUrl();
  const sheets = await Promise.all(txn.items.map((it) => stampPaperProps(txn, it, base)));

  return (
    <main className="stamp-print-root bg-white text-black">
      <AutoPrint />
      {sheets.map((p) =>
        isLowDenomination(p.denomination) ? <LowStampPaper key={p.serial} {...p} /> : <StampPaper key={p.serial} {...p} />,
      )}
    </main>
  );
}
