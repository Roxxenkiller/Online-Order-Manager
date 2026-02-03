import { db } from "./db";
import {
  billPayments,
  customerProfiles,
  feedback,
  plans,
  recharges,
  services,
  users,
  type BillPayment,
  type CreateBillPaymentRequest,
  type CreateRechargeRequest,
  type CustomerProfile,
  type Feedback,
  type InsertCustomerProfile,
  type InsertFeedback,
  type Plan,
  type Recharge,
  type Services,
} from "@shared/schema";
import { and, desc, eq, ilike, isNull, sql } from "drizzle-orm";

export interface IStorage {
  listPlans(params?: { type?: "topup" | "special"; activeOnly?: boolean }): Promise<Plan[]>;

  createRecharge(params: {
    userId?: string | null;
    input: CreateRechargeRequest;
    amountPaise: number;
    transactionId: string;
  }): Promise<Recharge>;
  listMyRecharges(userId: string): Promise<Recharge[]>;

  getMockBillAmountPaise(mobileNumber: string): Promise<number>;
  createBillPayment(params: {
    userId?: string | null;
    input: CreateBillPaymentRequest;
    billAmountPaise: number;
    transactionId: string;
  }): Promise<BillPayment>;
  listMyBillPayments(userId: string): Promise<BillPayment[]>;

  getMyProfile(userId: string): Promise<CustomerProfile | null>;
  upsertMyProfile(userId: string, updates: Partial<InsertCustomerProfile>): Promise<CustomerProfile>;

  getMyServices(userId: string): Promise<Services>;
  updateMyServices(userId: string, updates: Partial<Pick<Services, "doNotDisturb" | "callerTunes">>): Promise<Services>;

  createFeedback(userId: string | null, input: InsertFeedback): Promise<Feedback>;
  listFeedback(): Promise<Feedback[]>;

  isAdmin(userId: string): Promise<boolean>;
  adminDailyOverview(dateISO: string): Promise<{
    date: string;
    totalRechargeAmountPaise: number;
    totalBillAmountPaise: number;
    totalTransactions: number;
  }>;
  adminDailyTransactions(dateISO: string): Promise<{ recharges: Recharge[]; billPayments: BillPayment[] }>;
  adminUsers(): Promise<
    Array<{
      id: string;
      email?: string | null;
      firstName?: string | null;
      lastName?: string | null;
      profileImageUrl?: string | null;
      mobileNumber?: string | null;
      fullName?: string | null;
    }>
  >;

  seedIfEmpty(): Promise<void>;
}

function startOfDay(dateISO: string): Date {
  const d = new Date(`${dateISO}T00:00:00.000Z`);
  if (Number.isNaN(d.getTime())) {
    throw new Error("Invalid date");
  }
  return d;
}

function endOfDay(dateISO: string): Date {
  const d = new Date(`${dateISO}T23:59:59.999Z`);
  if (Number.isNaN(d.getTime())) {
    throw new Error("Invalid date");
  }
  return d;
}

export class DatabaseStorage implements IStorage {
  async listPlans(params?: { type?: "topup" | "special"; activeOnly?: boolean }): Promise<Plan[]> {
    const type = params?.type;
    const activeOnly = params?.activeOnly ?? true;

    const whereParts = [] as any[];
    if (type) whereParts.push(eq(plans.planType, type));
    if (activeOnly) whereParts.push(eq(plans.isActive, true));

    if (whereParts.length === 0) {
      return await db.select().from(plans).orderBy(plans.amountPaise);
    }

    return await db
      .select()
      .from(plans)
      .where(and(...whereParts))
      .orderBy(plans.amountPaise);
  }

  async createRecharge(params: {
    userId?: string | null;
    input: CreateRechargeRequest;
    amountPaise: number;
    transactionId: string;
  }): Promise<Recharge> {
    const [created] = await db
      .insert(recharges)
      .values({
        transactionId: params.transactionId,
        userId: params.userId ?? null,
        mobileNumber: params.input.mobileNumber,
        rechargeType: params.input.rechargeType,
        planId: params.input.planId,
        amountPaise: params.amountPaise,
      })
      .returning();
    return created;
  }

