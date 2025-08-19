import z from "zod";

export const LoginVerifySchema = z.object({
  code: z.string().regex(/^\d{6}$/, "Enter 6 digits"),
});
export type VerifyFormValues = z.infer<typeof LoginVerifySchema>;
