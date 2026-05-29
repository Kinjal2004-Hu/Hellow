import { create } from "zustand";
import type { GmailMessage, GmailStatus } from "@/services/gmail";
import * as gmailService from "@/services/gmail";

interface GmailState {
  status: GmailStatus;
  messages: GmailMessage[];
  selectedMessage: GmailMessage | null;
  loading: boolean;
  error: string | null;

  checkStatus: () => Promise<void>;
  connect: () => Promise<void>;
  fetchInbox: () => Promise<void>;
  selectMessage: (msg: GmailMessage | null) => void;
  disconnect: () => Promise<void>;
}

export const useGmailStore = create<GmailState>((set, get) => ({
  status: { connected: false, email: null },
  messages: [],
  selectedMessage: null,
  loading: false,
  error: null,

  checkStatus: async () => {
    try {
      const status = await gmailService.checkGmailStatus();
      set({ status });
      if (status.connected) {
        get().fetchInbox();
      }
    } catch {
      set({ status: { connected: false, email: null } });
    }
  },

  connect: async () => {
    try {
      const url = await gmailService.connectGmail();
      window.open(url, "_blank", "width=600,height=700");
    } catch {
      set({ error: "Failed to connect Gmail" });
    }
  },

  fetchInbox: async () => {
    set({ loading: true, error: null });
    try {
      const messages = await gmailService.fetchInbox();
      set({ messages, loading: false });
    } catch {
      set({ error: "Failed to load inbox", loading: false });
    }
  },

  selectMessage: (msg) => set({ selectedMessage: msg }),

  disconnect: async () => {
    try {
      await gmailService.disconnectGmail();
      set({ status: { connected: false, email: null }, messages: [], selectedMessage: null });
    } catch {
      set({ error: "Failed to disconnect" });
    }
  },
}));