  async listMyRecharges(userId: string): Promise<Recharge[]> {
    return await db
      .select()
      .from(recharges)
      .where(eq(recharges.userId, userId))
      .orderBy(desc(recharges.createdAt));
  }

  async getMockBillAmountPaise(mobileNumber: string): Promise<number> {
    const base = Number(mobileNumber.slice(-4));
    const amount = 19900 + (base % 8000); // 199.00 - 278.99
    return amount;
  }

  async createBillPayment(params: {
    userId?: string | null;
    input: CreateBillPaymentRequest;
    billAmountPaise: number;
    transactionId: string;
  }): Promise<BillPayment> {
    const [created] = await db
      .insert(billPayments)
      .values({
        transactionId: params.transactionId,
        userId: params.userId ?? null,
        mobileNumber: params.input.mobileNumber,
        billAmountPaise: params.billAmountPaise,
      })
      .returning();
    return created;
  }

  async listMyBillPayments(userId: string): Promise<BillPayment[]> {
    return await db
      .select()
      .from(billPayments)
      .where(eq(billPayments.userId, userId))
      .orderBy(desc(billPayments.createdAt));
  }

  async getMyProfile(userId: string): Promise<CustomerProfile | null> {
    const [profile] = await db
      .select()
      .from(customerProfiles)
      .where(eq(customerProfiles.userId, userId));
    return profile ?? null;
  }

  async upsertMyProfile(userId: string, updates: Partial<InsertCustomerProfile>): Promise<CustomerProfile> {
    const existing = await this.getMyProfile(userId);

    if (!existing) {
      const [created] = await db
        .insert(customerProfiles)
        .values({
          userId,
          mobileNumber: updates.mobileNumber ?? userId.slice(0, 10).padEnd(10, "0"),
          fullName: updates.fullName ?? null,
          address: updates.address ?? null,
        })
        .returning();
      return created;
    }

    const [updated] = await db
      .update(customerProfiles)
      .set({
        ...(updates.mobileNumber !== undefined ? { mobileNumber: updates.mobileNumber } : {}),
        ...(updates.fullName !== undefined ? { fullName: updates.fullName } : {}),
        ...(updates.address !== undefined ? { address: updates.address } : {}),
      })
      .where(eq(customerProfiles.userId, userId))
      .returning();

    return updated;
  }

  async getMyServices(userId: string): Promise<Services> {
    const [existing] = await db.select().from(services).where(eq(services.userId, userId));
    if (existing) return existing;

    const [created] = await db
      .insert(services)
      .values({ userId, doNotDisturb: false, callerTunes: false })
      .returning();
    return created;
  }

  async updateMyServices(
    userId: string,
    updates: Partial<Pick<Services, "doNotDisturb" | "callerTunes">>
  ): Promise<Services> {
    await this.getMyServices(userId);

    const [updated] = await db
      .update(services)
      .set({
        ...(updates.doNotDisturb !== undefined ? { doNotDisturb: updates.doNotDisturb } : {}),
        ...(updates.callerTunes !== undefined ? { callerTunes: updates.callerTunes } : {}),
      })
      .where(eq(services.userId, userId))
      .returning();

    return updated;
  }

  async createFeedback(userId: string | null, input: InsertFeedback): Promise<Feedback> {
    const [created] = await db
      .insert(feedback)
      .values({
        userId,
        name: input.name ?? null,
        email: input.email ?? null,
        message: input.message,
      })
      .returning();
    return created;
  }

  async listFeedback(): Promise<Feedback[]> {
    return await db.select().from(feedback).orderBy(desc(feedback.createdAt));
  }

  async isAdmin(userId: string): Promise<boolean> {
    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) return false;

    const [u] = await db.select().from(users).where(eq(users.id, userId));
    if (!u?.email) return false;

