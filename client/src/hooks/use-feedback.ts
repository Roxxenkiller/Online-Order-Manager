import { useMutation, useQuery } from "@tanstack/react-query";
import { api, type CreateFeedbackInput, type FeedbackResponse } from "@shared/routes";
import { z } from "zod";

function parseWithLogging<T>(schema: z.ZodSchema<T>, data: unknown, label: string): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.error(`[Zod] ${label} validation failed:`, result.error.format());
    throw result.error;
  }
  return result.data;
}

export function useCreateFeedback() {
  return useMutation<FeedbackResponse, Error, CreateFeedbackInput>({
    mutationFn: async (input) => {
      const validated = api.feedback.create.input.parse(input);
      const res = await fetch(api.feedback.create.path, {
        method: api.feedback.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });

      if (res.status === 400) {
        const err = parseWithLogging(api.feedback.create.responses[400], await res.json(), "feedback.create.400");
        throw new Error(err.message);
      }
      if (!res.ok) throw new Error("Failed to send feedback");

      return parseWithLogging(api.feedback.create.responses[201], await res.json(), "feedback.create.201");
    },
  });
}

export function useAdminFeedback(enabled = true) {
  return useQuery({
    queryKey: [api.feedback.listAdmin.path],
    enabled,
    queryFn: async () => {
      const res = await fetch(api.feedback.listAdmin.path, { credentials: "include" });
      if (res.status === 401) {
        const err = parseWithLogging(api.feedback.listAdmin.responses[401], await res.json(), "feedback.listAdmin.401");
        throw new Error(`401: ${err.message}`);
      }
      if (!res.ok) throw new Error("Failed to fetch feedback (admin)");
      return parseWithLogging(api.feedback.listAdmin.responses[200], await res.json(), "feedback.listAdmin.200");
    },
  });
}
