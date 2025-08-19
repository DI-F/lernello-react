import { z } from "zod";

export const VerifyCodeInputSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
});
export type VerifyCodeInput = z.infer<typeof VerifyCodeInputSchema>;
