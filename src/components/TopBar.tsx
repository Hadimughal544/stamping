import Link from "next/link";

export function TopBar() {
  return (
    <div className="flex h-[38px] items-center gap-1 bg-top-bar px-8 text-[15px] text-[#222]">
      <Link href="/" aria-label="Home" className="grid h-6 w-6 place-items-center rounded bg-[#c9d6e8]">
        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-[#3b73c4]">
          <path d="M12 3 2 12h3v8h5v-6h4v6h5v-8h3z" />
        </svg>
      </Link>
      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-[#222]" aria-hidden>
        <path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 0 1 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1z" />
      </svg>
      <span>HELPLINE: (042) 111-22-22-77 (Monday to Saturday 8:00 AM - 5:00 PM)</span>
    </div>
  );
}
