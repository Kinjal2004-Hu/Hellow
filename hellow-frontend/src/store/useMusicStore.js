import { create } from 'zustand'

const sampleTracks = [
  { id: 1, title: 'Blinding Lights', artist: 'The Weeknd', albumArt: 'https://picsum.photos/seed/track1/200', duration: 372 },
  { id: 2, title: 'Shape of You', artist: 'Ed Sheeran', albumArt: 'https://picsum.photos/seed/track2/200', duration: 354 },
  { id: 3, title: 'Bohemian Rhapsody', artist: 'Queen', albumArt: 'https://picsum.photos/seed/track3/200', duration: 355 },
  { id: 4, title: 'Hotel California', artist: 'Eagles', albumArt: 'https://picsum.photos/seed/track4/200', duration: 391 },
  { id: 5, title: 'Stairway to Heaven', artist: 'Led Zeppelin', albumArt: 'https://picsum.photos/seed/track5/200', duration: 482 },
]

export const useMusicStore = create((set, get) => ({
  room: null,
  roomCode: null,
  isHost: false,
  currentTrack: sampleTracks[0],
  queue: sampleTracks,
  isPlaying: false,
  currentTime: 0,
  volume: 85,
  powerToAll: true,
  listeners: [],
  isInRoom: false,

  setRoom: (room) => set({ room, isInRoom: !!room }),
  setRoomCode: (code) => set({ roomCode: code }),
  setHost: (val) => set({ isHost: val }),
  setCurrentTrack: (track) => set({ currentTrack: track }),
  setQueue: (queue) => set({ queue }),
  setPlaying: (val) => set({ isPlaying: val }),
  setCurrentTime: (t) => set({ currentTime: t }),
  setVolume: (v) => set({ volume: v }),
  setPowerToAll: (val) => set({ powerToAll: val }),
  setListeners: (list) => set({ listeners: list }),
  setInRoom: (val) => set({ isInRoom: val }),

  play: () => set({ isPlaying: true }),
  pause: () => set({ isPlaying: false }),
  seek: (t) => set({ currentTime: t }),

  nextTrack: () => {
    const { queue, currentTrack } = get()
    const idx = queue.findIndex((t) => t.id === currentTrack.id)
    if (idx < queue.length - 1) {
      set({ currentTrack: queue[idx + 1], currentTime: 0, isPlaying: true })
    }
  },

  prevTrack: () => {
    const { queue, currentTrack } = get()
    const idx = queue.findIndex((t) => t.id === currentTrack.id)
    if (idx > 0) {
      set({ currentTrack: queue[idx - 1], currentTime: 0, isPlaying: true })
    }
  },

  togglePowerToAll: () => set((s) => ({ powerToAll: !s.powerToAll })),
}))
