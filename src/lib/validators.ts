import { z } from "zod";

export const RELATIONS = ["S/O", "D/O", "W/O"] as const;
export const CNIC_MASK = "#####-#######-#";
export const CONTACT_MASK = "####-#######";

/** Keeps only digits and lays them into a mask such as "#####-#######-#". */
export function applyMask(value: string, mask: string) {
  const digits = value.replace(/\D/g, "");
  let out = "";
  let i = 0;
  for (const ch of mask) {
    if (i >= digits.length) break;
    if (ch === "#") out += digits[i++];
    else out += ch;
  }
  return out;
}

export const personSchema = z.object({
  name: z.string().trim().min(3, "Name is required"),
  cnic: z.string().regex(/^\d{5}-\d{7}-\d$/, "Enter a valid CNIC"),
  relation: z.enum(RELATIONS, "Select relation"),
  relationName: z.string().trim().min(3, "Relation name is required"),
  contact: z.string().regex(/^03\d{2}-\d{7}$/, "Enter a valid contact (03XX-XXXXXXX)"),
  email: z.union([z.literal(""), z.email("Enter a valid email")]),
  address: z.string().trim().min(3, "Address is required"),
});
export type Person = z.infer<typeof personSchema>;

export const agentSchema = personSchema.pick({ name: true, cnic: true, contact: true, email: true });
export type Agent = z.infer<typeof agentSchema>;

export const itemSchema = z.object({
  stockId: z.number().int().positive(),
  purposeId: z.number().int().positive().nullable(),
  purposeOther: z.string().trim().max(200).nullable(),
  reason: z.string().trim().min(1, "Reason is required").max(500),
});

export const issueSchema = z
  .object({
    through: z.enum(["self", "agent"]),
    applicant: personSchema,
    agent: agentSchema.nullable(),
    items: z.array(itemSchema).min(1, "Add at least one stamp").max(50),
  })
  .refine((d) => d.through === "self" || d.agent !== null, { message: "Agent information is required" })
  .refine((d) => d.items.every((i) => i.purposeId !== null || (i.purposeOther && i.purposeOther.length > 0)), {
    message: "Each stamp needs a purpose",
  });
export type IssueInput = z.infer<typeof issueSchema>;

export const contactSchema = z.string().regex(/^03\d{2}-\d{7}$/);
