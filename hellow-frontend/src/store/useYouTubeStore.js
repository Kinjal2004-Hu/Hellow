import { create } from 'zustand'

export const useYouTubeStore = create((set, get) => ({
  currentVideoId: null,
  isPlaying: false,
  currentTime: 0,
  groupWatchMode: false,
  roomCode: null,
  participants: 1,
  chatMessages: [],

  setCurrentVideo: (videoId) => set({ currentVideoId: videoId }),
  setPlaying: (val) => set({ isPlaying: val }),
  setCurrentTime: (t) => set({ currentTime: t }),
  setGroupWatchMode: (val) => set({ groupWatchMode: val }),
  setRoomCode: (code) => set({ roomCode: code }),
  setParticipants: (n) => set({ participants: n }),

  syncPlay: (time) => set({ isPlaying: true, currentTime: time }),
  syncPause: (time) => set({ isPlaying: false, currentTime: time }),
  syncSeek: (time) => set({ currentTime: time }),

  addChatMessage: (msg) => {
    const { chatMessages } = get()
    set({ chatMessages: [...chatMessages, msg] })
  },

  setChatMessages: (msgs) => set({ chatMessages: msgs }),
}))
