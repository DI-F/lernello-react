import { z } from "zod";

export const SpringErrorSchema = z.object({
  status: z.number().int().nonnegative(),
  message: z.string(),
  error: z.string(),
  timestamp: z.string(),
  path: z.string(),
  trace: z.string().optional(),
});

export type SpringError = z.infer<typeof SpringErrorSchema>;
