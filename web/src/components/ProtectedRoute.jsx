// Protects /vault and /admin — redirects to /login when signed out.
// AdminRoute additionally verifies is_admin via /api/auth/me.
import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { api, auth } from "@/lib/api";

export function ProtectedRoute({ children, requireAdmin = false }) {
  const location = useLocation();
  const [state, setState] = useState("loading"); // loading | ok | denied | signed_out

  useEffect(() => {
    if (!auth.isSignedIn()) {
      setState("signed_out");
      return;
    }
    let cancelled = false;
    api
      .me()
      .then((u) => {
        if (cancelled) return;
        if (requireAdmin && !u.is_admin) setState("denied");
        else setState("ok");
      })
      .catch(() => {
        if (cancelled) return;
        auth.clear();
        setState("signed_out");
      });
    return () => {
      cancelled = true;
    };
  }, [requireAdmin, location.pathname]);

  if (state === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface" data-testid="route-loading">
        <div className="animate-pulse text-on-surface-secondary text-ds-lg">Loading…</div>
      </div>
    );
  }
  if (state === "signed_out") {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  if (state === "denied") {
    return <Navigate to="/vault" replace />;
  }
  return children;
}
