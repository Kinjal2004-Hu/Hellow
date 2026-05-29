import { useEffect, useRef, type ReactNode } from "react";
import { io, type Socket } from "socket.io-client";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";
import { useAuthStore } from "@/store/useAuthStore";

const SOCKET_BASE = (import.meta.env.VITE_API_URL ?? "http://localhost:4000").replace("/api", "");

interface WorkspaceSyncProviderProps {
  sessionCode: string;
  children: ReactNode;
  onUrlChange?: (url: string, route: string) => void;
  onFollowMode?: (enabled: boolean) => void;
}

export function WorkspaceSyncProvider({
  sessionCode,
  children,
  onUrlChange,
  onFollowMode,
}: WorkspaceSyncProviderProps) {
  const token = useAuthStore((s) => s.token);
  const socketRef = useRef<Socket | null>(null);

  const {
    setMembers, addMember, removeMember,
    setSharedState, updateSharedState,
    addCursor, removeCursor, updatePresence,
    setFollowMode, setJoined,
  } = useWorkspaceStore();

  useEffect(() => {
    if (!token || !sessionCode) return;

    const s = io(`${SOCKET_BASE}/workspace`, {
      auth: { token },
      transports: ["websocket", "polling"],
    });

    s.on("connect", () => {
      s.emit("workspace:join", { code: sessionCode }, (ack: any) => {
        if (ack?.ok) {
          setJoined(true);
          setMembers(ack.members);
          setSharedState(ack.state);
          setFollowMode(ack.followMode);
        }
      });
    });

    s.on("workspace:members", (ids: string[]) => setMembers(ids));
    s.on("workspace:member_joined", (userId: string) => addMember(userId));
    s.on("workspace:member_left", (userId: string) => removeMember(userId));
    s.on("workspace:state", (state: any) => setSharedState(state));
    s.on("workspace:follow", (enabled: boolean) => {
      setFollowMode(enabled);
      onFollowMode?.(enabled);
    });

    // URL sync
    s.on("workspace:url", (data: { url: string; route: string }) => {
      updateSharedState({ currentUrl: data.url, currentRoute: data.route });
      onUrlChange?.(data.url, data.route);
    });

    // Panel sync
    s.on("workspace:panel", (data: { panel: string; open: boolean }) => {
      updateSharedState({
        panels: { ...useWorkspaceStore.getState().sharedState?.panels, [data.panel]: data.open },
      });
    });

    // Scroll sync
    s.on("workspace:scroll", (data: { x: number; y: number }) => {
      updateSharedState({ scrollPosition: { x: data.x, y: data.y } });
    });

    // Cursor sync
    s.on("workspace:cursor", (data: { userId: string; x: number; y: number; target?: string }) => {
      addCursor(data);
    });

    // Presence sync
    s.on("workspace:presence", (data: { userId: string; status: "active" | "idle" | "away"; timestamp: number }) => {
      updatePresence(data);
    });

    // Follow mode toggle from host
    s.on("workspace:follow_mode", (data: { userId: string; enabled: boolean }) => {
      setFollowMode(data.enabled);
      onFollowMode?.(data.enabled);
    });

    // Annotation sync
    s.on("workspace:annotation", (data: { type: "add" | "remove"; annotationId: string }) => {
      const state = useWorkspaceStore.getState().sharedState;
      if (!state) return;
      const annotations = state.activeAnnotations ?? [];
      if (data.type === "add") {
        updateSharedState({ activeAnnotations: [...annotations, data.annotationId] });
      } else {
        updateSharedState({ activeAnnotations: annotations.filter((a) => a !== data.annotationId) });
      }
    });

    // Bookmark sync
    s.on("workspace:bookmark", (data: { type: "add" | "remove"; bookmarkId: string }) => {
      const state = useWorkspaceStore.getState().sharedState;
      if (!state) return;
      const bookmarks = state.activeBookmarks ?? [];
      if (data.type === "add") {
        updateSharedState({ activeBookmarks: [...bookmarks, data.bookmarkId] });
      } else {
        updateSharedState({ activeBookmarks: bookmarks.filter((b) => b !== data.bookmarkId) });
      }
    });

    socketRef.current = s;

    return () => {
      s.emit("workspace:leave");
      s.disconnect();
      socketRef.current = null;
      setJoined(false);
    };
  }, [token, sessionCode]);

  return <>{children}</>;
}

// Extension-ready sync protocol hooks (no-op until browser extension)
export interface ExtensionSyncHook {
  onExternalTabEvent?: (event: string, data: unknown) => void;
  broadcastToExtension?: (event: string, data: unknown) => void;
}

export const extensionSyncHooks: ExtensionSyncHook = {};
