import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { formatDate, formatDateTime, getTransaction, maskCnic, publicAddress, type TransactionDetails } from "@/lib/stamps";
import { Breadcrumb, PageTitle } from "@/components/Breadcrumb";
import { SectionCard } from "@/components/SectionCard";

/**
 * Logged-in vendors get the search form and the full transaction (their own only). Anyone else, e.g.
 * someone who scanned a stamp's QR code, sees only that stamp, with the CNIC masked and no search.
 */
export default async function VerifyStampPage({ searchParams }: { searchParams: Promise<{ serial?: string }> }) {
  const user = await getCurrentUser();
  const serial = (await searchParams).serial?.trim() ?? "";
  const found = serial ? await getTransaction({ serial }, user?.id) : null;
  // The public view shows only the scanned stamp, not the rest of the transaction.
  const txn =
    found && !user ? { ...found, items: found.items.filter((it) => it.serial === serial.toUpperCase()) } : found;

  if (!user && !serial) {
    return (
      <>
        <PageTitle>Verify Issued Low Denomination Stamp</PageTitle>
        <div className="mx-auto max-w-[1338px] px-4 pb-16">
          <p className="font-serif text-[22px] text-danger">Invalid verification link.</p>
        </div>
      </>
    );
  }

  return (
    <>
      {user && <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Verify/Re-print Issued Stamp" }]} />}
      <PageTitle>{user ? "Verify/Re-print Issued Low Denomination Stamp" : "Verify Issued Low Denomination Stamp"}</PageTitle>

      <div className="mx-auto max-w-[1338px] px-4">
        {user ? (
          <SectionCard title="Search Stamp Serial" icon="search">
            <form method="get" className="flex flex-wrap items-end gap-x-[88px] gap-y-4">
              <label className="w-[350px] max-w-full">
                <span className="u-label">Enter Stamp Serial Number</span>
                <input name="serial" defaultValue={serial} required className="u-field uppercase" />
              </label>
              <button type="submit" className="btn-green normal-case">
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-white" aria-hidden>
                  <path d="M10 3a7 7 0 0 1 5.6 11.2l5.1 5.1-1.4 1.4-5.1-5.1A7 7 0 1 1 10 3Zm0 2.2a4.8 4.8 0 1 0 0 9.6 4.8 4.8 0 0 0 0-9.6Z" />
                </svg>
                SEARCH
              </button>
            </form>
            <SearchResult serial={serial} txn={txn} />
          </SectionCard>
        ) : (
          <div className="mb-8">
            <SearchResult serial={serial} txn={txn} />
          </div>
        )}

        {txn && (
          <>
            <SectionCard title="Total Payable Amount" icon="users">
              <div className="mb-14 grid gap-y-2 px-5 text-[17px] md:grid-cols-2">
                <div>
                  <p className="font-bold">Total Payable Amount (Rs.):</p>
                  <p className="pl-2">{user ? txn.totalAmount : txn.items.reduce((s, it) => s + it.denomination, 0)}</p>
                  <p className="mt-1 font-bold">Issue Date:</p>
                  <p className="pl-2">{formatDateTime(txn.issuedAt)}</p>
                </div>
                <div>
                  <p className="font-bold">Stamp Status:</p>
                  <p className="pl-2">{txn.validUntil < new Date() ? "Stamp Expired" : "Stamp Issued"}</p>
                  <p className="mt-1 font-bold">Stamp Delisted On / Validity:</p>
                  <p className="pl-2">{formatDate(txn.validUntil)}</p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Sr. #</th>
                      <th>Stamp Serial Number</th>
                      <th>Denomination</th>
                      <th>Purpose</th>
                      <th>Reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    {txn.items.map((it, i) => (
                      <tr key={it.serial}>
                        <td>{i + 1}</td>
                        <td>{it.serial}</td>
                        <td>{it.denomination}</td>
                        <td>{it.purpose || "-"}</td>
                        <td>{it.reason || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </SectionCard>

            <SectionCard title="Applicant Information" icon="user">
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>CNIC</th>
                      <th>Address</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        {[txn.applicant.name, txn.applicant.relation, txn.applicant.relationName].filter(Boolean).join(" ") ||
                          "-"}
                      </td>
                      <td>{(user ? txn.applicant.cnic : maskCnic(txn.applicant.cnic)) || "-"}</td>
                      <td>{user ? txn.applicant.address || "-" : publicAddress(txn.applicant.address)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </SectionCard>

            {user && (
              <div className="mb-14 flex justify-end pr-5">
                <Link href={`/print/${txn.id}`} target="_blank" className="btn-green">
                  Print Application
                </Link>
              </div>
            )}
          </>
        )}
      </div>
      {!txn && <div className="h-16" />}
    </>
  );
}

function SearchResult({ serial, txn }: { serial: string; txn: TransactionDetails | null }) {
  if (serial && !txn) {
    return <p className="mt-10 font-serif text-[22px] text-danger">No issued stamp found against this serial number.</p>;
  }
  if (!txn) return null;
  return (
    <p className="mt-10 font-serif text-[22px] tracking-tight text-danger">
      Transaction is valid for one week from its Date of Issuance. ({formatDateTime(txn.issuedAt)})
    </p>
  );
}
