import { create } from "zustand";

export interface AuthUser {
  _id: string;
  email: string;
  username: string;
  avatarUrl?: string;
  preferences?: Record<string, unknown>;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isHydrating: boolean;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
  setUser: (user: Partial<AuthUser>) => void;
  setHydrated: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isHydrating: true,
  login: (token, user) => {
    if (typeof window !== "undefined") localStorage.setItem("hellow_token", token);
    set({ token, user, isAuthenticated: true });
  },
  logout: () => {
    if (typeof window !== "undefined") localStorage.removeItem("hellow_token");
    set({ token: null, user: null, isAuthenticated: false });
  },
  setUser: (patch) => {
    const cur = get().user;
    if (!cur) return;
    set({ user: { ...cur, ...patch } });
  },
  setHydrated: () => set({ isHydrating: false }),
}));
