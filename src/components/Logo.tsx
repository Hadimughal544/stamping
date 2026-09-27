import Link from "next/link";

/** Wordmark in the style of the reference site, with our own demo name. */
export function Logo() {
  return (
    <Link href="/" className="inline-block leading-none select-none" aria-label="e-Stamp Demo home">
      <span className="block pl-[128px] text-[9px] font-bold tracking-tight text-white/90">AUTOMATION OF STAMP PAPER</span>
      <span className="flex items-baseline font-logo font-extrabold">
        <span className="text-[72px] leading-[0.8] text-brand-dark [text-shadow:0_0_1px_#1e5c17]">e</span>
        <span className="text-[64px] leading-[0.8] tracking-tight text-white">-Stamping</span>
      </span>
      <span className="mt-1 block text-right text-[13px] font-bold tracking-wide text-white">A  PROJECT OF BOARD OF REVENUE</span>
      <span className="block text-right text-[11px] font-bold tracking-wide text-white/90">& PUNJAB LAND RECORDS AUTHORITY</span>
    </Link>
  );
}
