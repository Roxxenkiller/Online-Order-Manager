import type { Express } from "express";
import type { Server } from "http";
import { api } from "@shared/routes";
import { z } from "zod";
import { storage } from "./storage";
import { isAuthenticated, registerAuthRoutes } from "./replit_integrations/auth";
import { db } from "./db";
import { plans } from "@shared/schema";

function getUserId(req: any): string | null {
  const id = req?.user?.claims?.sub;
  return typeof id === "string" ? id : null;
}

function isMobileNumber(value: string): boolean {
  return /^\d{10}$/.test(value);
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function makeTransactionId(prefix: "RC" | "BP"): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rnd = Math.random().toString(36).slice(2, 10).toUpperCase();
  return `${prefix}-${ts}-${rnd}`.slice(0, 32);
}

async function seedDatabase(): Promise<void> {
  await storage.seedIfEmpty();
}

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  await seedDatabase();

  registerAuthRoutes(app);

  app.get(api.plans.list.path, async (req, res) => {
    const rawType = typeof req.query.type === "string" ? req.query.type : undefined;
    const type = rawType === "topup" || rawType === "special" ? rawType : undefined;

    const rawActiveOnly = typeof req.query.activeOnly === "string" ? req.query.activeOnly : undefined;
    const activeOnly = rawActiveOnly ? rawActiveOnly === "true" : true;

    const items = await storage.listPlans({ type, activeOnly });
    res.json(items);
  });

  app.post(api.recharges.create.path, isAuthenticated, async (req: any, res) => {
    try {
      const input = api.recharges.create.input.parse(req.body);
      const userId = getUserId(req);

      const [plan] = await db.select().from(plans).where(z.coerce.number().parse(input.planId) ? (await import("drizzle-orm")).eq(plans.id, input.planId) : (await import("drizzle-orm")).eq(plans.id, input.planId));
      if (!plan) {
        return res.status(400).json({ message: "Invalid plan", field: "planId" });
      }
      if (plan.planType !== input.rechargeType) {
        return res.status(400).json({ message: "Plan type mismatch", field: "rechargeType" });
      }

      const created = await storage.createRecharge({
        userId,
        input,
        amountPaise: plan.amountPaise,
        transactionId: makeTransactionId("RC"),
      });

      res.status(201).json(created);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0]?.message ?? "Invalid input",
          field: err.errors[0]?.path?.join(".") || undefined,
        });
      }
      throw err;
    }
  });

  app.get(api.recharges.listMy.path, isAuthenticated, async (req: any, res) => {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const items = await storage.listMyRecharges(userId);
    res.json(items);
  });

  app.get(api.bills.getMock.path, async (req, res) => {
    const mobileNumber = String(req.params.mobileNumber ?? "");
    if (!isMobileNumber(mobileNumber)) {
      return res.status(400).json({ message: "Enter a valid 10-digit mobile number", field: "mobileNumber" });
    }
    const billAmountPaise = await storage.getMockBillAmountPaise(mobileNumber);
    res.json({ mobileNumber, billAmountPaise });
  });

  app.post(api.bills.pay.path, isAuthenticated, async (req: any, res) => {
    try {
      const input = api.bills.pay.input.parse(req.body);
      const userId = getUserId(req);
      const billAmountPaise = await storage.getMockBillAmountPaise(input.mobileNumber);

      const created = await storage.createBillPayment({
        userId,
        input,
        billAmountPaise,
        transactionId: makeTransactionId("BP"),
      });

      res.status(201).json(created);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0]?.message ?? "Invalid input",
          field: err.errors[0]?.path?.join(".") || undefined,
        });
      }
      throw err;
    }
  });

  app.get(api.bills.listMy.path, isAuthenticated, async (req: any, res) => {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const items = await storage.listMyBillPayments(userId);
    res.json(items);
  });

  app.get(api.profile.getMy.path, isAuthenticated, async (req: any, res) => {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const profile = await storage.getMyProfile(userId);
    res.json(profile);
  });

  app.put(api.profile.upsertMy.path, isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      const updates = api.profile.upsertMy.input.parse(req.body);

      if (updates.mobileNumber !== undefined && !isMobileNumber(String(updates.mobileNumber))) {
        return res.status(400).json({ message: "Enter a valid 10-digit mobile number", field: "mobileNumber" });
      }

      const saved = await storage.upsertMyProfile(userId, updates);
      res.json(saved);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0]?.message ?? "Invalid input",
          field: err.errors[0]?.path?.join(".") || undefined,
        });
      }
      throw err;
    }
  });

  app.get(api.services.getMy.path, isAuthenticated, async (req: any, res) => {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const svc = await storage.getMyServices(userId);
    res.json(svc);
  });

  app.put(api.services.updateMy.path, isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ message: "Unauthorized" });
      const updates = api.services.updateMy.input.parse(req.body);
      const saved = await storage.updateMyServices(userId, updates);
      res.json(saved);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0]?.message ?? "Invalid input" });
      }
      throw err;
    }
  });

  app.post(api.feedback.create.path, async (req: any, res) => {
    try {
      const input = api.feedback.create.input.parse(req.body);
      const userId = getUserId(req);
      const created = await storage.createFeedback(userId, input);
      res.status(201).json(created);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0]?.message ?? "Invalid input",
          field: err.errors[0]?.path?.join(".") || undefined,
        });
      }
      throw err;
    }
  });

  const requireAdmin = async (req: any, res: any, next: any) => {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const ok = await storage.isAdmin(userId);
    if (!ok) return res.status(401).json({ message: "Unauthorized" });
    return next();
  };

  app.get(api.admin.overview.path, isAuthenticated, requireAdmin, async (req: any, res) => {
    const date = typeof req.query.date === "string" ? req.query.date : todayISO();
    const data = await storage.adminDailyOverview(date);
    res.json(data);
  });

  app.get(api.admin.transactions.path, isAuthenticated, requireAdmin, async (req: any, res) => {
    const date = typeof req.query.date === "string" ? req.query.date : todayISO();
    const data = await storage.adminDailyTransactions(date);
    res.json(data);
  });

  app.get(api.admin.users.path, isAuthenticated, requireAdmin, async (_req: any, res) => {
    const data = await storage.adminUsers();
    res.json(data);
  });

  app.get(api.feedback.listAdmin.path, isAuthenticated, requireAdmin, async (_req: any, res) => {
    const data = await storage.listFeedback();
    res.json(data);
  });

  return httpServer;
}
