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

/** Every form field is optional: empty is allowed, anything typed must still be valid. */
const optional = <T extends z.ZodType>(schema: T) => z.union([z.literal(""), schema]);

export const personSchema = z.object({
  name: z.string().trim().max(200),
  cnic: optional(z.string().regex(/^\d{5}-\d{7}-\d$/, "Enter a valid CNIC")),
  relation: optional(z.enum(RELATIONS, "Select relation")),
  relationName: z.string().trim().max(200),
  contact: optional(z.string().regex(/^03\d{2}-\d{7}$/, "Enter a valid contact (03XX-XXXXXXX)")),
  email: optional(z.email("Enter a valid email")),
  address: z.string().trim().max(500),
});
export type Person = z.infer<typeof personSchema>;

export const agentSchema = personSchema.pick({ name: true, cnic: true, contact: true, email: true });
export type Agent = z.infer<typeof agentSchema>;

export const itemSchema = z
  .object({
    stockId: z.number().int().positive().nullable(),
    customSerial: z
      .string()
      .trim()
      .toUpperCase()
      .max(40, "Serial number is too long")
      .regex(/^[A-Z0-9/-]+$/, "Serial number may only contain letters, digits, - and /")
      .nullable(),
    denomination: z.number().int().min(0).max(99999),
    purposeId: z.number().int().positive().nullable(),
    purposeOther: z.string().trim().max(200).nullable(),
    reason: z.string().trim().max(500),
  })
  .refine((i) => (i.stockId === null) !== (i.customSerial === null), { message: "Each stamp needs a serial number" });

export const issueSchema = z
  .object({
    through: z.enum(["self", "agent"]),
    applicant: personSchema,
    agent: agentSchema.nullable(),
    issueDate: optional(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a valid date")),
    items: z.array(itemSchema).min(1, "Add at least one stamp").max(50),
  })
  .refine((d) => d.through === "self" || d.agent !== null, { message: "Agent information is required" });
export type IssueInput = z.infer<typeof issueSchema>;

export const contactSchema = z.string().regex(/^03\d{2}-\d{7}$/);
