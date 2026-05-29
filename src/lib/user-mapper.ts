import type { AuthUser } from "@/store/useAuthStore";

export function mapUser(u: {
  id: string;
  email: string;
  username: string;
  avatarUrl: string | null;
}): AuthUser {
  return {
    _id: u.id,
    email: u.email,
    username: u.username,
    avatarUrl: u.avatarUrl ?? undefined,
  };
}
