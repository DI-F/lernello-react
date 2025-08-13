import { Navigate, useLocation } from "react-router";
import { Loader2 } from "lucide-react";
import type { PropsWithChildren } from "react";

// TODO: später mit React Query /auth/me ersetzen
function useAuth() {
  // mock: lies z. B. aus localStorage oder Query
  const user = null; // wenn eingeloggt: ein Objekt, sonst null
  const isLoading = false;
  return { user, isLoading };
}

export function RequireAuth({ children }: PropsWithChildren) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="grid min-h-svh place-items-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }
  if (!user) {
    const returnTo = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?returnTo=${returnTo}`} replace />;
  }
  return <>{children}</>;
}

export function RedirectIfAuthed({ children }: PropsWithChildren) {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  if (isLoading) return null;

  if (user) {
    const params = new URLSearchParams(location.search);
    const returnTo = params.get("returnTo") || "/"; // Dashboard
    return <Navigate to={returnTo} replace />;
  }
  return <>{children}</>;
}
