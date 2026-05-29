import { create } from "zustand";
import type { SpotSessionDTO, SpotPin, SpotMessage } from "@/services/spotSync";

interface MemberLocation {
  userId: string;
  lat: number;
  lng: number;
  timestamp: string;
}

interface SpotSyncState {
  session: SpotSessionDTO | null;
  members: string[];
  memberLocations: MemberLocation[];
  pins: SpotPin[];
  messages: SpotMessage[];
  isJoined: boolean;

  setSession: (s: SpotSessionDTO | null) => void;
  setMembers: (ids: string[]) => void;
  addMember: (id: string) => void;
  removeMember: (id: string) => void;
  updateMemberLocation: (loc: MemberLocation) => void;
  addPin: (pin: SpotPin) => void;
  removePin: (index: number) => void;
  setMessages: (messages: SpotMessage[]) => void;
  addMessage: (message: SpotMessage) => void;
  setJoined: (v: boolean) => void;
  reset: () => void;
}

export const useSpotSyncStore = create<SpotSyncState>((set, get) => ({
  session: null,
  members: [],
  memberLocations: [],
  pins: [],
  messages: [],
  isJoined: false,

  setSession: (session) => set({ session, pins: session?.pins ?? [] }),

  setMembers: (ids) => set({ members: ids }),

  addMember: (id) => {
    const exists = get().members.includes(id);
    if (!exists) set({ members: [...get().members, id] });
  },

  removeMember: (id) =>
    set({
      members: get().members.filter((m) => m !== id),
      memberLocations: get().memberLocations.filter((l) => l.userId !== id),
    }),

  updateMemberLocation: (loc) =>
    set({
      memberLocations: [
        ...get().memberLocations.filter((l) => l.userId !== loc.userId),
        loc,
      ],
    }),

  addPin: (pin) =>
    set({ pins: [...get().pins, pin] }),

  removePin: (index) =>
    set({ pins: get().pins.filter((_, i) => i !== index) }),

  setMessages: (messages) => set({ messages }),

  addMessage: (message) =>
    set({ messages: [...get().messages, message] }),

  setJoined: (v) => set({ isJoined: v }),

  reset: () =>
    set({
      session: null,
      members: [],
      memberLocations: [],
      pins: [],
      messages: [],
      isJoined: false,
    }),
}));
