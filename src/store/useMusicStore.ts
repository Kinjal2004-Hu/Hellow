import { create } from "zustand";
import type { MusicRoomDTO, MusicTrack } from "@/services/music";

interface MusicState {
  room: MusicRoomDTO | null;
  isPlaying: boolean;
  position: number;
  powerToAll: boolean;
  isJoined: boolean;

  setRoom: (r: MusicRoomDTO | null) => void;
  setIsPlaying: (v: boolean) => void;
  setPosition: (v: number) => void;
  setPowerToAll: (v: boolean) => void;
  setJoined: (v: boolean) => void;
  updateQueue: (queue: MusicTrack[], currentTrack: MusicTrack | null) => void;
  reset: () => void;
}

export const useMusicStore = create<MusicState>((set) => ({
  room: null,
  isPlaying: false,
  position: 0,
  powerToAll: false,
  isJoined: false,

  setRoom: (room) =>
    set({
      room,
      isPlaying: room?.isPlaying ?? false,
      position: room?.position ?? 0,
      powerToAll: room?.powerToAll ?? false,
    }),

  setIsPlaying: (v) => set({ isPlaying: v }),
  setPosition: (v) => set({ position: v }),
  setPowerToAll: (v) => set({ powerToAll: v }),
  setJoined: (v) => set({ isJoined: v }),

  updateQueue: (queue, currentTrack) =>
    set((state) => ({
      room: state.room ? { ...state.room, queue, currentTrack } : null,
    })),

  reset: () =>
    set({
      room: null,
      isPlaying: false,
      position: 0,
      powerToAll: false,
      isJoined: false,
    }),
}));