    return u.email.toLowerCase() === adminEmail.toLowerCase();
  }

  async adminDailyOverview(dateISO: string): Promise<{
    date: string;
    totalRechargeAmountPaise: number;
    totalBillAmountPaise: number;
    totalTransactions: number;
  }> {
    const from = startOfDay(dateISO);
    const to = endOfDay(dateISO);

    const [r] = await db
      .select({ sum: sql<number>`COALESCE(SUM(${recharges.amountPaise}), 0)` })
      .from(recharges)
      .where(and(sql`${recharges.createdAt} >= ${from}`, sql`${recharges.createdAt} <= ${to}`));

    const [b] = await db
      .select({ sum: sql<number>`COALESCE(SUM(${billPayments.billAmountPaise}), 0)` })
      .from(billPayments)
      .where(and(sql`${billPayments.createdAt} >= ${from}`, sql`${billPayments.createdAt} <= ${to}`));

    const [rc] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(recharges)
      .where(and(sql`${recharges.createdAt} >= ${from}`, sql`${recharges.createdAt} <= ${to}`));

    const [bc] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(billPayments)
      .where(and(sql`${billPayments.createdAt} >= ${from}`, sql`${billPayments.createdAt} <= ${to}`));

    return {
      date: dateISO,
      totalRechargeAmountPaise: Number(r?.sum ?? 0),
      totalBillAmountPaise: Number(b?.sum ?? 0),
      totalTransactions: Number(rc?.count ?? 0) + Number(bc?.count ?? 0),
    };
  }

  async adminDailyTransactions(dateISO: string): Promise<{ recharges: Recharge[]; billPayments: BillPayment[] }> {
    const from = startOfDay(dateISO);
    const to = endOfDay(dateISO);

    const r = await db
      .select()
      .from(recharges)
      .where(and(sql`${recharges.createdAt} >= ${from}`, sql`${recharges.createdAt} <= ${to}`))
      .orderBy(desc(recharges.createdAt));

    const b = await db
      .select()
      .from(billPayments)
      .where(and(sql`${billPayments.createdAt} >= ${from}`, sql`${billPayments.createdAt} <= ${to}`))
      .orderBy(desc(billPayments.createdAt));

    return { recharges: r, billPayments: b };
  }

  async adminUsers(): Promise<
    Array<{
      id: string;
      email?: string | null;
      firstName?: string | null;
      lastName?: string | null;
      profileImageUrl?: string | null;
      mobileNumber?: string | null;
      fullName?: string | null;
    }>
  > {
    const rows = await db
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        profileImageUrl: users.profileImageUrl,
        mobileNumber: customerProfiles.mobileNumber,
        fullName: customerProfiles.fullName,
      })
      .from(users)
      .leftJoin(customerProfiles, eq(customerProfiles.userId, users.id))
      .orderBy(users.createdAt);

    return rows;
  }

  async seedIfEmpty(): Promise<void> {
    const existingPlans = await db.select().from(plans).limit(1);
    if (existingPlans.length > 0) return;

    await db.insert(plans).values([
      {
        planType: "topup",
        name: "Top-Up 99",
        description: "Talktime ₹99.0",
        amountPaise: 9900,
        validityDays: null,
        talktimePaise: 9900,
        isActive: true,
      },
      {
        planType: "topup",
        name: "Top-Up 199",
        description: "Talktime ₹199.0",
        amountPaise: 19900,
        validityDays: null,
        talktimePaise: 19900,
        isActive: true,
      },
      {
        planType: "topup",
        name: "Top-Up 299",
        description: "Talktime ₹299.0",
        amountPaise: 29900,
        validityDays: null,
        talktimePaise: 29900,
        isActive: true,
      },
      {
        planType: "special",
        name: "Special 239",
        description: "Unlimited calls + 1.5GB/day",
        amountPaise: 23900,
        validityDays: 28,
        talktimePaise: null,
        isActive: true,
      },
      {
        planType: "special",
        name: "Special 479",
        description: "Unlimited calls + 1.5GB/day",
        amountPaise: 47900,
        validityDays: 56,
        talktimePaise: null,
        isActive: true,
      },
      {
        planType: "special",
        name: "Special 666",
        description: "Unlimited calls + 1.5GB/day",
        amountPaise: 66600,
        validityDays: 84,
        talktimePaise: null,
        isActive: true,
      },
    ]);
  }
}

export const storage = new DatabaseStorage();
