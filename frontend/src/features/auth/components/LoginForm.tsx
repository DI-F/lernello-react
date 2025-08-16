import { useForm } from "react-hook-form";
import { GalleryVerticalEnd } from "lucide-react";

import { cn } from "@/lib/utils.ts";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Checkbox } from "@/components/ui/checkbox.tsx";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form.tsx";
import { zodResolver } from "@hookform/resolvers/zod";
import { type LoginForm, LoginFormSchema } from "@/schemas/auth/login.form.ts";

export interface LoginFormProps {
  className?: string;
  defaultEmail?: string;
  defaultRemember?: boolean;
  loading?: boolean;
  errorMessage?: string | null;
  onSubmit?: (values: LoginForm) => void; // unsere eigene Callback-Signatur
}

export function LoginForm({
  className,
  defaultEmail = "",
  defaultRemember = true,
  loading = false,
  errorMessage = null,
  onSubmit,
}: LoginFormProps) {
  const form = useForm<LoginForm>({
    resolver: zodResolver(LoginFormSchema),
    defaultValues: { email: defaultEmail, remember: defaultRemember },
    mode: "onSubmit",
  });

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((vals) => onSubmit?.(vals))}
          className="flex flex-col gap-6"
        >
          <div className="flex flex-col items-center gap-2">
            <div className="flex size-10 items-center justify-center rounded-lg">
              <GalleryVerticalEnd className="size-7" />
            </div>
            <h1 className="text-xl font-bold">Welcome to Lernello</h1>
            <p className="text-sm text-muted-foreground">
              Sign in with your email
            </p>
          </div>

          <FormField
            control={form.control}
            name="email"
            rules={{ required: "Email is required" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="email">Email</FormLabel>
                <FormControl>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@company.com"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="remember"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center gap-2">
                  <FormControl>
                    <Checkbox
                      id="remember"
                      checked={field.value}
                      onCheckedChange={(v) => field.onChange(Boolean(v))}
                    />
                  </FormControl>
                  <FormLabel
                    htmlFor="remember"
                    className="text-sm text-muted-foreground"
                  >
                    Remember this device for 30 days
                  </FormLabel>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {errorMessage ? (
            <p className="text-sm text-destructive">{errorMessage}</p>
          ) : null}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Sending…" : "Continue"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
