import { OtpSchema } from "@/schemas/common/otp.ts";
import { z } from "zod";
import { EmailSchema } from "@/schemas/common/email.ts";

export const VerifyCodeInputSchema = z.object({
  email: EmailSchema,
  code: OtpSchema,
});
export type VerifyCodeInput = z.infer<typeof VerifyCodeInputSchema>;
