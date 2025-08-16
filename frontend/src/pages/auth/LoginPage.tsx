import { LoginForm } from "@/features/auth/components/LoginForm.tsx";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { requestCode } from "@/api/resources/auth.ts";
import type { RequestCodeInput } from "@/schemas/auth/request-code.input.ts";

export function LoginPage() {
  const navigate = useNavigate();

  const requestCodeMutation = useMutation({
    mutationFn: (input: RequestCodeInput) => requestCode(input),
    onSuccess: (_data, variables) => {
      navigate(`/verify?email=${encodeURIComponent(variables.email)}`);
    },
  });
  return (
    <div className="bg-background flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm
          onSubmit={(vals) => requestCodeMutation.mutate(vals)}
          loading={requestCodeMutation.isPending}
          errorMessage={
            requestCodeMutation.error ? "Could not send code. Try again." : null
          }
        />
      </div>
    </div>
  );
}
