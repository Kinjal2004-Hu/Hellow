import { create } from "zustand";

interface PeerLocation {
  userId: string;
  username: string;
  lat: number;
  lng: number;
  lastSeen: number;
}

interface SpotMessage {
  _id: string;
  senderId: string;
  username: string;
  content: string;
  pinId?: string;
  timestamp: number;
}

interface SpotState {
  peerLocations: Record<string, PeerLocation>;
  isLive: boolean;
  messages: SpotMessage[];
  setPeerLocation: (loc: PeerLocation) => void;
  removePeer: (userId: string) => void;
  setLive: (live: boolean) => void;
  addMessage: (msg: SpotMessage) => void;
  setMessages: (msgs: SpotMessage[]) => void;
}

export const useSpotStore = create<SpotState>((set, get) => ({
  peerLocations: {},
  isLive: false,
  messages: [],

  setPeerLocation: (loc) =>
    set({ peerLocations: { ...get().peerLocations, [loc.userId]: loc } }),

  removePeer: (userId) => {
    const next = { ...get().peerLocations };
    delete next[userId];
    set({ peerLocations: next });
  },

  setLive: (live) => set({ isLive: live }),

  addMessage: (msg) =>
    set({ messages: [...get().messages, msg] }),

  setMessages: (msgs) => set({ messages: msgs }),
}));
