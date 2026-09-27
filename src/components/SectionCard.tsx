export type SectionIcon = "user" | "users" | "search";

const icons: Record<SectionIcon, React.ReactNode> = {
  user: <path d="M12 12a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9Zm-7 9c0-4.4 3.1-7 7-7s7 2.6 7 7z" />,
  users: (
    <path d="M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm8 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3 20c0-3.6 2.7-6 6-6s6 2.4 6 6zm13.5 0c0-2.2-.8-4.1-2.1-5.4.8-.4 1.6-.6 2.6-.6 2.8 0 5 2 5 5v1z" />
  ),
  search: (
    <path d="M10 3a7 7 0 0 1 5.6 11.2l5.1 5.1-1.4 1.4-5.1-5.1A7 7 0 1 1 10 3Zm0 2.2a4.8 4.8 0 1 0 0 9.6 4.8 4.8 0 0 0 0-9.6Z" />
  ),
};

export function SectionCard({
  title,
  icon,
  children,
  className = "",
}: {
  title: string;
  icon: SectionIcon;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`mb-5 bg-card ${className}`}>
      <div className="flex items-center gap-3 bg-[#ececec] px-3 py-2.5">
        <svg viewBox="0 0 24 24" className="h-6 w-6 fill-[#222]" aria-hidden>
          {icons[icon]}
        </svg>
        <h2 className="font-serif text-[25px] text-[#222]">{title}</h2>
      </div>
      <div className="px-8 py-8 max-sm:px-4">{children}</div>
    </section>
  );
}
