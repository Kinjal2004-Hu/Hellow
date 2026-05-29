import { io, type Socket } from "socket.io-client";
import { create } from "zustand";

const SOCKET_BASE = (import.meta.env.VITE_API_URL ?? "http://localhost:4000").replace(
  "/api",
  "",
);

interface SocketState {
  socket: Socket | null;
  chatSocket: Socket | null;
  isConnected: boolean;
  isChatConnected: boolean;
  connect: (token: string) => void;
  disconnect: () => void;
}

export const useSocketStore = create<SocketState>((set, get) => ({
  socket: null,
  chatSocket: null,
  isConnected: false,
  isChatConnected: false,

  connect: (token: string) => {
    const cur = get().socket;
    if (cur?.connected) return;

    const s = io(SOCKET_BASE, {
      auth: { token },
      transports: ["websocket", "polling"],
    });

    s.on("connect", () => set({ isConnected: true, socket: s }));

    const chat = io(`${SOCKET_BASE}/chat`, {
      auth: { token },
      transports: ["websocket", "polling"],
    });

    chat.on("connect", () => set({ isChatConnected: true, chatSocket: chat }));

    s.on("disconnect", () => set({ isConnected: false }));
    chat.on("disconnect", () => set({ isChatConnected: false }));

    set({ socket: s, chatSocket: chat });
  },

  disconnect: () => {
    const { socket, chatSocket } = get();
    socket?.disconnect();
    chatSocket?.disconnect();
    set({ socket: null, chatSocket: null, isConnected: false, isChatConnected: false });
  },
}));
