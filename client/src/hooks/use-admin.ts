import { useQuery } from "@tanstack/react-query";
import { api, type AdminOverviewResponse, type AdminUsersResponse } from "@shared/routes";
import { z } from "zod";

function parseWithLogging<T>(schema: z.ZodSchema<T>, data: unknown, label: string): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.error(`[Zod] ${label} validation failed:`, result.error.format());
    throw result.error;
  }
  return result.data;
}

export function useAdminOverview(date?: string, enabled = true) {
  const qs = new URLSearchParams();
  if (date) qs.set("date", date);
  const url = qs.toString() ? `${api.admin.overview.path}?${qs}` : api.admin.overview.path;

  return useQuery<AdminOverviewResponse>({
    queryKey: [url],
    enabled,
    retry: false,
    queryFn: async () => {
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 401) {
        const err = parseWithLogging(api.admin.overview.responses[401], await res.json(), "admin.overview.401");
        throw new Error(`401: ${err.message}`);
      }
      if (!res.ok) throw new Error("Failed to fetch admin overview");
      return parseWithLogging(api.admin.overview.responses[200], await res.json(), "admin.overview.200");
    },
  });
}

export function useAdminUsers(enabled = true) {
  return useQuery<AdminUsersResponse>({
    queryKey: [api.admin.users.path],
    enabled,
    queryFn: async () => {
      const res = await fetch(api.admin.users.path, { credentials: "include" });
      if (res.status === 401) {
        const err = parseWithLogging(api.admin.users.responses[401], await res.json(), "admin.users.401");
        throw new Error(`401: ${err.message}`);
      }
      if (!res.ok) throw new Error("Failed to fetch users (admin)");
      return parseWithLogging(api.admin.users.responses[200], await res.json(), "admin.users.200");
    },
  });
}
