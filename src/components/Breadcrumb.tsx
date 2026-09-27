import Link from "next/link";

/** The grey strip under the header. Pass no items for an empty strip (login page). */
export function Breadcrumb({ items = [] }: { items?: { label: string; href?: string }[] }) {
  return (
    <div className="no-print flex min-h-[31px] items-center bg-crumb px-5 text-[17px] text-[#222]">
      {items.map((item, i) => (
        <span key={item.label}>
          {i > 0 && <span className="mx-1">&gt;</span>}
          {item.href ? (
            <Link href={item.href} className="hover:underline">
              {item.label}
            </Link>
          ) : (
            item.label
          )}
        </span>
      ))}
    </div>
  );
}

export function PageTitle({ children }: { children: React.ReactNode }) {
  return <h1 className="mt-10 mb-12 text-center font-serif text-[36px] text-[#111]">{children}</h1>;
}
