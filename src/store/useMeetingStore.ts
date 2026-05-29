import { create } from "zustand";
import type { MeetingDTO } from "@/services/meetings";

interface MeetingParticipant {
  id: string;
  mic: boolean;
  camera: boolean;
  speaking: boolean;
  screenSharing: boolean;
}

interface MeetingChatMessage {
  userId: string;
  content: string;
  timestamp: string;
}

interface MeetingState {
  meeting: MeetingDTO | null;
  participants: MeetingParticipant[];
  chatMessages: MeetingChatMessage[];
  isJoined: boolean;
  localMic: boolean;
  localCamera: boolean;
  localScreenSharing: boolean;

  setMeeting: (m: MeetingDTO | null) => void;
  setParticipants: (ids: string[]) => void;
  addParticipant: (id: string) => void;
  removeParticipant: (id: string) => void;
  setParticipantMedia: (id: string, media: Partial<Pick<MeetingParticipant, "mic" | "camera" | "speaking" | "screenSharing">>) => void;
  addChatMessage: (msg: MeetingChatMessage) => void;
  setJoined: (v: boolean) => void;
  setLocalMic: (v: boolean) => void;
  setLocalCamera: (v: boolean) => void;
  setLocalScreenSharing: (v: boolean) => void;
  reset: () => void;
}

export const useMeetingStore = create<MeetingState>((set, get) => ({
  meeting: null,
  participants: [],
  chatMessages: [],
  isJoined: false,
  localMic: true,
  localCamera: true,
  localScreenSharing: false,

  setMeeting: (meeting) => set({ meeting }),

  setParticipants: (ids) =>
    set({
      participants: ids.map((id) => {
        const existing = get().participants.find((p) => p.id === id);
        return existing ?? { id, mic: true, camera: true, speaking: false, screenSharing: false };
      }),
    }),

  addParticipant: (id) => {
    const exists = get().participants.find((p) => p.id === id);
    if (!exists) {
      set({ participants: [...get().participants, { id, mic: true, camera: true, speaking: false, screenSharing: false }] });
    }
  },

  removeParticipant: (id) =>
    set({ participants: get().participants.filter((p) => p.id !== id) }),

  setParticipantMedia: (id, media) =>
    set({
      participants: get().participants.map((p) =>
        p.id === id ? { ...p, ...media } : p,
      ),
    }),

  addChatMessage: (msg) =>
    set({ chatMessages: [...get().chatMessages, msg] }),

  setJoined: (v) => set({ isJoined: v }),
  setLocalMic: (v) => set({ localMic: v }),
  setLocalCamera: (v) => set({ localCamera: v }),
  setLocalScreenSharing: (v) => set({ localScreenSharing: v }),

  reset: () =>
    set({
      meeting: null,
      participants: [],
      chatMessages: [],
      isJoined: false,
      localMic: true,
      localCamera: true,
      localScreenSharing: false,
    }),
}));
