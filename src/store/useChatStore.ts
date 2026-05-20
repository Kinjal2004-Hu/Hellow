import { create } from "zustand";

export type RoomCategory = "saved" | "hooked" | "trash";
export type RoomKind = "channel" | "dm";

export interface ChatRoom {
  _id: string;
  name: string;
  category: RoomCategory;
  kind: RoomKind;
  unread?: number;
}

export interface ChatMessage {
  _id: string;
  tempId?: string;
  roomId: string;
  senderId: string;
  senderName?: string;
  content: string;
  createdAt: string;
  pending?: boolean;
}

interface ChatState {
  rooms: ChatRoom[];
  activeRoomId: string | null;
  messages: Record<string, ChatMessage[]>;
  typingUsers: Record<string, string[]>;
  setRooms: (rooms: ChatRoom[]) => void;
  addRoom: (room: ChatRoom) => void;
  setActiveRoom: (id: string | null) => void;
  setMessages: (roomId: string, msgs: ChatMessage[]) => void;
  addMessage: (msg: ChatMessage) => void;
  optimisticSend: (msg: ChatMessage) => void;
  confirmMessage: (tempId: string, serverMsg: ChatMessage) => void;
  setTyping: (roomId: string, userId: string, isTyping: boolean) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  rooms: [],
  activeRoomId: null,
  messages: {},
  typingUsers: {},
  setRooms: (rooms) => set({ rooms }),
  addRoom: (room) => set({ rooms: [...get().rooms, room] }),
  setActiveRoom: (id) => set({ activeRoomId: id }),
  setMessages: (roomId, msgs) =>
    set({ messages: { ...get().messages, [roomId]: msgs } }),
  addMessage: (msg) => {
    const cur = get().messages[msg.roomId] ?? [];
    set({ messages: { ...get().messages, [msg.roomId]: [...cur, msg] } });
  },
  optimisticSend: (msg) => {
    const cur = get().messages[msg.roomId] ?? [];
    set({
      messages: {
        ...get().messages,
        [msg.roomId]: [...cur, { ...msg, pending: true }],
      },
    });
  },
  confirmMessage: (tempId, serverMsg) => {
    const cur = get().messages[serverMsg.roomId] ?? [];
    set({
      messages: {
        ...get().messages,
        [serverMsg.roomId]: cur.map((m) => (m.tempId === tempId ? serverMsg : m)),
      },
    });
  },
  setTyping: (roomId, userId, isTyping) => {
    const cur = get().typingUsers[roomId] ?? [];
    const next = isTyping
      ? Array.from(new Set([...cur, userId]))
      : cur.filter((u) => u !== userId);
    set({ typingUsers: { ...get().typingUsers, [roomId]: next } });
  },
}));
