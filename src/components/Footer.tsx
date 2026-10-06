import { DummyLink } from "./DummyLink";
import Image from "next/image";
const columns: { title: string; links: string[] }[] = [
  { title: "About Us", links: ["e-Stamping", "Privacy Policy"] },
  { title: "Help", links: ["FAQs", "User Guide ( Urdu , English )"] },
  { title: "Contact Us", links: ["support@estamp-portal.example"] },
];

function Bar() {
  return <span aria-hidden className="mx-3 inline-block h-6 w-0.75 bg-white align-middle" />;
}

export function Footer() {
  return (
    <footer className="no-print bg-[#58585b] pt-4 pb-4 text-white">
      <div className="mx-auto max-w-250 px-4">
        <div className="grid gap-x-8 sm:grid-cols-3">
          {columns.map((col) => (
            <div key={col.title} className="text-center">
              <h3 className="mb-4 text-[20px]">{col.title}</h3>
              {col.links.map((l) => (
                <div key={l} className="border-b border-white/30 py-3 text-[16px]">
                  <DummyLink label={l} />
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="mt-10 border-t border-white/30" />

        {/* Logos + Urdu text row */}
        <div
          dir="ltr"
          className="mt-5 flex flex-wrap items-center justify-center gap-x-3 gap-y-2"
        >
          <Image
            src="/images/PLRA-logo-transparent.png"
            alt="Punjab Land Records Authority"
            width={96}
            height={96}
            unoptimized
            className="h-24 w-auto object-contain"
          />

          <div
            dir="rtl"
            lang="ur"
            className="flex items-center text-[22px] font-semibold whitespace-nowrap"
          >
            <span>حکومت پنجاب</span>
            <Bar />
            <span>پنجاب لینڈ ریکارڈز اتھارٹی</span>
            <Bar />
            <span>بورڈ آف ریونیو</span>
          </div>

          <Image
            src="/images/gov-logo-transparent.png"
            alt="Government of the Punjab"
            width={96}
            height={96}
            unoptimized
            className="h-24 w-auto object-contain"
          />
        </div>

        <p className="-mt-1 text-center text-[20px]">
          © Copyrights 2026 , All Rights Reserved
        </p>
      </div>
    </footer>
  );
}