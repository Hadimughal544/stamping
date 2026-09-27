"use client";

import { TextField } from "@/components/Fields";
import { CNIC_MASK, CONTACT_MASK, type Agent } from "@/lib/validators";

export type AgentDraft = { [K in keyof Agent]: string };
export type AgentErrors = Partial<Record<keyof Agent, string>>;

export const emptyAgent: AgentDraft = { name: "", cnic: "", contact: "", email: "" };

export function AgentFields({
  value,
  onChange,
  errors,
}: {
  value: AgentDraft;
  onChange: (v: AgentDraft) => void;
  errors: AgentErrors;
}) {
  const set = (k: keyof AgentDraft) => (v: string) => onChange({ ...value, [k]: v });

  return (
    <div className="mx-auto mt-2 grid max-w-[1030px] gap-x-[330px] gap-y-5 max-lg:gap-x-12 md:grid-cols-2">
      <TextField label="Agent Name" value={value.name} onChange={set("name")} error={errors.name} />
      <TextField label="Agent CNIC" value={value.cnic} onChange={set("cnic")} mask={CNIC_MASK} error={errors.cnic} />
      <TextField label="Agent Contact" value={value.contact} onChange={set("contact")} mask={CONTACT_MASK} error={errors.contact} />
      <TextField label="Agent Email" type="email" value={value.email} onChange={set("email")} error={errors.email} />
    </div>
  );
}
