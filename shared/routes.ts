import { z } from "zod";
import {
  createBillPaymentSchema,
  createRechargeSchema,
  insertCustomerProfileSchema,
  insertFeedbackSchema,
  plans,
  recharges,
  billPayments,
  feedback,
  customerProfiles,
  services,
} from "./schema";

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
};

export const api = {
  plans: {
    list: {
      method: "GET" as const,
      path: "/api/plans",
      input: z
        .object({
          type: z.enum(["topup", "special"]).optional(),
          activeOnly: z
            .union([z.literal("true"), z.literal("false")])
            .optional(),
        })
        .optional(),
      responses: {
        200: z.array(z.custom<typeof plans.$inferSelect>()),
      },
    },
  },
  recharges: {
    create: {
      method: "POST" as const,
      path: "/api/recharges",
      input: createRechargeSchema,
      responses: {
        201: z.custom<typeof recharges.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      },
    },
    listMy: {
      method: "GET" as const,
      path: "/api/recharges/me",
      responses: {
        200: z.array(z.custom<typeof recharges.$inferSelect>()),
        401: errorSchemas.unauthorized,
      },
    },
  },
  bills: {
    getMock: {
      method: "GET" as const,
      path: "/api/bills/:mobileNumber",
      responses: {
        200: z.object({
          mobileNumber: z.string(),
          billAmountPaise: z.number().int().nonnegative(),
        }),
        400: errorSchemas.validation,
      },
    },
    pay: {
      method: "POST" as const,
      path: "/api/bill-payments",
      input: createBillPaymentSchema,
      responses: {
        201: z.custom<typeof billPayments.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      },
    },
    listMy: {
      method: "GET" as const,
      path: "/api/bill-payments/me",
      responses: {
        200: z.array(z.custom<typeof billPayments.$inferSelect>()),
        401: errorSchemas.unauthorized,
      },
    },
  },
  profile: {
    getMy: {
      method: "GET" as const,
      path: "/api/profile/me",
      responses: {
        200: z.custom<typeof customerProfiles.$inferSelect>().nullable(),
        401: errorSchemas.unauthorized,
      },
    },
    upsertMy: {
      method: "PUT" as const,
      path: "/api/profile/me",
      input: insertCustomerProfileSchema.partial(),
      responses: {
        200: z.custom<typeof customerProfiles.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      },
    },
  },
  services: {
    getMy: {
      method: "GET" as const,
      path: "/api/services/me",
      responses: {
        200: z.custom<typeof services.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
    updateMy: {
      method: "PUT" as const,
      path: "/api/services/me",
      input: z
        .object({
          doNotDisturb: z.boolean().optional(),
          callerTunes: z.boolean().optional(),
        })
        .refine((obj) => Object.keys(obj).length > 0, {
          message: "Provide at least one field to update",
        }),
      responses: {
        200: z.custom<typeof services.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      },
    },
  },
  feedback: {
    create: {
      method: "POST" as const,
      path: "/api/feedback",
      input: insertFeedbackSchema,
      responses: {
        201: z.custom<typeof feedback.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    listAdmin: {
      method: "GET" as const,
      path: "/api/admin/feedback",
      responses: {
        200: z.array(z.custom<typeof feedback.$inferSelect>()),
        401: errorSchemas.unauthorized,
      },
    },
  },
  admin: {
    overview: {
      method: "GET" as const,
      path: "/api/admin/overview",
      input: z
        .object({
          date: z.string().optional(),
        })
        .optional(),
      responses: {
        200: z.object({
          date: z.string(),
          totalRechargeAmountPaise: z.number().int().nonnegative(),
          totalBillAmountPaise: z.number().int().nonnegative(),
          totalTransactions: z.number().int().nonnegative(),
        }),
        401: errorSchemas.unauthorized,
      },
    },
    transactions: {
      method: "GET" as const,
      path: "/api/admin/transactions",
      input: z
        .object({
          date: z.string().optional(),
        })
        .optional(),
      responses: {
        200: z.object({
          recharges: z.array(z.custom<typeof recharges.$inferSelect>()),
          billPayments: z.array(z.custom<typeof billPayments.$inferSelect>()),
        }),
        401: errorSchemas.unauthorized,
      },
    },
    users: {
      method: "GET" as const,
      path: "/api/admin/users",
      responses: {
        200: z.array(
          z.object({
            id: z.string(),
            email: z.string().nullable().optional(),
            firstName: z.string().nullable().optional(),
            lastName: z.string().nullable().optional(),
            profileImageUrl: z.string().nullable().optional(),
            mobileNumber: z.string().nullable().optional(),
            fullName: z.string().nullable().optional(),
          })
        ),
        401: errorSchemas.unauthorized,
      },
    },
  },
} as const;

export function buildUrl(
  path: string,
  params?: Record<string, string | number>
): string {
  let url = path;
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url = url.replace(`:${key}`, encodeURIComponent(String(value)));
    }
  }
  return url;
}

export type PlansListResponse = z.infer<typeof api.plans.list.responses[200]>;
export type CreateRechargeInput = z.infer<typeof api.recharges.create.input>;
export type RechargeResponse = z.infer<typeof api.recharges.create.responses[201]>;
export type MyRechargesResponse = z.infer<typeof api.recharges.listMy.responses[200]>;
export type BillMockResponse = z.infer<typeof api.bills.getMock.responses[200]>;
export type CreateBillPaymentInput = z.infer<typeof api.bills.pay.input>;
export type BillPaymentResponse = z.infer<typeof api.bills.pay.responses[201]>;
export type MyBillPaymentsResponse = z.infer<typeof api.bills.listMy.responses[200]>;
export type MyProfileResponse = z.infer<typeof api.profile.getMy.responses[200]>;
export type UpsertMyProfileInput = z.infer<typeof api.profile.upsertMy.input>;
export type ServicesResponse = z.infer<typeof api.services.getMy.responses[200]>;
export type UpdateServicesInput = z.infer<typeof api.services.updateMy.input>;
export type CreateFeedbackInput = z.infer<typeof api.feedback.create.input>;
export type FeedbackResponse = z.infer<typeof api.feedback.create.responses[201]>;
export type AdminOverviewResponse = z.infer<typeof api.admin.overview.responses[200]>;
export type AdminTransactionsResponse = z.infer<
  typeof api.admin.transactions.responses[200]
>;
export type AdminUsersResponse = z.infer<typeof api.admin.users.responses[200]>;
export type ValidationError = z.infer<typeof errorSchemas.validation>;
export type UnauthorizedError = z.infer<typeof errorSchemas.unauthorized>;
