import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, type MyProfileResponse, type UpsertMyProfileInput } from "@shared/routes";
import { z } from "zod";

function parseWithLogging<T>(schema: z.ZodSchema<T>, data: unknown, label: string): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.error(`[Zod] ${label} validation failed:`, result.error.format());
    throw result.error;
  }
  return result.data;
}

export function useMyProfile(enabled = true) {
  return useQuery<MyProfileResponse>({
    queryKey: [api.profile.getMy.path],
    enabled,
    queryFn: async () => {
      const res = await fetch(api.profile.getMy.path, { credentials: "include" });
      if (res.status === 401) {
        const err = parseWithLogging(api.profile.getMy.responses[401], await res.json(), "profile.getMy.401");
        throw new Error(`401: ${err.message}`);
      }
      if (!res.ok) throw new Error("Failed to fetch profile");
      return parseWithLogging(api.profile.getMy.responses[200], await res.json(), "profile.getMy.200");
    },
  });
}

export function useUpsertMyProfile() {
  const qc = useQueryClient();
  return useMutation<MyProfileResponse, Error, UpsertMyProfileInput>({
    mutationFn: async (updates) => {
      const validated = api.profile.upsertMy.input.parse(updates);
      const res = await fetch(api.profile.upsertMy.path, {
        method: api.profile.upsertMy.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });

      if (res.status === 401) {
        const err = parseWithLogging(api.profile.upsertMy.responses[401], await res.json(), "profile.upsertMy.401");
        throw new Error(`401: ${err.message}`);
      }
      if (res.status === 400) {
        const err = parseWithLogging(api.profile.upsertMy.responses[400], await res.json(), "profile.upsertMy.400");
        throw new Error(err.message);
      }
      if (!res.ok) throw new Error("Failed to update profile");

      return parseWithLogging(api.profile.upsertMy.responses[200], await res.json(), "profile.upsertMy.200");
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: [api.profile.getMy.path] });
      await qc.invalidateQueries({ queryKey: [api.admin.users.path] });
    },
  });
}
