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
import { useLogoutMutation } from "@/hooks/useAuthMutations";

const btn = "transition duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-95";

function useNowString() {
  const [now] = useState<Date>(() => new Date());
  const dateStr = now.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const timeStr = now.toLocaleString(undefined, {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  return `${dateStr} · ${timeStr}`;
}

export function Navbar() {
  const openModal = useUIStore((s) => s.openModal);
  const setSearchQuery = useUIStore((s) => s.setSearchQuery);
  const user = useAuthStore((s) => s.user);
  const { mutate: doLogout } = useLogoutMutation();
  const [q, setQ] = useState("");
  const nowStr = useNowString();
  const username = user?.username ?? "kinjal";

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!q.trim()) return;
    setSearchQuery(q.trim());
  };

  return (
    <header className="fixed top-0 inset-x-0 z-40 h-[96px] bg-background/85 backdrop-blur-sm border-b border-border flex items-center gap-4 px-4 sm:px-5">
      <Link to="/" className="flex items-center gap-3 shrink-0 group">
        <div className="h-11 w-11 rounded-full bg-primary text-primary-foreground grid place-items-center font-bold text-[18px] transition duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105">
          H
        </div>
        <span className="font-bold text-[19px] tracking-tight">Hellow</span>
      </Link>

      <div className="hidden md:flex flex-col leading-tight pl-3.5 pr-4 border-l border-border/60 min-w-0 translate-y-[1px]">
        <span className="font-medium text-[18px] leading-none">Hello, {username}</span>
        <span className="text-[12px] text-muted-foreground mt-1">{nowStr}</span>
      </div>

      <form onSubmit={submitSearch} className="flex-1 max-w-[560px] mx-auto flex items-center gap-2.5">
        <div className="flex-1 flex items-center gap-2.5 rounded-full bg-surface border border-border/50 px-4 h-11 shadow-soft transition-shadow duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] focus-within:shadow-card focus-within:border-border">
          <Search className="h-4 w-4 text-muted-foreground/70 shrink-0" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search the web with DuckDuckGo..."
            className="bg-transparent outline-none flex-1 text-[15px] placeholder:text-muted-foreground/55"
          />
        </div>
        <button
          type="submit"
          className={`h-11 px-4.5 rounded-full bg-primary text-primary-foreground text-[14px] font-semibold ${btn} shrink-0 hover:opacity-90`}
        >
          Search
        </button>
      </form>

      <div className="hidden lg:flex items-center gap-0.5 pr-1">
        <IconBtn label="Notes" onClick={() => openModal("notes")}>
          <FileText className="h-[17px] w-[17px]" />
        </IconBtn>
        <IconBtn label="Tasks" onClick={() => openModal("tasks")}>
          <CheckSquare className="h-[17px] w-[17px]" />
        </IconBtn>
        <IconBtn label="Calendar" onClick={() => openModal("calendar")}>
          <Calendar className="h-[17px] w-[17px]" />
        </IconBtn>
        <IconBtn label="Bookmarks" onClick={() => openModal("bookmarks")}>
          <Bookmark className="h-[17px] w-[17px]" />
        </IconBtn>
      </div>

      <button
        onClick={() => openModal("newContact")}
        className={`hidden md:inline-flex items-center gap-2 h-11 px-5 rounded-full bg-primary text-primary-foreground text-[14px] font-semibold ${btn} shrink-0 hover:opacity-90`}
      >
        <UserPlus className="h-[17px] w-[17px]" />
        Add contact
      </button>

      <button
        onClick={() => doLogout()}
        aria-label="Sign out"
        className={`h-[34px] w-[34px] grid place-items-center rounded-full text-foreground/60 transition duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-accent hover:text-foreground active:scale-95 shrink-0`}
      >
        <LogOut className="h-[17px] w-[17px]" />
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
      className="h-[34px] w-[34px] grid place-items-center rounded-full text-foreground/60 transition duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-accent hover:text-foreground active:scale-95"
    >
      {children}
    </button>
  );
}
