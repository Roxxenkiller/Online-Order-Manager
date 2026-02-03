import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, type CreateRechargeInput, type MyRechargesResponse, type RechargeResponse } from "@shared/routes";
import { z } from "zod";

function parseWithLogging<T>(schema: z.ZodSchema<T>, data: unknown, label: string): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.error(`[Zod] ${label} validation failed:`, result.error.format());
    throw result.error;
  }
  return result.data;
}

export function useMyRecharges(enabled = true) {
  return useQuery<MyRechargesResponse>({
    queryKey: [api.recharges.listMy.path],
    enabled,
    queryFn: async () => {
      const res = await fetch(api.recharges.listMy.path, { credentials: "include" });
      if (res.status === 401) {
        const err = parseWithLogging(api.recharges.listMy.responses[401], await res.json(), "recharges.listMy.401");
        throw new Error(`401: ${err.message}`);
      }
      if (!res.ok) throw new Error("Failed to fetch recharge history");
      return parseWithLogging(api.recharges.listMy.responses[200], await res.json(), "recharges.listMy.200");
    },
  });
}

export function useCreateRecharge() {
  const qc = useQueryClient();
  return useMutation<RechargeResponse, Error, CreateRechargeInput>({
    mutationFn: async (input) => {
      const validated = api.recharges.create.input.parse(input);
      const res = await fetch(api.recharges.create.path, {
        method: api.recharges.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });

      if (res.status === 401) {
        const err = parseWithLogging(api.recharges.create.responses[401], await res.json(), "recharges.create.401");
        throw new Error(`401: ${err.message}`);
      }
      if (res.status === 400) {
        const err = parseWithLogging(api.recharges.create.responses[400], await res.json(), "recharges.create.400");
        throw new Error(err.message);
      }
      if (!res.ok) throw new Error("Failed to create recharge");

      return parseWithLogging(api.recharges.create.responses[201], await res.json(), "recharges.create.201");
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: [api.recharges.listMy.path] });
    },
  });
}
