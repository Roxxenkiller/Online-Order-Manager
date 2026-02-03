import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, type ServicesResponse, type UpdateServicesInput } from "@shared/routes";
import { z } from "zod";

function parseWithLogging<T>(schema: z.ZodSchema<T>, data: unknown, label: string): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.error(`[Zod] ${label} validation failed:`, result.error.format());
    throw result.error;
  }
  return result.data;
}

export function useMyServices(enabled = true) {
  return useQuery<ServicesResponse>({
    queryKey: [api.services.getMy.path],
    enabled,
    queryFn: async () => {
      const res = await fetch(api.services.getMy.path, { credentials: "include" });
      if (res.status === 401) {
        const err = parseWithLogging(api.services.getMy.responses[401], await res.json(), "services.getMy.401");
        throw new Error(`401: ${err.message}`);
      }
      if (!res.ok) throw new Error("Failed to fetch services");
      return parseWithLogging(api.services.getMy.responses[200], await res.json(), "services.getMy.200");
    },
  });
}

export function useUpdateMyServices() {
  const qc = useQueryClient();
  return useMutation<ServicesResponse, Error, UpdateServicesInput>({
    mutationFn: async (updates) => {
      const validated = api.services.updateMy.input.parse(updates);
      const res = await fetch(api.services.updateMy.path, {
        method: api.services.updateMy.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });

      if (res.status === 401) {
        const err = parseWithLogging(api.services.updateMy.responses[401], await res.json(), "services.updateMy.401");
        throw new Error(`401: ${err.message}`);
      }
      if (res.status === 400) {
        const err = parseWithLogging(api.services.updateMy.responses[400], await res.json(), "services.updateMy.400");
        throw new Error(err.message);
      }
      if (!res.ok) throw new Error("Failed to update services");

      return parseWithLogging(api.services.updateMy.responses[200], await res.json(), "services.updateMy.200");
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: [api.services.getMy.path] });
    },
  });
}
