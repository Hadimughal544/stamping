import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  jsonb,
  pgEnum,
  index,
} from "drizzle-orm/pg-core";

export const stockStatus = pgEnum("stock_status", ["AVAILABLE", "ISSUED"]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  displayName: text("display_name").notNull(),
  vendorCode: text("vendor_code").notNull(),
  activeSessionId: text("active_session_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const purposes = pgTable("purposes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  articleCode: text("article_code").notNull(),
});

export const stampStock = pgTable(
  "stamp_stock",
  {
    id: serial("id").primaryKey(),
    serial: text("serial").notNull().unique(),
    denomination: integer("denomination").notNull(),
    vendorId: integer("vendor_id")
      .notNull()
      .references(() => users.id),
    status: stockStatus("status").notNull().default("AVAILABLE"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("stamp_stock_vendor_denom_idx").on(t.vendorId, t.denomination, t.status)],
);

export const applicants = pgTable("applicants", {
  id: serial("id").primaryKey(),
  name: text("name"),
  cnic: text("cnic").unique(),
  relation: text("relation"),
  relationName: text("relation_name"),
  contact: text("contact"),
  email: text("email"),
  address: text("address"),
  contactVerifiedAt: timestamp("contact_verified_at", { withTimezone: true }),
});

export type AgentInfo = {
  name?: string;
  cnic?: string;
  contact?: string;
  email?: string;
};

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  vendorId: integer("vendor_id")
    .notNull()
    .references(() => users.id),
  applicantId: integer("applicant_id")
    .notNull()
    .references(() => applicants.id),
  agentJson: jsonb("agent_json").$type<AgentInfo | null>(),
  totalAmount: integer("total_amount").notNull(),
  issuedAt: timestamp("issued_at", { withTimezone: true }).defaultNow().notNull(),
  validUntil: timestamp("valid_until", { withTimezone: true }).notNull(),
});

export const transactionItems = pgTable("transaction_items", {
  id: serial("id").primaryKey(),
  transactionId: integer("transaction_id")
    .notNull()
    .references(() => transactions.id),
  stockId: integer("stock_id")
    .notNull()
    .unique()
    .references(() => stampStock.id),
  purposeId: integer("purpose_id").references(() => purposes.id),
  purposeOther: text("purpose_other"),
  reason: text("reason"),
});

export const otpCodes = pgTable("otp_codes", {
  id: serial("id").primaryKey(),
  contact: text("contact").notNull(),
  codeHash: text("code_hash").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  attempts: integer("attempts").notNull().default(0),
  consumedAt: timestamp("consumed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const activityLog = pgTable("activity_log", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  action: text("action").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
