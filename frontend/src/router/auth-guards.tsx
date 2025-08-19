import { Navigate, Outlet, useLocation } from "react-router";
import { FullPageSpinner } from "@/components/full-page-spinner";
import { useQuery } from "@tanstack/react-query";
import type { User } from "@/schemas/user/user.ts";
import { me } from "@/api/resources/auth.ts";

function useMeQuery() {
  return useQuery<User | null>({
    queryKey: ["me"],
    queryFn: me,
    retry: false, // Do not retry on failure, as this is a user-specific query
  });
}

export function RequireAuth() {
  const { data, status } = useMeQuery();
  const loc = useLocation();

  if (status === "pending") return <FullPageSpinner />;

  if (!data) {
    const returnTo = encodeURIComponent(loc.pathname + loc.search);
    return <Navigate to={`/login?returnTo=${returnTo}`} replace />;
  }
  return <Outlet />;
}

export function RedirectIfAuthed() {
  const { data: user, status } = useMeQuery();
  const location = useLocation();

  if (status === "pending") return <FullPageSpinner />;

  if (user) {
    const params = new URLSearchParams(location.search);
    const returnTo = params.get("returnTo") || "/";
    return <Navigate to={returnTo} replace />;
  }
  return <Outlet />;
}
