import { useEffect, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuthStore } from "@/store/useAuthStore";
import { PageSpinner } from "@/components/ui/spinner";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isHydrating = useAuthStore((s) => s.isHydrating);

  useEffect(() => {
    if (!isHydrating && !isAuthenticated) {
      navigate({ to: "/login", replace: true });
    }
  }, [isHydrating, isAuthenticated, navigate]);

  if (isHydrating) return <PageSpinner />;
  if (!isAuthenticated) return null;

  return <>{children}</>;
}
