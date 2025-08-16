import { z } from "zod";

export const OtpSchema = z.string().regex(/^\d{6}$/, "Must be 6 digits");
export type Otp = z.infer<typeof OtpSchema>;
