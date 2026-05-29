import { useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAuthStore } from "@/store/useAuthStore";
import { fetchMe } from "@/services/auth";
import { mapUser } from "@/lib/user-mapper";
import { PageSpinner } from "@/components/ui/spinner";

export const Route = createFileRoute("/oauth-callback")({
  component: OAuthCallbackPage,
});

function OAuthCallbackPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (!token) {
      navigate({ to: "/login", replace: true });
      return;
    }

    localStorage.setItem("hellow_token", token);

    fetchMe()
      .then(({ user }) => {
        setAuth(token, mapUser(user));
        navigate({ to: "/", replace: true });
      })
      .catch(() => {
        localStorage.removeItem("hellow_token");
        navigate({ to: "/login", replace: true });
      });
  }, [setAuth, navigate]);

  return <PageSpinner />;
}
