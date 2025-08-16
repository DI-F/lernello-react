import { useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { requestCode, verifyCode } from "@/api/resources/auth.ts";
import { useNavigate, useSearchParams } from "react-router";
import type { VerifyCodeInput } from "@/schemas/auth/verify-code.input.ts";
import type { RequestCodeInput } from "@/schemas/auth/request-code.input.ts";
import { VerifyForm } from "@/features/auth/components/LoginVerifyForm.tsx";

export function LoginVerifyPage() {
  const navigate = useNavigate();
  const [sp] = useSearchParams();
  const queryClient = useQueryClient();

  const email = sp.get("email") ?? "";
  const returnTo = sp.get("returnTo") || "/";

  const verifyMutation = useMutation({
    mutationFn: (input: VerifyCodeInput) => verifyCode(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["me"] });
      navigate(returnTo, { replace: true });
    },
  });

  const resendMutation = useMutation({
    mutationFn: (input: RequestCodeInput) => requestCode(input),
  });

  useEffect(() => {
    if (!email) navigate("/login", { replace: true });
  }, [email, navigate]);

  return (
    <div className="bg-background flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <VerifyForm
          email={email}
          onSubmit={({ code }) => verifyMutation.mutate({ email, code })}
          onChangeEmail={() =>
            navigate("/login", { replace: true, state: { email } })
          }
          onResend={() =>
            email && resendMutation.mutate({ email, remember: true })
          }
          isResendDisabled={!email || resendMutation.isPending}
          loading={verifyMutation.isPending}
          errorMessage={
            verifyMutation.error
              ? "Invalid or expired code."
              : resendMutation.error
                ? "Could not resend code."
                : null
          }
        />
      </div>
    </div>
  );
}
