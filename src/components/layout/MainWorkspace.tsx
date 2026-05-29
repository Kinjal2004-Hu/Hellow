import type { ReactNode } from "react";
import { useChatStore } from "@/store/useChatStore";
import { ChatWorkspace } from "./ChatWorkspace";

export function MainWorkspace({ children }: { children: ReactNode }) {
  const activeRoomId = useChatStore((s) => s.activeRoomId);

  if (activeRoomId) {
    return (
      <main className="h-full flex flex-col overflow-hidden animate-fade-in">
        <ChatWorkspace />
      </main>
    );
  }

  return (
    <main className="h-full overflow-y-auto">
      {children}
    </main>
  );
}
