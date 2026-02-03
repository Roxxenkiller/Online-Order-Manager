import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type AdminTransactionsResponse, type BillMockResponse, type BillPaymentResponse, type CreateBillPaymentInput, type MyBillPaymentsResponse } from "@shared/routes";
import { z } from "zod";

function parseWithLogging<T>(schema: z.ZodSchema<T>, data: unknown, label: string): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.error(`[Zod] ${label} validation failed:`, result.error.format());
    throw result.error;
  }
  return result.data;
}

export function useMockBill(mobileNumber?: string, enabled = true) {
  return useQuery<BillMockResponse>({
    queryKey: [api.bills.getMock.path, mobileNumber ?? ""],
    enabled: enabled && !!mobileNumber,
    queryFn: async () => {
      const url = buildUrl(api.bills.getMock.path, { mobileNumber: mobileNumber! });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 400) {
        const err = parseWithLogging(api.bills.getMock.responses[400], await res.json(), "bills.getMock.400");
        throw new Error(err.message);
      }
      if (!res.ok) throw new Error("Failed to fetch bill");
      return parseWithLogging(api.bills.getMock.responses[200], await res.json(), "bills.getMock.200");
    },
  });
}

export function useMyBillPayments(enabled = true) {
  return useQuery<MyBillPaymentsResponse>({
    queryKey: [api.bills.listMy.path],
    enabled,
    queryFn: async () => {
      const res = await fetch(api.bills.listMy.path, { credentials: "include" });
      if (res.status === 401) {
        const err = parseWithLogging(api.bills.listMy.responses[401], await res.json(), "bills.listMy.401");
        throw new Error(`401: ${err.message}`);
      }
      if (!res.ok) throw new Error("Failed to fetch bill payments");
      return parseWithLogging(api.bills.listMy.responses[200], await res.json(), "bills.listMy.200");
    },
  });
}

export function usePayBill() {
  const qc = useQueryClient();
  return useMutation<BillPaymentResponse, Error, CreateBillPaymentInput>({
    mutationFn: async (input) => {
      const validated = api.bills.pay.input.parse(input);
      const res = await fetch(api.bills.pay.path, {
        method: api.bills.pay.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });

      if (res.status === 401) {
        const err = parseWithLogging(api.bills.pay.responses[401], await res.json(), "bills.pay.401");
        throw new Error(`401: ${err.message}`);
      }
      if (res.status === 400) {
        const err = parseWithLogging(api.bills.pay.responses[400], await res.json(), "bills.pay.400");
        throw new Error(err.message);
      }
      if (!res.ok) throw new Error("Failed to pay bill");

      return parseWithLogging(api.bills.pay.responses[201], await res.json(), "bills.pay.201");
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: [api.bills.listMy.path] });
    },
  });
}

/** Convenience for admin transactions (kept here as it includes billPayments) */
export function useAdminTransactions(date?: string, enabled = true) {
  const qs = new URLSearchParams();
  if (date) qs.set("date", date);
  const url = qs.toString() ? `${api.admin.transactions.path}?${qs}` : api.admin.transactions.path;

  return useQuery<AdminTransactionsResponse>({
    queryKey: [url],
    enabled,
    queryFn: async () => {
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 401) {
        const err = parseWithLogging(api.admin.transactions.responses[401], await res.json(), "admin.transactions.401");
        throw new Error(`401: ${err.message}`);
      }
      if (!res.ok) throw new Error("Failed to fetch admin transactions");
      return parseWithLogging(api.admin.transactions.responses[200], await res.json(), "admin.transactions.200");
    },
  });
}
