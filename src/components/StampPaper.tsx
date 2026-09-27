import { formatDate, formatDateTime } from "@/lib/stamps";

export type StampPaperProps = {
  serial: string;
  denomination: number;
  purpose: string;
  reason: string;
  applicant: string;
  relation: string;
  agent: string;
  address: string;
  issuedAt: Date;
  validUntil: Date;
  vendor: string;
  barcodeSrc: string;
  qrSrc: string;
  link: string;
  expired?: boolean;
};

/** One A4 e-stamp sheet, shared by the vendor print page and the public scan page. */
export function StampPaper(p: StampPaperProps) {
  return (
    <section className="stamp-paper">
      <div className="stamp-watermark" aria-hidden>
        SPECIMEN – NOT A LEGAL DOCUMENT
        {p.expired && <span className="stamp-watermark-expired">EXPIRED</span>}
      </div>
      <h1 className="stamp-title">E-STAMP</h1>
      <div className="stamp-header">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="stamp-barcode" src={p.barcodeSrc} alt={`Barcode for ${p.serial}`} />
        <div className="stamp-qr-wrap">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="stamp-qr" src={p.qrSrc} alt={`QR code linking to ${p.link}`} />
          <span>Scan for online verification</span>
        </div>
      </div>

      <div className="stamp-details">
        <StampRow label="ID" value={p.serial} />
        <StampRow label="Type" value="Low Denomination" />
        <StampRow label="Amount" value={`Rs ${p.denomination}/-`} />
        <div className="stamp-gap" />
        <StampRow label="Description" value={p.purpose} />
        <StampRow label="Applicant" value={p.applicant} />
        <StampRow label="W/O" value={p.relation} />
        <StampRow label="Agent" value={p.agent} />
        <StampRow label="Address" value={p.address} />
        <StampRow label="Issue Date" value={formatDateTime(p.issuedAt)} />
        <StampRow label="Delisted On/Validity" value={formatDate(p.validUntil)} />
        <StampRow label="Amount in Words" value={`${numberToWords(p.denomination)} Only`} />
        <StampRow label="Reason" value={p.reason} />
        <StampRow label="Vendor Information" value={p.vendor} />
      </div>

      <p className="stamp-notice" dir="rtl">
        نوٹ: یہ ڈاکومنٹ صرف اسٹامپ پیپر کے اجراء کے لئے ہے، اس کی تصدیق آن لائن کی جا سکتی ہے۔
      </p>
    </section>
  );
}

function StampRow({ label, value }: { label: string; value: string }) {
  return <div className="stamp-row"><span>{label} :</span><strong>{value}</strong></div>;
}

function numberToWords(value: number): string {
  const ones = ["Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
  const teens = ["Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  if (value < 10) return ones[value];
  if (value < 20) return teens[value - 10];
  if (value < 100) return `${tens[Math.floor(value / 10)]}${value % 10 ? ` ${ones[value % 10]}` : ""}`;
  if (value < 1000) return `${ones[Math.floor(value / 100)]} Hundred${value % 100 ? ` ${numberToWords(value % 100)}` : ""}`;
  if (value < 100000) return `${numberToWords(Math.floor(value / 1000))} Thousand${value % 1000 ? ` ${numberToWords(value % 1000)}` : ""}`;
  return String(value);
}
