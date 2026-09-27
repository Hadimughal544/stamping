import { Breadcrumb, PageTitle } from "@/components/Breadcrumb";
import { Tile } from "@/components/Tile";
import type { TileKind } from "@/components/TileArt";

const tiles: { kind: TileKind; title: string; text: string; href?: string }[] = [
  {
    kind: "challan",
    title: "Generate Challan 32-A",
    text: "Generate Challan Form 32-A for Requesting Re-issuance of Smart Card",
  },
  {
    kind: "adhesive",
    title: "Generate Challan 32-A (Adhesive Stamp)",
    text: "Generate Challan 32-A to buy Adhesive Stamps Through Treasury.",
  },
  { kind: "reprint", title: "Re-print Challan 32-A", text: "Verify or Re-print existing Challan Form 32-A." },
  {
    kind: "cart",
    title: "Generate Challan 32-A (Low Denomination Stamps)",
    text: "Generate Challan 32-A to buy Low Denomination Stamps",
  },
  {
    kind: "handover",
    title: "Low Denomination Stamp Issuance",
    text: "Issue Low Denomination Stamps to Citizen.",
    href: "/issue-stamps",
  },
  { kind: "report", title: "View Reports", text: "View Issued Stamps and Stock Report" },
  {
    kind: "verifyStamp",
    title: "Verify/Re-print Issued Stamp",
    text: "Verify or Re-print existing Issued Low Denomination Stamp",
    href: "/verify-stamp",
  },
  { kind: "verifyChallan", title: "Verify Challan", text: "Verify Challan for Low Denomination Stamp Serials." },
];

export default function DashboardPage() {
  return (
    <>
      <Breadcrumb items={[{ label: "Home" }]} />
      <PageTitle>Stamp Vendor Management Portal</PageTitle>
      <div className="mx-auto mb-20 grid max-w-[1240px] gap-x-6 gap-y-4 px-4 md:grid-cols-2 lg:grid-cols-3">
        {tiles.map((t) => (
          <Tile key={t.kind} {...t} />
        ))}
      </div>
    </>
  );
}
