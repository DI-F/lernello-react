import { Navigate, Outlet, useLocation } from "react-router";
import { FullPageSpinner } from "@/components/full-page-spinner.tsx";
import type { PropsWithChildren } from "react";
import { useMeQuery } from "@/features/auth/queries.ts";

export function RequireAuth() {
  const { data, status } = useMeQuery();
  const loc = useLocation();

  if (status === "pending") return <FullPageSpinner />;
  // no user data means => not authenticated
  if (!data) return <Navigate to="/login" replace state={{ from: loc }} />;
  return <Outlet />;
}

export function RedirectIfAuthed({ children }: PropsWithChildren) {
  const { data: user, status } = useMeQuery();
  const location = useLocation();

  if (status === "pending") return <FullPageSpinner />;

  if (user) {
    const params = new URLSearchParams(location.search);
    const returnTo = params.get("returnTo") || "/";
    return <Navigate to={returnTo} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}
