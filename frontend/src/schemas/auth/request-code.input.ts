import { z } from "zod";
import { EmailSchema } from "@/schemas/common/email.ts";

export const RequestCodeInputSchema = z.object({
  email: EmailSchema,
  remember: z.boolean().default(true),
});
export type RequestCodeInput = z.infer<typeof RequestCodeInputSchema>;
