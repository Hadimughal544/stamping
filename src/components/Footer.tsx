import { DummyLink } from "./DummyLink";

const columns: { title: string; links: string[] }[] = [
  { title: "About Us", links: ["e-Stamping", "Privacy Policy"] },
  { title: "Help", links: ["FAQs", "User Guide ( Urdu , English )"] },
  { title: "Contact Us", links: ["support@estamp-portal.example"] },
];

function Seal() {
  return (
    <svg viewBox="0 0 56 56" className="h-13 w-13" fill="none" stroke="currentColor" aria-hidden>
      <circle cx="28" cy="28" r="26" strokeWidth="1.5" />
      <circle cx="28" cy="28" r="20" strokeWidth="1" />
      <circle cx="28" cy="28" r="9" strokeWidth="1.5" />
      <path d="M28 8v6M28 42v6M8 28h6M42 28h6" strokeWidth="1.5" />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="no-print bg-footer pt-4 pb-4 text-white">
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
        <div className="mt-5 flex items-center justify-center gap-3">
          <Seal />
          <span dir="rtl" lang="ur" className="text-[17px]">
            ای اسٹامپ پورٹل
          </span>
          <Seal />
        </div>
        <p className="mt-2 text-center text-[14px]">© Copyrights 2026 , All Rights Reserved</p>
      </div>
    </footer>
  );
}
