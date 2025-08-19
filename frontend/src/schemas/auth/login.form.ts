import z from "zod";

export const LoginFormSchema = z.object({
  email: z.string().email("Enter a valid email"),
  remember: z.boolean(),
});
export type LoginForm = z.infer<typeof LoginFormSchema>;
