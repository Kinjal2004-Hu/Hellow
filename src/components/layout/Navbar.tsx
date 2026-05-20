import { Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  FileText,
  CheckSquare,
  Calendar,
  Bookmark,
  UserPlus,
  LogOut,
  Search,
} from "lucide-react";
import { useUIStore } from "@/store/useUIStore";
import { useAuthStore } from "@/store/useAuthStore";

function useNowString() {
  // Avoid SSR hydration mismatch by rendering empty until mounted.
  const [now] = useState<Date>(() => new Date());
  return now.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function Navbar() {
  const openModal = useUIStore((s) => s.openModal);
  const setSearchQuery = useUIStore((s) => s.setSearchQuery);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [q, setQ] = useState("");
  const nowStr = useNowString();
  const username = user?.username ?? "kinjal";

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!q.trim()) return;
    setSearchQuery(q.trim());
  };

  return (
    <header
      className="fixed top-0 inset-x-0 z-40 h-16 bg-background/85 backdrop-blur border-b border-border flex items-center gap-4 px-4"
    >
      <Link to="/" className="flex items-center gap-2 shrink-0">
        <div className="h-9 w-9 rounded-xl bg-primary text-primary-foreground grid place-items-center font-bold">
          H
        </div>
        <span className="font-semibold text-lg tracking-tight">Hellow</span>
      </Link>

      <div className="hidden md:flex flex-col leading-tight pl-2 pr-4 border-l border-border/70">
        <span className="font-medium text-sm">Hello, {username}</span>
        <span className="text-xs text-muted-foreground">{nowStr}</span>
      </div>

      <form onSubmit={submitSearch} className="flex-1 max-w-2xl mx-auto flex items-center gap-2">
        <div className="flex-1 flex items-center gap-2 rounded-full bg-surface border border-border px-4 h-10 shadow-soft">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search the web with DuckDuckGo..."
            className="bg-transparent outline-none flex-1 text-sm placeholder:text-muted-foreground"
          />
        </div>
        <button
          type="submit"
          className="h-10 px-4 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition"
        >
          Search
        </button>
      </form>

      <div className="hidden lg:flex items-center gap-1">
        <IconBtn label="Notes" onClick={() => openModal("notes")}><FileText className="h-4 w-4" /></IconBtn>
        <IconBtn label="Tasks" onClick={() => openModal("tasks")}><CheckSquare className="h-4 w-4" /></IconBtn>
        <IconBtn label="Calendar" onClick={() => openModal("calendar")}><Calendar className="h-4 w-4" /></IconBtn>
        <IconBtn label="Bookmarks" onClick={() => openModal("bookmarks")}><Bookmark className="h-4 w-4" /></IconBtn>
      </div>

      <button
        onClick={() => openModal("newContact")}
        className="hidden md:inline-flex items-center gap-2 h-10 px-4 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition"
      >
        <UserPlus className="h-4 w-4" />
        Add contact
      </button>

      <button
        onClick={logout}
        aria-label="Sign out"
        className="h-10 w-10 grid place-items-center rounded-full hover:bg-accent transition"
      >
        <LogOut className="h-4 w-4" />
      </button>
    </header>
  );
}

function IconBtn({
  children,
  label,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className="h-10 w-10 grid place-items-center rounded-full hover:bg-accent transition text-foreground/80"
    >
      {children}
    </button>
  );
}
