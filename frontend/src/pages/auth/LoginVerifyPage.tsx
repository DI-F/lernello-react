import { useEffect } from "react";
import { useSearchParams } from "react-router";
import { VerifyForm } from "@/features/auth/components/LoginVerifyForm.tsx";
import { useVerifyController } from "@/features/auth/hooks/useVerifyController.ts";

export function LoginVerifyPage() {
  const [sp] = useSearchParams();
  const email = sp.get("email") ?? "";
  const remember = sp.get("remember") !== "false"; // default true
  const returnTo = sp.get("returnTo") || "/";

  useEffect(() => {
    if (!email) window.location.replace("/login");
  }, [email]);

  const ctrl = useVerifyController(email, remember, returnTo);

  return (
    <div className="bg-background flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <VerifyForm email={email} controller={ctrl} />
      </div>
    </div>
  );
}
