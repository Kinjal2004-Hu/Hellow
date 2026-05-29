import { create } from "zustand";

export type ThemeMode = "light" | "dark" | "system";

interface ThemeState {
  mode: ThemeMode;
  resolved: "light" | "dark";
  setMode: (mode: ThemeMode) => void;
  initTheme: () => void;
}

function getSystemPreference(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function resolveTheme(mode: ThemeMode): "light" | "dark" {
  if (mode === "system") return getSystemPreference();
  return mode;
}

function applyTheme(resolved: "light" | "dark") {
  const root = document.documentElement;
  if (resolved === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  mode: "light",
  resolved: "light",

  setMode: (mode) => {
    const resolved = resolveTheme(mode);
    if (typeof window !== "undefined") {
      localStorage.setItem("hellow_theme", mode);
      applyTheme(resolved);
    }
    set({ mode, resolved });
  },

  initTheme: () => {
    const stored = (typeof window !== "undefined"
      ? localStorage.getItem("hellow_theme")
      : null) as ThemeMode | null;
    const mode = stored ?? "light";
    const resolved = resolveTheme(mode);
    applyTheme(resolved);
    set({ mode, resolved });

    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      if (get().mode === "system") {
        const r = getSystemPreference();
        applyTheme(r);
        set({ resolved: r });
      }
    };
    mql.addEventListener("change", handler);
  },
}));
