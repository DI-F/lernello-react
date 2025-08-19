import { useNavigate } from "react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { requestCode, verifyCode } from "@/api/resources/auth.ts";
import { toApiErrorMessage } from "@/api/client.ts";

export function useVerifyController(
  email: string,
  remember: boolean,
  returnTo = "/",
) {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const verifyM = useMutation({
    mutationFn: (code: string) => verifyCode({ email, code }, remember),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["me"] });
      navigate(returnTo, { replace: true });
    },
  });

  const resendM = useMutation({
    mutationFn: () => requestCode({ email, remember: true }),
  });

  return {
    submit: (code: string) => verifyM.mutate(code),
    resend: () => resendM.mutate(),
    changeEmail: () => navigate("/login", { replace: true, state: { email } }),
    status: {
      verifying: verifyM.isPending,
      resendDisabled: !email || resendM.isPending,
      error: verifyM.error
        ? toApiErrorMessage(verifyM.error)
        : resendM.error
          ? toApiErrorMessage(resendM.error)
          : null,
    },
  } as const;
}
