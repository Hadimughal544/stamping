"use client";

import { SelectField, TextField } from "@/components/Fields";
import { CNIC_MASK, CONTACT_MASK, RELATIONS, type Person } from "@/lib/validators";

export type PersonDraft = { [K in keyof Person]: string };
export type PersonErrors = Partial<Record<keyof Person, string>>;

export const emptyPerson: PersonDraft = {
  name: "",
  cnic: "",
  relation: "",
  relationName: "",
  contact: "",
  email: "",
  address: "",
};

export function VerificationNote() {
  return (
    <div className="mt-6 text-[17px] font-bold text-note">
      <p>Note:</p>
      <p>
        Please provide a valid CNIC and associated contact number. The information you enter for the first time will be
        verified and validated by the system.
      </p>
    </div>
  );
}

export function PersonFields({
  value,
  onChange,
  errors,
  showNote = true,
}: {
  value: PersonDraft;
  onChange: (v: PersonDraft) => void;
  errors: PersonErrors;
  showNote?: boolean;
}) {
  const set = (k: keyof PersonDraft) => (v: string) => onChange({ ...value, [k]: v });

  return (
    <>
      <div className="mx-auto grid max-w-[1030px] gap-x-[330px] gap-y-5 max-lg:gap-x-12 md:grid-cols-2">
        <TextField label="Name" value={value.name} onChange={set("name")} error={errors.name} />
        <TextField label="CNIC" value={value.cnic} onChange={set("cnic")} mask={CNIC_MASK} error={errors.cnic} />
        <SelectField
          label="Relation"
          placeholder="Select Relation"
          value={value.relation}
          onChange={set("relation")}
          options={RELATIONS.map((r) => ({ value: r, label: r }))}
          error={errors.relation}
        />
        <TextField label="Relation Name" value={value.relationName} onChange={set("relationName")} error={errors.relationName} />
        <TextField label="Contact" value={value.contact} onChange={set("contact")} mask={CONTACT_MASK} error={errors.contact} />
        <TextField label="Email" type="email" value={value.email} onChange={set("email")} error={errors.email} />
        <TextField label="Address" value={value.address} onChange={set("address")} error={errors.address} />
      </div>
      {showNote && <VerificationNote />}
    </>
  );
}
