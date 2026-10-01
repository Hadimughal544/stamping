"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SectionCard } from "@/components/SectionCard";
import { useToast } from "@/components/Toast";
import type { z } from "zod";
import { agentSchema, personSchema, type Agent, type Person } from "@/lib/validators";
import { issueStamps, startVerification } from "../actions";
import { Stepper } from "./Stepper";
import { PersonFields, VerificationNote, emptyPerson, type PersonDraft, type PersonErrors } from "./PersonFields";
import { AgentFields, emptyAgent, type AgentDraft, type AgentErrors } from "./AgentFields";
import { StampDetails, type DraftItem, type Purpose } from "./StampDetails";
import { OtpModal } from "./OtpModal";
import { Confirmation } from "./Confirmation";

type Through = "self" | "agent";

/** Runs a zod schema and returns the first error message per field. */
function validate<T extends Record<string, unknown>>(schema: z.ZodType<T>, value: unknown) {
  const r = schema.safeParse(value);
  if (r.success) return { data: r.data, errors: {} as Partial<Record<keyof T, string>> };
  const errors: Partial<Record<keyof T, string>> = {};
  for (const issue of r.error.issues) errors[issue.path[0] as keyof T] ??= issue.message;
  return { data: undefined, errors };
}

export function IssueForm({ purposes }: { purposes: Purpose[] }) {
  const router = useRouter();
  const toast = useToast();
  const [step, setStep] = useState<0 | 1>(0);
  const [through, setThrough] = useState<Through>("self");
  const [applicant, setApplicant] = useState<PersonDraft>(emptyPerson);
  const [agent, setAgent] = useState<AgentDraft>(emptyAgent);
  const [applicantErrors, setApplicantErrors] = useState<PersonErrors>({});
  const [agentErrors, setAgentErrors] = useState<AgentErrors>({});
  const [items, setItems] = useState<DraftItem[]>([]);
  const [issueDate, setIssueDate] = useState("");
  const [otp, setOtp] = useState<{ contact: string; resendIn: number; devCode?: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const verifier = through === "agent" ? agent : applicant;

  async function next() {
    const a = validate(personSchema, applicant);
    const g = through === "agent" ? validate(agentSchema, agent) : { data: undefined, errors: {} };
    setApplicantErrors(a.errors);
    setAgentErrors(g.errors);
    if (!a.data || (through === "agent" && !g.data)) {
      toast("Please correct the highlighted fields.", "error");
      return;
    }
    if (items.length === 0) {
      toast("Please add at least one stamp.", "error");
      return;
    }

    // No contact number means there is nothing to verify by OTP.
    if (!verifier.contact) return goToConfirmation();

    setBusy(true);
    const res = await startVerification(verifier.contact, through === "self" ? applicant.cnic || undefined : undefined);
    setBusy(false);
    if (res.verified) return goToConfirmation();
    if (!res.ok) return toast(res.error, "error");
    setOtp({ contact: verifier.contact, resendIn: res.resendIn, devCode: res.devCode });
  }

  function goToConfirmation() {
    setOtp(null);
    setStep(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function confirm() {
    setBusy(true);
    const res = await issueStamps({
      through,
      applicant: applicant as Person,
      agent: through === "agent" ? (agent as Agent) : null,
      issueDate,
      items: items.map(({ stockId, customSerial, denomination, purposeId, purposeOther, reason }) => ({
        stockId,
        customSerial,
        denomination,
        purposeId,
        purposeOther,
        reason,
      })),
    });
    setBusy(false);
    if (!res.ok) return toast(res.error, "error");
    toast("Stamps issued successfully.", "success");
    router.push(`/verify-stamp?serial=${encodeURIComponent(res.serial)}`);
  }

  return (
    <div className="mx-auto max-w-[1460px] px-4">
      <Stepper current={step} />

      {step === 0 ? (
        <div className="mx-auto max-w-[1390px]">
          <SectionCard title="Applicant Through" icon="user">
            <div className="mx-auto flex max-w-[1030px] gap-12 text-[17px]">
              {(["self", "agent"] as const).map((t) => (
                <label key={t} className="flex cursor-pointer items-center gap-2">
                  <input
                    type="radio"
                    name="through"
                    checked={through === t}
                    onChange={() => setThrough(t)}
                    className="h-6 w-6 accent-[#7fcf7f]"
                  />
                  {t === "self" ? "Self" : "Agent"}
                </label>
              ))}
            </div>
            {through === "agent" && (
              <>
                <AgentFields value={agent} onChange={setAgent} errors={agentErrors} />
                <VerificationNote />
              </>
            )}
          </SectionCard>

          <SectionCard title="Applicant Information" icon="user">
            <PersonFields
              value={applicant}
              onChange={setApplicant}
              errors={applicantErrors}
              showNote={through === "self"}
            />
          </SectionCard>

          <SectionCard title="Stamp Details" icon="users">
            <StampDetails
              purposes={purposes}
              items={items}
              issueDate={issueDate}
              onIssueDateChange={setIssueDate}
              onAdd={(added) => setItems((cur) => [...cur, ...added])}
              onRemove={(key) => setItems((cur) => cur.filter((i) => i.key !== key))}
            />
          </SectionCard>

          <div className="mb-16 flex justify-end pr-5">
            <button type="button" onClick={next} disabled={busy} className="btn-green">
              {busy ? "Please wait…" : "Next"}
            </button>
          </div>
        </div>
      ) : (
        <Confirmation
          through={through}
          applicant={applicant}
          agent={through === "agent" ? agent : null}
          items={items}
          issueDate={issueDate}
          busy={busy}
          onBack={() => setStep(0)}
          onConfirm={confirm}
        />
      )}

      {otp && (
        <OtpModal
          contact={otp.contact}
          resendIn={otp.resendIn}
          devCode={otp.devCode}
          onVerified={goToConfirmation}
          onClose={() => setOtp(null)}
        />
      )}
    </div>
  );
}
