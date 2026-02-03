import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export * from "./models/auth";

export const customerProfiles = pgTable(
  "customer_profiles",
  {
    id: serial("id").primaryKey(),
    userId: varchar("user_id")
      .notNull()
      .unique()
      .references(() => users.id, { onDelete: "cascade" }),
    mobileNumber: varchar("mobile_number", { length: 10 }).notNull().unique(),
    fullName: text("full_name"),
    address: text("address"),
  },
  (t) => [index("IDX_customer_profiles_user_id").on(t.userId)]
);

export const plans = pgTable(
  "plans",
  {
    id: serial("id").primaryKey(),
    planType: varchar("plan_type", { length: 20 }).notNull(), // 'topup' | 'special'
    name: text("name").notNull(),
    description: text("description"),
    amountPaise: integer("amount_paise").notNull(),
    validityDays: integer("validity_days"),
    talktimePaise: integer("talktime_paise"),
    isActive: boolean("is_active").notNull().default(true),
  },
  (t) => [index("IDX_plans_type_active").on(t.planType, t.isActive)]
);

export const recharges = pgTable(
  "recharges",
  {
    id: serial("id").primaryKey(),
    transactionId: varchar("transaction_id", { length: 32 }).notNull().unique(),
    userId: varchar("user_id").references(() => users.id, { onDelete: "set null" }),
    mobileNumber: varchar("mobile_number", { length: 10 }).notNull(),
    rechargeType: varchar("recharge_type", { length: 20 }).notNull(), // 'topup' | 'special'
    planId: integer("plan_id").references(() => plans.id, { onDelete: "set null" }),
    amountPaise: integer("amount_paise").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    index("IDX_recharges_user_created_at").on(t.userId, t.createdAt),
    index("IDX_recharges_mobile_created_at").on(t.mobileNumber, t.createdAt),
  ]
);

export const billPayments = pgTable(
  "bill_payments",
  {
    id: serial("id").primaryKey(),
    transactionId: varchar("transaction_id", { length: 32 }).notNull().unique(),
    userId: varchar("user_id").references(() => users.id, { onDelete: "set null" }),
    mobileNumber: varchar("mobile_number", { length: 10 }).notNull(),
    billAmountPaise: integer("bill_amount_paise").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    index("IDX_bill_payments_user_created_at").on(t.userId, t.createdAt),
    index("IDX_bill_payments_mobile_created_at").on(t.mobileNumber, t.createdAt),
  ]
);

export const services = pgTable(
  "services",
  {
    id: serial("id").primaryKey(),
    userId: varchar("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    doNotDisturb: boolean("do_not_disturb").notNull().default(false),
    callerTunes: boolean("caller_tunes").notNull().default(false),
  },
  (t) => [index("IDX_services_user_id").on(t.userId)]
);

export const feedback = pgTable(
  "feedback",
  {
    id: serial("id").primaryKey(),
    userId: varchar("user_id").references(() => users.id, { onDelete: "set null" }),
    name: text("name"),
    email: varchar("email", { length: 320 }),
    message: text("message").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("IDX_feedback_created_at").on(t.createdAt)]
);

export const insertCustomerProfileSchema = createInsertSchema(customerProfiles).omit({
  id: true,
  userId: true,
});

export const insertFeedbackSchema = createInsertSchema(feedback).omit({
  id: true,
  userId: true,
  createdAt: true,
});

export const createRechargeSchema = z.object({
  mobileNumber: z.string().regex(/^\d{10}$/, "Enter a valid 10-digit mobile number"),
  rechargeType: z.enum(["topup", "special"]),
  planId: z.number().int().positive(),
});

export const createBillPaymentSchema = z.object({
  mobileNumber: z.string().regex(/^\d{10}$/, "Enter a valid 10-digit mobile number"),
});

export type Plan = typeof plans.$inferSelect;
export type Recharge = typeof recharges.$inferSelect;
export type BillPayment = typeof billPayments.$inferSelect;
export type CustomerProfile = typeof customerProfiles.$inferSelect;
export type Services = typeof services.$inferSelect;
export type Feedback = typeof feedback.$inferSelect;

export type InsertCustomerProfile = z.infer<typeof insertCustomerProfileSchema>;
export type InsertFeedback = z.infer<typeof insertFeedbackSchema>;

export type CreateRechargeRequest = z.infer<typeof createRechargeSchema>;
export type CreateBillPaymentRequest = z.infer<typeof createBillPaymentSchema>;
