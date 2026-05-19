import { create } from 'zustand'

export const useSpotStore = create((set, get) => ({
  isLive: false,
  peerLocations: {},
  messages: [],
  selectedFriend: null,
  friends: [],

  setLive: (val) => set({ isLive: val }),
  setFriends: (friends) => set({ friends }),
  setSelectedFriend: (id) => set({ selectedFriend: id }),

  updatePeerLocation: (userId, lat, lng) => {
    const { peerLocations } = get()
    set({
      peerLocations: {
        ...peerLocations,
        [userId]: { lat, lng, updatedAt: Date.now() },
      },
    })
  },

  removePeer: (userId) => {
    const { peerLocations } = get()
    const updated = { ...peerLocations }
    delete updated[userId]
    set({ peerLocations: updated })
  },

  addMessage: (msg) => {
    const { messages } = get()
    set({ messages: [...messages, msg] })
  },

  setMessages: (messages) => set({ messages }),
}))
