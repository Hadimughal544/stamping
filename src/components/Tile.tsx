"use client";

import Link from "next/link";
import { TileArt, type TileKind } from "./TileArt";
import { useToast } from "./Toast";

type Props = { kind: TileKind; title: string; text: string; href?: string };

export function Tile({ kind, title, text, href }: Props) {
  const toast = useToast();
  const body = (
    <>
      <TileArt kind={kind} />
      <div className="pt-8">
        <h3 className="text-[18px] leading-[26px] font-bold text-[#222]">{title}</h3>
        <p className="mt-0.5 text-[15px] leading-[23px] text-[#333]">{text}</p>
      </div>
    </>
  );
  const cls = "flex items-start gap-2 text-left transition-transform hover:scale-[1.02] cursor-pointer";

  if (href) {
    return (
      <Link href={href} className={cls}>
        {body}
      </Link>
    );
  }
  return (
    <button type="button" className={cls} onClick={() => toast(`"${title}" is coming soon. Only stamp issuance is live in this demo.`)}>
      {body}
    </button>
  );
}
