import { SectionCard } from "@/components/SectionCard";
import type { PersonDraft } from "./PersonFields";
import type { AgentDraft } from "./AgentFields";
import type { DraftItem } from "./StampDetails";

function AgentTable({ agent }: { agent: AgentDraft }) {
  return (
    <div className="overflow-x-auto">
      <table className="data-table">
        <thead>
          <tr>
            <th>Agent Name</th>
            <th>Agent CNIC</th>
            <th>Agent Contact</th>
            <th>Agent Email</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{agent.name}</td>
            <td>{agent.cnic}</td>
            <td>{agent.contact}</td>
            <td>{agent.email || "-"}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function PersonTable({ person }: { person: PersonDraft }) {
  return (
    <div className="overflow-x-auto">
      <table className="data-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>CNIC</th>
            <th>Contact</th>
            <th>Email</th>
            <th>Address</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              {person.name} {person.relation} {person.relationName}
            </td>
            <td>{person.cnic}</td>
            <td>{person.contact}</td>
            <td>{person.email || "-"}</td>
            <td>{person.address}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

type Props = {
  through: "self" | "agent";
  applicant: PersonDraft;
  agent: AgentDraft | null;
  items: DraftItem[];
  busy: boolean;
  onBack: () => void;
  onConfirm: () => void;
};

export function Confirmation({ through, applicant, agent, items, busy, onBack, onConfirm }: Props) {
  const total = items.reduce((s, i) => s + i.denomination, 0);

  return (
    <div className="mx-auto max-w-[1390px]">
      <SectionCard title="Total Payable Amount" icon="users">
        <div className="mb-8 grid gap-4 px-5 text-[17px] md:grid-cols-2">
          <div>
            <p className="font-bold">Total Payable Amount (Rs.):</p>
            <p className="pl-2">{total}</p>
          </div>
          <div>
            <p className="font-bold">No. Of Stamps:</p>
            <p className="pl-2">{items.length}</p>
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
              {items.map((it, i) => (
                <tr key={it.stockId}>
                  <td>{i + 1}</td>
                  <td>{it.serial}</td>
                  <td>{it.denomination}</td>
                  <td>{it.purposeLabel}</td>
                  <td>{it.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <SectionCard title="Applicant Information" icon="user">
        <PersonTable person={applicant} />
      </SectionCard>

      {through === "agent" && agent && (
        <SectionCard title="Agent Information" icon="user">
          <AgentTable agent={agent} />
        </SectionCard>
      )}

      <div className="mb-16 flex justify-end gap-4 pr-5">
        <button type="button" onClick={onBack} disabled={busy} className="btn-green">
          Back
        </button>
        <button type="button" onClick={onConfirm} disabled={busy} className="btn-green">
          {busy ? "Issuing…" : "Confirm"}
        </button>
      </div>
    </div>
  );
}
