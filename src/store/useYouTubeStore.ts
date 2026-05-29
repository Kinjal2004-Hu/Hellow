import { create } from "zustand";

interface YTChatMessage {
  id: string;
  senderId: string;
  username: string;
  content: string;
  timestamp: number;
}

interface YouTubeState {
  videoId: string | null;
  isPlaying: boolean;
  currentTime: number;
  participants: number;
  roomCode: string | null;
  groupWatch: boolean;
  chatMessages: YTChatMessage[];
  setVideo: (videoId: string | null) => void;
  setPlaying: (playing: boolean) => void;
  setCurrentTime: (time: number) => void;
  setGroupWatch: (roomCode: string | null) => void;
  setParticipants: (n: number) => void;
  addChatMessage: (msg: YTChatMessage) => void;
  reset: () => void;
}

export const useYouTubeStore = create<YouTubeState>((set, get) => ({
  videoId: null,
  isPlaying: false,
  currentTime: 0,
  participants: 0,
  roomCode: null,
  groupWatch: false,
  chatMessages: [],

  setVideo: (videoId) => set({ videoId, currentTime: 0, isPlaying: false }),
  setPlaying: (playing) => set({ isPlaying: playing }),
  setCurrentTime: (time) => set({ currentTime: time }),
  setGroupWatch: (roomCode) =>
    set({ groupWatch: !!roomCode, roomCode, chatMessages: [] }),
  setParticipants: (n) => set({ participants: n }),
  addChatMessage: (msg) =>
    set({ chatMessages: [...get().chatMessages, msg] }),
  reset: () =>
    set({
      videoId: null, isPlaying: false, currentTime: 0,
      participants: 0, roomCode: null, groupWatch: false, chatMessages: [],
    }),
}));
