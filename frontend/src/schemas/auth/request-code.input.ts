import { z } from "zod";

export const RequestCodeInputSchema = z.object({
  email: z.string().email(),
  remember: z.boolean().default(true),
});
export type RequestCodeInput = z.infer<typeof RequestCodeInputSchema>;
