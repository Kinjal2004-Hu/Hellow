import { Link } from "@tanstack/react-router";
import {
  Users,
  MapPin,
  Video,
  Newspaper,
  Music,
  Play,
  Mail,
  Bot,
  UserCircle2,
  FolderOpen,
} from "lucide-react";
import { useUIStore } from "@/store/useUIStore";

type Item =
  | { kind: "link"; to: string; label: string; Icon: typeof Users }
  | { kind: "panel"; panel: "youtube" | "gmail"; label: string; Icon: typeof Users }
  | { kind: "action"; action: () => void; label: string; Icon: typeof Users };

const iconBtn =
  "h-[38px] w-[38px] grid place-items-center rounded-xl text-rail-foreground transition-all duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-accent hover:text-foreground active:scale-95 relative group";

const tooltip =
  "absolute left-[-10px] top-1/2 -translate-y-1/2 -translate-x-full px-2 py-1 rounded-lg bg-foreground text-background text-[11px] font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] pointer-events-none shadow-pop tooltip-enter";

export function RightPanel() {
  const openPanel = useUIStore((s) => s.openPanel);
  const openModal = useUIStore((s) => s.openModal);

  const items: Item[] = [
    { kind: "link", to: "/contacts", label: "Contacts", Icon: Users },
    { kind: "link", to: "/spotsync", label: "SpotSync", Icon: MapPin },
    { kind: "link", to: "/meetings", label: "Meetings", Icon: Video },
    { kind: "action", action: () => openModal("notes"), label: "Notes", Icon: Newspaper },
    { kind: "link", to: "/music", label: "Music", Icon: Music },
    { kind: "panel", panel: "youtube", label: "YouTube", Icon: Play },
    { kind: "panel", panel: "gmail", label: "Gmail", Icon: Mail },
    { kind: "link", to: "/news", label: "Smart News", Icon: Bot },
    { kind: "link", to: "/profile", label: "Profile", Icon: UserCircle2 },
  ];

  return (
    <aside className="fixed right-0 top-[96px] bottom-0 w-14 bg-rail border-l border-border flex flex-col items-center py-3 gap-1.5 z-30">
      <nav className="flex flex-col items-center gap-[18px] flex-1 pt-4">
        {items.map((it, i) => {
          const Icon = it.Icon;

          if (it.kind === "link") {
            return (
              <Link key={i} to={it.to} aria-label={it.label} title={it.label} className={iconBtn}>
                <Icon className="h-5 w-5" />
                <span className={tooltip}>{it.label}</span>
              </Link>
            );
          }
          if (it.kind === "panel") {
            return (
              <button
                key={i}
                onClick={() => openPanel(it.panel)}
                aria-label={it.label}
                title={it.label}
                className={iconBtn}
              >
                <Icon className="h-5 w-5" />
                <span className={tooltip}>{it.label}</span>
              </button>
            );
          }
          return (
            <button
              key={i}
              onClick={it.action}
              aria-label={it.label}
              title={it.label}
              className={iconBtn}
            >
              <Icon className="h-5 w-5" />
              <span className={tooltip}>{it.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="mt-auto pb-5 w-full flex justify-center">
        <Link
          to="/drive"
          aria-label="Drive"
          title="Drive"
          className="h-[48px] w-[48px] grid place-items-center rounded-[16px] bg-primary text-primary-foreground shadow-pop transition-all duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-110 active:scale-95"
        >
          <FolderOpen className="h-5 w-5" />
        </Link>
      </div>
    </aside>
  );
}
