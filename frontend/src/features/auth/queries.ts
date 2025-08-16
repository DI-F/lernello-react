import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { logout, me, verifyCode } from "@/api/resources/auth.ts";
import type { VerifyCodeInput } from "@/schemas/auth/verify-code.input";
import type { User } from "@/schemas/user/user.ts";

export function useMeQuery() {
  return useQuery<User | null>({
    queryKey: ["me"],
    queryFn: me,
    retry: false, // Do not retry on failure, as this is a user-specific query
  });
}

export function useVerifyCodeMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: VerifyCodeInput) => verifyCode(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["me"] }),
  });
}

export function useLogoutMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      qc.setQueryData(["me"], null);
      qc.removeQueries({ queryKey: ["me"], exact: false });
    },
  });
}
