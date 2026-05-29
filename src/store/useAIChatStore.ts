import { create } from "zustand";
import type { ConversationSummary } from "@/services/ai";

interface AIChatMessage {
  role: "user" | "assistant";
  content: string;
  id: string;
}

interface AIChatState {
  conversations: ConversationSummary[];
  activeConversationId: string | null;
  messages: AIChatMessage[];
  streamingContent: string | null;
  isStreaming: boolean;
  error: string | null;

  setConversations: (convs: ConversationSummary[]) => void;
  addConversation: (conv: ConversationSummary) => void;
  removeConversation: (id: string) => void;
  setActiveConversation: (id: string | null) => void;
  setMessages: (messages: AIChatMessage[]) => void;
  addMessage: (msg: AIChatMessage) => void;
  appendStreamContent: (chunk: string) => void;
  commitStream: () => void;
  setStreaming: (v: boolean) => void;
  setError: (e: string | null) => void;
  reset: () => void;
}

function genId() {
  return crypto.randomUUID();
}

export const useAIChatStore = create<AIChatState>((set, get) => ({
  conversations: [],
  activeConversationId: null,
  messages: [],
  streamingContent: null,
  isStreaming: false,
  error: null,

  setConversations: (conversations) => set({ conversations }),

  addConversation: (conv) =>
    set({ conversations: [conv, ...get().conversations] }),

  removeConversation: (id) =>
    set({ conversations: get().conversations.filter((c) => c.id !== id) }),

  setActiveConversation: (id) => set({ activeConversationId: id, messages: [], error: null }),

  setMessages: (messages) => set({ messages }),

  addMessage: (msg) => set({ messages: [...get().messages, msg] }),

  appendStreamContent: (chunk) =>
    set({ streamingContent: (get().streamingContent ?? "") + chunk }),

  commitStream: () => {
    const { streamingContent, messages } = get();
    if (!streamingContent) return;
    const msg: AIChatMessage = {
      role: "assistant",
      content: streamingContent,
      id: genId(),
    };
    set({ messages: [...messages, msg], streamingContent: null, isStreaming: false });
  },

  setStreaming: (v) => set({ isStreaming: v }),

  setError: (error) => set({ error, isStreaming: false }),

  reset: () =>
    set({
      activeConversationId: null,
      messages: [],
      streamingContent: null,
      isStreaming: false,
      error: null,
    }),
}));
