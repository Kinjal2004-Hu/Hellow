import { create } from "zustand";

export type RoomCategory = "saved" | "hooked" | "trash";
export type RoomKind = "channel" | "dm";

export interface ChatRoom {
  _id: string;
  name: string;
  kind: RoomKind;
  category: RoomCategory;
  role: string | null;
  unread: number;
  memberCount: number;
  lastActivity?: string;
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
  onlineUsers: Record<string, string[]>;
  setRooms: (rooms: ChatRoom[]) => void;
  addRoom: (room: ChatRoom) => void;
  setActiveRoom: (id: string | null) => void;
  setMessages: (roomId: string, msgs: ChatMessage[]) => void;
  addMessage: (msg: ChatMessage) => void;
  prependMessages: (roomId: string, msgs: ChatMessage[]) => void;
  optimisticSend: (msg: ChatMessage) => void;
  confirmMessage: (tempId: string, serverMsg: ChatMessage) => void;
  setTyping: (roomId: string, userId: string, isTyping: boolean) => void;
  setOnlineUsers: (roomId: string, userIds: string[]) => void;
  updateRoom: (roomId: string, patch: Partial<ChatRoom>) => void;
  removeRoom: (roomId: string) => void;
  markRead: (roomId: string) => void;
  markReconnected: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  rooms: [],
  activeRoomId: null,
  messages: {},
  typingUsers: {},
  onlineUsers: {},

  setRooms: (rooms) => set({ rooms }),

  addRoom: (room) => set({ rooms: [...get().rooms, room] }),

  setActiveRoom: (id) => set({ activeRoomId: id }),

  setMessages: (roomId, msgs) =>
    set({ messages: { ...get().messages, [roomId]: msgs } }),

  addMessage: (msg) => {
    const cur = get().messages[msg.roomId] ?? [];
    const exists = cur.some((m) => m._id === msg._id || m.tempId === msg.tempId);
    if (exists) {
      set({
        messages: {
          ...get().messages,
          [msg.roomId]: cur.map((m) =>
            m.tempId === msg.tempId ? { ...msg, pending: false } : m,
          ),
        },
      });
      return;
    }
    set({ messages: { ...get().messages, [msg.roomId]: [...cur, msg] } });
  },

  prependMessages: (roomId, msgs) => {
    const cur = get().messages[roomId] ?? [];
    const existingIds = new Set(cur.map((m) => m._id));
    const newMsgs = msgs.filter((m) => !existingIds.has(m._id));
    set({ messages: { ...get().messages, [roomId]: [...newMsgs, ...cur] } });
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
        [serverMsg.roomId]: cur.map((m) =>
          m.tempId === tempId ? { ...serverMsg, pending: false } : m,
        ),
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

  setOnlineUsers: (roomId, userIds) =>
    set({ onlineUsers: { ...get().onlineUsers, [roomId]: userIds } }),

  updateRoom: (roomId, patch) =>
    set({
      rooms: get().rooms.map((r) => (r._id === roomId ? { ...r, ...patch } : r)),
    }),

  removeRoom: (roomId) =>
    set({ rooms: get().rooms.filter((r) => r._id !== roomId) }),

  markRead: (roomId) => {
    set({
      rooms: get().rooms.map((r) =>
        r._id === roomId ? { ...r, unread: 0 } : r,
      ),
    });
  },

  markReconnected: () => {
    set({ messages: {}, typingUsers: {}, onlineUsers: {} });
  },
}));
