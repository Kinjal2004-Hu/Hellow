import { create } from 'zustand'
import { v4 as uuidv4 } from 'uuid'

export const useChatStore = create((set, get) => ({
  rooms: [],
  activeRoomId: null,
  messages: {},
  typingUsers: {},

  setRooms: (rooms) => set({ rooms }),

  setActiveRoom: (id) => set({ activeRoomId: id }),

  addMessage: (msg) => {
    const { messages, activeRoomId } = get()
    const roomId = msg.roomId || activeRoomId
    if (!roomId) return
    const roomMessages = messages[roomId] || []
    const existingIndex = roomMessages.findIndex(
      (m) => m._id === msg._id || (m.tempId && m.tempId === msg.tempId)
    )
    if (existingIndex >= 0) {
      const updated = [...roomMessages]
      updated[existingIndex] = { ...updated[existingIndex], ...msg, pending: false }
      set({ messages: { ...messages, [roomId]: updated } })
    } else {
      set({
        messages: {
          ...messages,
          [roomId]: [...roomMessages, msg],
        },
      })
    }
  },

  optimisticSend: (roomId, content) => {
    const tempId = uuidv4 ? uuidv4() : Date.now().toString()
    const tempMsg = {
      _id: tempId,
      tempId,
      roomId,
      content,
      senderId: 'me',
      timestamp: new Date().toISOString(),
      pending: true,
    }
    const { messages } = get()
    const roomMessages = messages[roomId] || []
    set({
      messages: {
        ...messages,
        [roomId]: [...roomMessages, tempMsg],
      },
    })
    return tempId
  },

  confirmMessage: (tempId, serverMsg) => {
    const { messages, activeRoomId } = get()
    const roomId = serverMsg.roomId || activeRoomId
    if (!roomId) return
    const roomMessages = (messages[roomId] || []).map((m) =>
      m._id === tempId || m.tempId === tempId
        ? { ...serverMsg, pending: false }
        : m
    )
    set({ messages: { ...messages, [roomId]: roomMessages } })
  },

  setTyping: (roomId, userId, isTyping) => {
    const { typingUsers } = get()
    const current = typingUsers[roomId] || []
    if (isTyping && !current.includes(userId)) {
      set({ typingUsers: { ...typingUsers, [roomId]: [...current, userId] } })
    } else if (!isTyping) {
      set({
        typingUsers: {
          ...typingUsers,
          [roomId]: current.filter((id) => id !== userId),
        },
      })
    }
  },

  setMessages: (roomId, msgs) => {
    const { messages } = get()
    set({ messages: { ...messages, [roomId]: msgs } })
  },
}))
