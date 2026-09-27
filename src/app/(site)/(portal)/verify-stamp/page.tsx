import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { formatDate, formatDateTime, getTransaction } from "@/lib/stamps";
import { Breadcrumb, PageTitle } from "@/components/Breadcrumb";
import { SectionCard } from "@/components/SectionCard";

export default async function VerifyStampPage({ searchParams }: { searchParams: Promise<{ serial?: string }> }) {
  const user = await requireUser();
  const serial = (await searchParams).serial?.trim() ?? "";
  const txn = serial ? await getTransaction({ serial }, user.id) : null;
  const expired = txn ? txn.validUntil < new Date() : false;

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Verify/Re-print Issued Stamp" }]} />
      <PageTitle>Verify/Re-print Issued Low Denomination Stamp</PageTitle>

      <div className="mx-auto max-w-[1338px] px-4">
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

          {serial && !txn && <p className="mt-10 font-serif text-[22px] text-danger">No issued stamp found against this serial number.</p>}
          {txn && (
            <p className="mt-10 font-serif text-[22px] tracking-tight text-danger">
              Transaction is valid for one week from its Date of Issuance. ({formatDateTime(txn.issuedAt)})
            </p>
          )}
        </SectionCard>

        {txn && (
          <>
            <SectionCard title="Total Payable Amount" icon="users">
              <div className="mb-14 grid gap-y-2 px-5 text-[17px] md:grid-cols-2">
                <div>
                  <p className="font-bold">Total Payable Amount (Rs.):</p>
                  <p className="pl-2">{txn.totalAmount}</p>
                  <p className="mt-1 font-bold">Issue Date:</p>
                  <p className="pl-2">{formatDateTime(txn.issuedAt)}</p>
                </div>
                <div>
                  <p className="font-bold">Stamp Status:</p>
                  <p className="pl-2">{expired ? "Stamp Expired" : "Stamp Issued"}</p>
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
                        <td>
                          <Link href={`/stamp/${encodeURIComponent(it.serial)}`} target="_blank" className="text-brand hover:underline">
                            {it.serial}
                          </Link>
                        </td>
                        <td>{it.denomination}</td>
                        <td>{it.purpose}</td>
                        <td>{it.reason}</td>
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
                        {txn.applicant.name} {txn.applicant.relation} {txn.applicant.relationName}
                      </td>
                      <td>{txn.applicant.cnic}</td>
                      <td>{txn.applicant.address}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </SectionCard>

            <div className="mb-14 flex justify-end pr-5">
              <Link href={`/print/${txn.id}`} target="_blank" className="btn-green">
                Print Application
              </Link>
            </div>
          </>
        )}
      </div>
      {!txn && <div className="h-16" />}
    </>
  );
}
