import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { logout, me } from "@/api/resources/auth.ts";

export const useAuthUser = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["me"],
    queryFn: () => me(),
    staleTime: 120_000, // 1 Min "freshness"
    refetchOnWindowFocus: false,
  });

  const signOut = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.setQueryData(["me"], null);
      queryClient.removeQueries({ queryKey: ["me"], exact: false });
    },
  });

  return {
    user: query.data,
    isLoading: query.isLoading,
    refetch: query.refetch,
    signOut,
  };
};
