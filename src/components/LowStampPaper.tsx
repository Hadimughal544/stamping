import { Carlito, Noto_Naskh_Arabic } from "next/font/google";
import { formatDate, formatDateTime } from "@/lib/stamps";
import { numberToWords, type StampPaperProps } from "@/components/StampPaper";

// Carlito has the same metrics as Calibri, the face on the original sheet; used where Calibri isn't installed.
const carlito = Carlito({ variable: "--font-carlito", weight: ["400", "700"], subsets: ["latin"] });
const naskh = Noto_Naskh_Arabic({ variable: "--font-naskh", weight: "400", subsets: ["arabic"] });

/** The A4 sheet for stamps below Rs 500, shared by the vendor print page and the public scan page. */
export function LowStampPaper(p: StampPaperProps) {
  return (
    <section className={`stamp-paper stamp-low ${carlito.variable} ${naskh.variable}`}>
      <h1 className="stamp-low-title">E-STAMP</h1>

      <div className="stamp-low-header">
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="stamp-low-barcode" src={p.barcodeSrc} alt={`Barcode for ${p.serial}`} />
          <Row label="ID" value={p.serial} bold />
          <Row label="Type" value="Low Denomination" bold />
          <Row label=" Amount" value={`Rs ${p.denomination}/-`} bold shift />
        </div>
        <div className="stamp-low-qr-wrap">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="stamp-low-qr" src={p.qrSrc} alt={`QR code linking to ${p.link}`} />
          <span>Scan for online verification</span>
        </div>
      </div>

      <div className="stamp-low-gap" />
      <Row label="Description" value={p.purpose} small />
      <Row label="Applicant" value={p.applicant} />
      <Row label={p.relationLabel || "S/O"} value={p.relationName} indent />
      <Row label="Agent" value={p.agent} />
      <Row label="Address" value={p.address} />
      <Row label="Issue Date" value={formatDateTime(p.issuedAt, { padHour: false })} />
      <Row label="Delisted On/Validity" value={formatDate(p.validUntil)} />
      <Row label="Amount in Words" value={`${numberToWords(p.denomination)} Rupees Only`} />
      <Row label="Reason" value={p.reason} />
      <Row label="Vendor Information" value={p.vendor} indent />

      <div className="stamp-low-notice" dir="rtl" lang="ur">
        نوٹ: یہ ٹرانزیکشن تاریخ اجراء سے سات دنوں تک کے لیے قابل استعمال ہے۔ای اسٹامپ کی تصدیق بذریعہ ویب سائٹ/کیو آر کوڈ سے کی
        جا سکتی ہے۔
      </div>
    </section>
  );
}

type RowProps = { label: string; value: string; bold?: boolean; small?: boolean; indent?: boolean; shift?: boolean };

/** One "Label : value" line. A label starting with a space is indented, as on the reference sheet. */
function Row({ label, value, bold, small, indent, shift }: RowProps) {
  const cls = ["stamp-low-value", bold && "is-bold", small && "is-small", indent && "is-indent", shift && "is-shifted"]
    .filter(Boolean)
    .join(" ");
  return (
    <div className="stamp-low-row">
      <span className={label.startsWith(" ") ? "is-indent" : undefined}>{label.trim()} :</span>
      <span className={cls}>{value}</span>
    </div>
  );
}
