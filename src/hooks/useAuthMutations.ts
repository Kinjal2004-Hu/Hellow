import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { loginUser, registerUser, logoutUser } from "@/services/auth";
import { useAuthStore } from "@/store/useAuthStore";
import { useUIStore } from "@/store/useUIStore";
import { mapUser } from "@/lib/user-mapper";

export function useLoginMutation() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const showToast = useUIStore((s) => s.showToast);

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      loginUser(email, password),
    onSuccess: ({ token, user }) => {
      setAuth(token, mapUser(user));
      showToast("Signed in successfully", "success");
      navigate({ to: "/", replace: true });
    },
    onError: (err: any) => {
      showToast(err?.response?.data?.error ?? "Login failed", "error");
    },
  });
}

export function useRegisterMutation() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const showToast = useUIStore((s) => s.showToast);

  return useMutation({
    mutationFn: ({
      username,
      email,
      password,
    }: {
      username: string;
      email: string;
      password: string;
    }) => registerUser(username, email, password),
    onSuccess: ({ token, user }) => {
      setAuth(token, mapUser(user));
      showToast("Account created!", "success");
      navigate({ to: "/", replace: true });
    },
    onError: (err: any) => {
      showToast(err?.response?.data?.error ?? "Registration failed", "error");
    },
  });
}

export function useLogoutMutation() {
  const navigate = useNavigate();
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const showToast = useUIStore((s) => s.showToast);

  return useMutation({
    mutationFn: logoutUser,
    onSuccess: () => {
      clearAuth();
      navigate({ to: "/login", replace: true });
    },
    onError: () => {
      clearAuth();
      navigate({ to: "/login", replace: true });
    },
  });
}
