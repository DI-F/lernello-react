import * as React from "react";
import { GalleryVerticalEnd } from "lucide-react";
import { useForm } from "react-hook-form";

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

type Values = { email: string; remember: boolean };

type Props = React.ComponentProps<"div"> & {
  onSubmit?: (values: Values) => void;
  loading?: boolean;
  errorMessage?: string | null;
};

export function LoginForm({
  className,
  onSubmit,
  loading = false,
  errorMessage = null,
  ...props
}: Props) {
  const form = useForm<Values>({
    defaultValues: { email: "", remember: true },
    mode: "onSubmit",
  });

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((vals) => {
            onSubmit?.(vals);
            if (!onSubmit) console.log("submit", vals);
          })}
          className="flex flex-col gap-6"
        >
          {/* Branding/Header */}
          <div className="flex flex-col items-center gap-2">
            <div className="flex size-10 items-center justify-center rounded-lg">
              <GalleryVerticalEnd className="size-7" />
            </div>
            <h1 className="text-xl font-bold">Welcome to Lernello</h1>
            <p className="text-sm text-muted-foreground">
              Sign in with your email
            </p>
          </div>

          {/* Email */}
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
                    placeholder="you@company.com"
                    autoComplete="email"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Remember device */}
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

          {/* Error Message */}
          {errorMessage ? (
            <p className="text-sm text-destructive">{errorMessage}</p>
          ) : null}

          {/* Submit */}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Sending..." : "Continue"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
