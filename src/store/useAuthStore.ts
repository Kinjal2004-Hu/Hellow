import { create } from "zustand";
import { fetchMe } from "@/services/auth";

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
  setAuth: (token: string, user: AuthUser) => void;
  clearAuth: () => void;
  setUser: (patch: Partial<AuthUser>) => void;
  setHydrated: () => void;
  hydrate: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isHydrating: true,

  setAuth: (token, user) => {
    localStorage.setItem("hellow_token", token);
    set({ token, user, isAuthenticated: true });
  },

  clearAuth: () => {
    localStorage.removeItem("hellow_token");
    set({ token: null, user: null, isAuthenticated: false });
  },

  setUser: (patch) => {
    const cur = get().user;
    if (!cur) return;
    set({ user: { ...cur, ...patch } });
  },

  setHydrated: () => set({ isHydrating: false }),

  hydrate: async () => {
    const token = localStorage.getItem("hellow_token");
    if (!token) {
      set({ isHydrating: false });
      return;
    }
    try {
      const { user } = await fetchMe();
      set({
        token,
        user: {
          _id: user.id,
          email: user.email,
          username: user.username,
          avatarUrl: user.avatarUrl ?? undefined,
        },
        isAuthenticated: true,
        isHydrating: false,
      });
    } catch {
      localStorage.removeItem("hellow_token");
      set({ token: null, user: null, isAuthenticated: false, isHydrating: false });
    }
  },
}));
