import { create } from "zustand";
import type { WorkspaceSessionDTO, WorkspaceSharedState } from "@/services/workspace";

export interface CursorPresence {
  userId: string;
  x: number;
  y: number;
  target?: string;
}

export interface MemberPresence {
  userId: string;
  status: "active" | "idle" | "away";
  timestamp: number;
}

interface WorkspaceState {
  session: WorkspaceSessionDTO | null;
  members: string[];
  sharedState: WorkspaceSharedState | null;
  cursors: CursorPresence[];
  presence: MemberPresence[];
  followMode: boolean;
  isJoined: boolean;

  setSession: (s: WorkspaceSessionDTO | null) => void;
  setMembers: (ids: string[]) => void;
  addMember: (id: string) => void;
  removeMember: (id: string) => void;
  setSharedState: (s: WorkspaceSharedState) => void;
  updateSharedState: (partial: Partial<WorkspaceSharedState>) => void;
  addCursor: (cursor: CursorPresence) => void;
  removeCursor: (userId: string) => void;
  updatePresence: (p: MemberPresence) => void;
  setFollowMode: (v: boolean) => void;
  setJoined: (v: boolean) => void;
  reset: () => void;
}

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  session: null,
  members: [],
  sharedState: null,
  cursors: [],
  presence: [],
  followMode: false,
  isJoined: false,

  setSession: (session) => set({
    session,
    sharedState: session?.sharedState ?? null,
    followMode: session?.followMode ?? false,
  }),

  setMembers: (ids) => set({ members: ids }),

  addMember: (id) => {
    const exists = get().members.includes(id);
    if (!exists) set({ members: [...get().members, id] });
  },

  removeMember: (id) =>
    set({
      members: get().members.filter((m) => m !== id),
      cursors: get().cursors.filter((c) => c.userId !== id),
      presence: get().presence.filter((p) => p.userId !== id),
    }),

  setSharedState: (s) => set({ sharedState: s }),

  updateSharedState: (partial) =>
    set({ sharedState: { ...get().sharedState!, ...partial } }),

  addCursor: (cursor) =>
    set({
      cursors: [
        ...get().cursors.filter((c) => c.userId !== cursor.userId),
        cursor,
      ],
    }),

  removeCursor: (userId) =>
    set({ cursors: get().cursors.filter((c) => c.userId !== userId) }),

  updatePresence: (p) =>
    set({
      presence: [
        ...get().presence.filter((pr) => pr.userId !== p.userId),
        p,
      ],
    }),

  setFollowMode: (v) => set({ followMode: v }),
  setJoined: (v) => set({ isJoined: v }),

  reset: () =>
    set({
      session: null,
      members: [],
      sharedState: null,
      cursors: [],
      presence: [],
      followMode: false,
      isJoined: false,
    }),
}));
