import { useEffect, useCallback } from "react";
import { X } from "lucide-react";
import { useUIStore, type DrawerType } from "@/store/useUIStore";
import { cn } from "@/lib/utils";
import { ContactsDrawer } from "./ContactsDrawer";
import { ProfileDrawer } from "./ProfileDrawer";

const drawerContent: Record<DrawerType, React.FC> = {
  contacts: ContactsDrawer,
  location: () => <DrawerStub title="SpotSync" emoji="🗺️" />,
  meetings: () => <DrawerStub title="Meetings" emoji="📅" />,
  news: () => <DrawerStub title="News" emoji="📰" />,
  media: () => <DrawerStub title="Media" emoji="🎵" />,
  actions: () => <DrawerStub title="Actions" emoji="⚡" />,
  mail: () => <DrawerStub title="Mail" emoji="📧" />,
  tasks: () => <DrawerStub title="Tasks" emoji="✅" />,
  profile: ProfileDrawer,
};

const drawerLabels: Record<DrawerType, string> = {
  contacts: "Contacts",
  location: "SpotSync",
  meetings: "Meetings",
  news: "News",
  media: "Media",
  actions: "Actions",
  mail: "Mail",
  tasks: "Tasks",
  profile: "Profile",
};

function DrawerStub({ title, emoji }: { title: string; emoji: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-6">
      <div className="text-3xl mb-3">{emoji}</div>
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1">Coming soon</p>
    </div>
  );
}

export function RightDrawer() {
  const activeDrawer = useUIStore((s) => s.activeDrawer);
  const closeDrawer = useUIStore((s) => s.closeDrawer);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") closeDrawer();
  }, [closeDrawer]);

  useEffect(() => {
    if (activeDrawer) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [activeDrawer, handleKeyDown]);

  if (!activeDrawer) return null;

  const Content = drawerContent[activeDrawer];
  const label = drawerLabels[activeDrawer];

  return (
    <>
      <div
        className="fixed inset-0 bg-black/20 z-40 animate-fade-in"
        onClick={closeDrawer}
      />
      <div
        className={cn(
          "fixed top-[96px] bottom-0 right-[72px] z-50 w-[380px] bg-surface border-l border-border shadow-pop",
          "flex flex-col animate-slide-in-right",
        )}
      >
        <div className="flex items-center justify-between px-5 h-14 border-b border-border shrink-0">
          <span className="font-semibold text-[15px]">{label}</span>
          <button
            onClick={closeDrawer}
            className="h-8 w-8 grid place-items-center rounded-full text-foreground/60 hover:bg-accent hover:text-foreground transition active:scale-95"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <Content />
        </div>
      </div>
    </>
  );
}
