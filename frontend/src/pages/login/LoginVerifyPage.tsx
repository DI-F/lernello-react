import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Separator } from "@/components/ui/separator";

export function LoginVerifyPage() {
  const email = "you@company.com";

  return (
    <div className="bg-background flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-xl font-bold">Check your email</h1>
          <p className="text-sm text-muted-foreground">
            We sent a 6-digit code to{" "}
            <span className="font-medium">{email}</span>
          </p>
        </div>

        <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
          <div className="flex flex-col items-center gap-2">
            <Label htmlFor="otp" className="text-base font-medium text-center">
              Enter code
            </Label>

            <InputOTP id="otp" maxLength={6} className="mx-auto">
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

            {/* <p className="text-sm text-destructive">Invalid or expired code.</p> */}
          </div>

          <Button type="submit" className="w-full">
            Verify & continue
          </Button>
        </form>

        <div className="space-y-3 text-center text-sm">
          <Separator />
          <div className="flex items-center justify-between">
            <button
              type="button"
              className="text-muted-foreground underline underline-offset-4"
            >
              Change email
            </button>
            <button
              type="button"
              className="text-muted-foreground underline underline-offset-4 disabled:opacity-50"
              disabled
            >
              Resend code
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
