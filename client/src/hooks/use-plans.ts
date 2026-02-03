import { useQuery } from "@tanstack/react-query";
import { api, type PlansListResponse } from "@shared/routes";
import { z } from "zod";

function parseWithLogging<T>(schema: z.ZodSchema<T>, data: unknown, label: string): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.error(`[Zod] ${label} validation failed:`, result.error.format());
    throw result.error;
  }
  return result.data;
}

export function usePlans(params?: { type?: "topup" | "special"; activeOnly?: "true" | "false" }) {
  const qs = new URLSearchParams();
  if (params?.type) qs.set("type", params.type);
  if (params?.activeOnly) qs.set("activeOnly", params.activeOnly);

  const url = qs.toString() ? `${api.plans.list.path}?${qs.toString()}` : api.plans.list.path;

  return useQuery<PlansListResponse>({
    queryKey: [url],
    queryFn: async () => {
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error(`Failed to fetch plans (${res.status})`);
      const json = await res.json();
      return parseWithLogging(api.plans.list.responses[200], json, "plans.list");
    },
  });
}
