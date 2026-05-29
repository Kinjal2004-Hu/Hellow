import { Link } from "@tanstack/react-router";
import {
  Users,
  MapPin,
  Play,
  Video,
  Newspaper,
  Music,
  Mail,
  Bot,
  UserCircle2,
  FolderOpen,
  CheckSquare,
  MoreHorizontal,
} from "lucide-react";
import { useUIStore, type DrawerType } from "@/store/useUIStore";

type Item =
  | { kind: "link"; to: string; label: string; Icon: typeof Users }
  | { kind: "drawer"; drawer: DrawerType; label: string; Icon: typeof Users }
  | { kind: "action"; action: () => void; label: string; Icon: typeof Users };

const iconBtn =
  "h-[40px] w-[40px] grid place-items-center rounded-xl text-rail-foreground transition-all duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-accent hover:text-foreground active:scale-95 relative group";

const tooltip =
  "absolute left-[-8px] top-1/2 -translate-y-1/2 -translate-x-full px-2 py-1 rounded-lg bg-foreground text-background text-[11px] font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] pointer-events-none shadow-pop tooltip-enter";

export function RightToolRail() {
  const openDrawer = useUIStore((s) => s.openDrawer);
  const closeDrawer = useUIStore((s) => s.closeDrawer);
  const activeDrawer = useUIStore((s) => s.activeDrawer);
  const youtubeOpen = useUIStore((s) => s.panels.youtube);
  const openPanel = useUIStore((s) => s.openPanel);
  const openModal = useUIStore((s) => s.openModal);

  const items: Item[] = [
  { kind: "link", to: "/contacts", label: "Contacts", Icon: Users },
  { kind: "link", to: "/spotsync", label: "SpotSync", Icon: MapPin },
    {
      kind: "action",
      action: () => {
        closeDrawer();
        openPanel("youtube");
      },
      label: "YouTube",
      Icon: Play,
    },
    { kind: "drawer", drawer: "meetings", label: "Meetings", Icon: Video },
    { kind: "action", action: () => openModal("notes"), label: "Notes", Icon: Newspaper },
    { kind: "drawer", drawer: "media", label: "Media", Icon: Music },
    { kind: "drawer", drawer: "mail", label: "Mail", Icon: Mail },
    { kind: "drawer", drawer: "news", label: "News", Icon: Bot },
    { kind: "drawer", drawer: "tasks", label: "Tasks", Icon: CheckSquare },
    { kind: "drawer", drawer: "profile", label: "Profile", Icon: UserCircle2 },
  ];

  return (
    <aside className="fixed right-0 top-[96px] bottom-0 w-[72px] bg-rail border-l border-border flex flex-col items-center py-3 gap-1.5 z-30">
      <nav className="flex flex-col items-center gap-3 flex-1 pt-6">
        {items.map((it, i) => {
          const Icon = it.Icon;
          const isActive = it.kind === "drawer" && activeDrawer === it.drawer;

          if (it.kind === "link") {
            return (
              <Link key={i} to={it.to} aria-label={it.label} title={it.label} className={iconBtn}>
                <Icon className="h-[18px] w-[18px]" />
                <span className={tooltip}>{it.label}</span>
              </Link>
            );
          }
          if (it.kind === "drawer") {
            return (
              <button
                key={i}
                onClick={() => openDrawer(it.drawer)}
                aria-label={it.label}
                title={it.label}
                className={`${iconBtn} ${isActive ? "bg-accent text-foreground" : ""}`}
              >
                <Icon className="h-[18px] w-[18px]" />
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
              className={`${iconBtn} ${it.label === "YouTube" && youtubeOpen ? "bg-accent text-foreground" : ""}`}
            >
              <Icon className="h-[18px] w-[18px]" />
              <span className={tooltip}>{it.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="mt-auto pb-6 w-full flex justify-center">
        <Link
          to="/drive"
          aria-label="Drive"
          title="Drive"
          className="h-[48px] w-[48px] grid place-items-center rounded-2xl bg-primary text-primary-foreground shadow-pop transition-all duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-110 active:scale-95"
        >
          <FolderOpen className="h-5 w-5" />
        </Link>
      </div>
    </aside>
  );
}
