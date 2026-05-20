import { Link } from "@tanstack/react-router";
import {
  Users,
  MapPin,
  Video,
  StickyNote,
  Music,
  Play,
  Mail,
  Bot,
  UserCircle2,
} from "lucide-react";
import { useUIStore } from "@/store/useUIStore";

type Item =
  | { kind: "link"; to: string; label: string; Icon: typeof Users }
  | { kind: "panel"; panel: "youtube" | "gmail"; label: string; Icon: typeof Users }
  | { kind: "action"; onClick: () => void; label: string; Icon: typeof Users };

export function RightPanel() {
  const openPanel = useUIStore((s) => s.openPanel);

  const items: Item[] = [
    { kind: "link", to: "/contacts", label: "Contacts", Icon: Users },
    { kind: "link", to: "/spotsync", label: "SpotSync", Icon: MapPin },
    { kind: "link", to: "/meetings", label: "Meetings", Icon: Video },
    { kind: "action", onClick: () => useUIStore.getState().openModal("notes"), label: "Notes", Icon: StickyNote },
    { kind: "link", to: "/music", label: "Music", Icon: Music },
    { kind: "panel", panel: "youtube", label: "YouTube", Icon: Play },
    { kind: "panel", panel: "gmail", label: "Gmail", Icon: Mail },
    { kind: "link", to: "/news", label: "Smart News", Icon: Bot },
    { kind: "link", to: "/profile", label: "Profile", Icon: UserCircle2 },
  ];

  return (
    <aside className="fixed right-0 top-16 bottom-0 w-14 bg-rail border-l border-border flex flex-col items-center py-3 gap-1.5">
      {items.map((it, i) => {
        const Icon = it.Icon;
        const cls =
          "h-10 w-10 grid place-items-center rounded-xl text-rail-foreground hover:bg-accent transition";
        if (it.kind === "link") {
          return (
            <Link key={i} to={it.to} aria-label={it.label} title={it.label} className={cls}>
              <Icon className="h-4.5 w-4.5" />
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
              className={cls}
            >
              <Icon className="h-4.5 w-4.5" />
            </button>
          );
        }
        return (
          <button
            key={i}
            onClick={it.onClick}
            aria-label={it.label}
            title={it.label}
            className={cls}
          >
            <Icon className="h-4.5 w-4.5" />
          </button>
        );
      })}
    </aside>
  );
}
