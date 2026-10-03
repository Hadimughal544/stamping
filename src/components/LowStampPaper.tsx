import type { CSSProperties } from "react";
import { Carlito, Noto_Naskh_Arabic } from "next/font/google";
import { formatDate, formatDateTime } from "@/lib/stamps";
import { numberToWords, type StampPaperProps } from "@/components/StampPaper";

// The original sheet uses Calibri Light/Bold. Carlito has Calibri's metrics, for machines without Calibri.
const carlito = Carlito({ variable: "--font-carlito", weight: ["400", "700"], subsets: ["latin"] });
const naskh = Noto_Naskh_Arabic({ variable: "--font-naskh", weight: "700", subsets: ["arabic"] });

/**
 * One row of the sheet, positioned as on the reference print (CSS px on its 1123px-wide page):
 * label at `labelX`, value at `valueX`, both sitting on `baseline`.
 */
type Line = { label: string; value: string; baseline: number; valueX: number; labelX?: number; bold?: boolean; size?: number };

/** The A4 sheet for stamps below Rs 500, laid out to match the original site's printed stamp. */
export function LowStampPaper(p: StampPaperProps) {
  const lines: Line[] = [
    { label: "ID", value: p.serial, baseline: 181, valueX: 318.47, bold: true },
    { label: "Type", value: "Low Denomination", baseline: 207, valueX: 318.09, bold: true },
    { label: "Amount", value: `Rs ${p.denomination}/-`, baseline: 233, valueX: 318.73, labelX: 128, bold: true },
    { label: "Description", value: p.purpose, baseline: 298, valueX: 321.23, size: 17.1 },
    { label: "Applicant", value: p.applicant, baseline: 324, valueX: 320.89 },
    { label: p.relationLabel || "S/O", value: p.relationName, baseline: 350, valueX: 328.34 },
    { label: "Agent", value: p.agent, baseline: 376, valueX: 322.08 },
    { label: "Address", value: p.address, baseline: 402, valueX: 321.09 },
    { label: "Issue Date", value: formatDateTime(p.issuedAt, { padHour: false }), baseline: 428, valueX: 320.92 },
    { label: "Delisted On/Validity", value: formatDate(p.validUntil), baseline: 454, valueX: 321 },
    { label: "Amount in Words", value: `${numberToWords(p.denomination)} Rupees Only`, baseline: 480, valueX: 320.69 },
    { label: "Reason", value: p.reason, baseline: 506, valueX: 322.5 },
    { label: "Vendor Information", value: p.vendor, baseline: 532, valueX: 322.72 },
  ];

  return (
    <section className={`stamp-paper stamp-low ${carlito.variable} ${naskh.variable}`}>
      <h1 className="stamp-low-title">E-STAMP</h1>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="stamp-low-barcode" src={p.barcodeSrc} alt={`Barcode for ${p.serial}`} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="stamp-low-qr" src={p.qrSrc} alt={`QR code linking to ${p.link}`} />
      <span className="stamp-low-caption">Scan for online verification</span>

      {lines.map((l) => (
        <div key={l.label} className="stamp-low-line" style={{ "--baseline": `${l.baseline}px` } as CSSProperties}>
          <span style={{ left: l.labelX ?? 126 }}>{l.label} :</span>
          <span className={l.bold ? "is-bold" : undefined} style={{ left: l.valueX, fontSize: l.size }}>
            {l.value}
          </span>
        </div>
      ))}

      <div className="stamp-low-notice" dir="rtl" lang="ur">
        نوٹ :یہ ٹرانزیکشن تاریخ اجرا سے سات دنوں تک کے لیےقابل استعمال ہے۔ای اسٹامپ کی تصدیق بذریہ ویب سائٹ،کیوآر کوڈ سے کی جا
        سکتی ہے۔
      </div>
    </section>
  );
}
