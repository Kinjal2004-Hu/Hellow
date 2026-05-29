import { api } from "./api";

export interface AuthResponse {
  token: string;
  user: { id: string; email: string; username: string; avatarUrl: string | null };
}

export async function loginUser(email: string, password: string): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>("/auth/login", { email, password });
  return data;
}

export async function registerUser(
  username: string,
  email: string,
  password: string,
): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>("/auth/register", {
    username,
    email,
    password,
  });
  return data;
}

export async function fetchMe(): Promise<{ user: AuthResponse["user"] }> {
  const { data } = await api.get("/auth/me");
  return data;
}

export async function logoutUser(): Promise<void> {
  await api.post("/auth/logout");
}

export function getGoogleOAuthUrl(): string {
  const base = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";
  return `${base}/auth/google`;
}
