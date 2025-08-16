import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button.tsx";
import { Label } from "@/components/ui/label.tsx";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form.tsx";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp.tsx";
import { Separator } from "@/components/ui/separator.tsx";

export interface VerifyFormValues {
  code: string;
}

export interface VerifyFormProps {
  className?: string;
  email: string;
  loading?: boolean;
  errorMessage?: string | null;
  isResendDisabled?: boolean;
  onSubmit?: (values: VerifyFormValues) => void;
  onChangeEmail?: () => void;
  onResend?: () => void;
}

export function VerifyForm({
  className,
  email,
  loading = false,
  errorMessage = null,
  isResendDisabled = true,
  onSubmit,
  onChangeEmail,
  onResend,
}: VerifyFormProps) {
  const form = useForm<VerifyFormValues>({
    defaultValues: { code: "" },
    mode: "onSubmit",
  });
  const code = form.watch("code");

  return (
    <div className={className}>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((vals) => onSubmit?.(vals))}
          className="flex flex-col gap-6"
        >
          <div className="text-center space-y-1">
            <h1 className="text-xl font-bold">Check your email</h1>
            <p className="text-sm text-muted-foreground">
              We sent a 6-digit code to{" "}
              <span className="font-medium">{email}</span>
            </p>
          </div>

          <FormField
            control={form.control}
            name="code"
            rules={{
              required: "Code is required",
              minLength: { value: 6, message: "Enter 6 digits" },
              maxLength: { value: 6, message: "Enter 6 digits" },
            }}
            render={({ field }) => (
              <FormItem>
                <div className="flex flex-col items-center gap-2">
                  <Label
                    htmlFor="otp"
                    className="text-base font-medium text-center"
                  >
                    Enter code
                  </Label>
                  <FormControl>
                    <InputOTP
                      id="otp"
                      maxLength={6}
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      className="mx-auto"
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                      </InputOTPGroup>
                      <InputOTPSeparator />
                      <InputOTPGroup>
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </FormControl>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />

          {errorMessage ? (
            <p className="text-sm text-destructive text-center">
              {errorMessage}
            </p>
          ) : null}

          <Button
            type="submit"
            className="w-full"
            disabled={loading || (code?.length ?? 0) !== 6}
          >
            {loading ? "Verifying…" : "Verify & continue"}
          </Button>

          <div className="space-y-3 text-center text-sm">
            <Separator />
            <div className="flex items-center justify-between">
              <Button
                type="button"
                className="text-muted-foreground underline underline-offset-4"
                onClick={onChangeEmail}
              >
                Change email
              </Button>
              <Button
                type="button"
                className="text-muted-foreground underline underline-offset-4 disabled:opacity-50"
                onClick={onResend}
                disabled={isResendDisabled}
              >
                Resend code
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
