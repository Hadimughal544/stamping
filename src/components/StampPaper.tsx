import { formatDate, formatDateTime } from "@/lib/stamps";

export type StampPaperProps = {
  serial: string;
  denomination: number;
  purpose: string;
  reason: string;
  applicant: string;
  relationLabel: string;
  relationName: string;
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
  <div className="stamp-watermark" aria-hidden="true">
    <img src="/images/gov-logo.jpg" alt="" />
  </div>

  {/* existing content */}
        <div className="stamp-heading">
          <h1 className="stamp-title">E-STAMP</h1>
          <h2>(GOVERNMENT OF PUNJAB)</h2>
        </div>
      <div className=" flex items-center gap-15">
        <img className="stamp-emblem" src="/images/gov-logo.jpg" alt="Government of Punjab emblem" />
        <div className="stamp-header-meta">
          <strong>{p.serial}</strong>
          {/* <StampMeta label="PSID" value={p.serial} /> */}
          <StampMeta className="stamp-amount" label="Rs" value={`${p.denomination}/-`} />
          <strong>{numberToWords(p.denomination)} Only</strong>
        </div>
      </div>

      <div className="stamp-details font-bold">
        <StampRow label="Purpose" value={p.purpose} />
        <StampRow label="Applicant" value={p.applicant} />
        <StampRow label={p.relationLabel} value={p.relationName} />
        <StampRow label="Address" value={p.address} />
        <StampRow label="Issue Date" value={formatDateTime(p.issuedAt)} />
        <StampRow label="Delisted On/Validity" value={formatDate(p.validUntil)} />
        <StampRow label="Paid Through Challan" value={p.serial} />
        <StampRow label="Reason" value={p.reason} />
      </div>

      <p className="stamp-notice" dir="rtl">
        نوٹ: یہ ٹرانزیکشن تاریخ اجراء سے سات دنوں تک کے لیے قابل استعمال ہے
        ۔ای اسٹامپ کی تصدیق بذریعہ ویب سائٹ،کیو آر کوڈ سے کی جاسکتی ہے۔
      </p>

      <div className="stamp-write-below">
        <span className="stamp-write-line" />
        <span className="stamp-write-text font-bold">
          Please Write Below This Line
        </span>
        <span className="stamp-write-line" />
      </div>

      <div className="stamp-qr-wrap">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="stamp-qr"
          src={p.qrSrc}
          alt={`QR code linking to ${p.link}`}
        />
      </div>
    </section>
  );
}

function StampMeta({ label, value, className }: { label: string; value: string; className?: string }) {
  return <div className={className}><strong>{label}</strong><strong>{value}</strong></div>;
}

function StampRow({ label, value }: { label: string; value: string }) {
  return <div className="stamp-row"><strong>{label}</strong><strong>: {value}</strong></div>;
}

export function numberToWords(value: number): string {
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
