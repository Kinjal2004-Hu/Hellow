import { create } from "zustand";

// Socket type left generic; integrated in Phase 4.
type SocketLike = {
  emit: (event: string, payload?: unknown) => void;
  disconnect: () => void;
  connected?: boolean;
} | null;

interface SocketState {
  socket: SocketLike;
  isConnected: boolean;
  connect: (token: string) => void;
  disconnect: () => void;
  emit: (event: string, payload?: unknown) => void;
}

export const useSocketStore = create<SocketState>((set, get) => ({
  socket: null,
  isConnected: false,
  connect: (_token: string) => {
    // Phase 4: instantiate socket.io / Supabase Realtime channel here.
    set({ isConnected: false });
  },
  disconnect: () => {
    const s = get().socket;
    s?.disconnect();
    set({ socket: null, isConnected: false });
  },
  emit: (event, payload) => {
    const s = get().socket;
    if (!s) return;
    s.emit(event, payload);
  },
}));
