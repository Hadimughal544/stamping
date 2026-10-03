import Link from "next/link";
import { redirect } from "next/navigation";
import { Roboto, Roboto_Condensed } from "next/font/google";
import { formatDate, formatDateTime, getTransaction, isLowDenomination } from "@/lib/stamps";
import { numberToWords } from "@/components/StampPaper";
import { Logo } from "@/components/Logo";
import { Footer } from "@/components/Footer";

const roboto = Roboto({ weight: ["400", "700"], subsets: ["latin"] });
const robotoCondensed = Roboto_Condensed({ weight: "500", subsets: ["latin"] });

/**
 * Public "eStamp Online Verification" page a low-denomination stamp's QR opens. Other stamps,
 * unknown serials and older printed QRs go to the verification page.
 */
export default async function StampScanPage({ params }: { params: Promise<{ serial: string }> }) {
  const serial = decodeURIComponent((await params).serial).trim().toUpperCase();
  const txn = await getTransaction({ serial });
  const item = txn?.items.find((it) => it.serial === serial);
  if (!txn || !item || !isLowDenomination(item.denomination)) {
    redirect(`/verify-stamp?serial=${encodeURIComponent(serial)}`);
  }

  const a = txn.applicant;
  const rows: [string, string][] = [
    ["eStamp ID", item.serial],
    ["Type", "Low Denomination"],
    ["Amount", `Rs ${item.denomination}/-`],
    ["Description", item.purpose],
    ["Applicant", a.cnic ? `${a.name ?? ""} [${a.cnic}]` : (a.name ?? "")],
    [a.relation || "S/O", a.relationName ?? ""],
    ["Address", a.address ?? ""],
    ["Issue Date", formatDateTime(txn.issuedAt)],
    ["Delisted on/Validity", formatDate(txn.validUntil)],
    ["Amount in Words", `${numberToWords(item.denomination)} Rupees Only`],
    ["Reason", item.reason ?? ""],
    ["Vendor Information", `${txn.vendor.displayName} | ${txn.vendor.vendorCode}`],
  ];

  return (
    <div className={`flex min-h-screen flex-col bg-[#f5f5f5] ${roboto.className}`}>
      <header className="min-h-[137px] bg-brand px-5 pt-5 pb-4">
        <Logo />
      </header>
      <nav className="flex h-8 items-center bg-[#e6e6e6] pl-[19px] text-[17px] text-[#222]">
        <Link href="/" className="hover:underline">
          Home
        </Link>
      </nav>

      <main className="mx-auto w-full max-w-[1425px] flex-1 px-4 pt-[76px] pb-12 md:w-3/4 md:px-0">
        <h1 className={`mb-[13px] text-[27.6px] leading-tight font-medium text-[#333] ${robotoCondensed.className}`}>
          eStamp Online Verification
        </h1>
        <table className="verify-table">
          <tbody>
            {rows.map(([label, value]) => (
              <tr key={label}>
                <th scope="row">{label}</th>
                <td>{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>

      <Footer />
    </div>
  );
}
