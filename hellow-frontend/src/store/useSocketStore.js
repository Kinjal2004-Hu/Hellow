import { create } from 'zustand'
import { createSocket, getSocket, disconnectSocket } from '../services/socket'
import { useChatStore } from './useChatStore'
import { useSpotStore } from './useSpotStore'
import { useYouTubeStore } from './useYouTubeStore'

export const useSocketStore = create((set, get) => ({
  socket: null,
  isConnected: false,

  connect: (token) => {
    const socket = createSocket(token)
    set({ socket, isConnected: false })

    socket.on('connect', () => {
      set({ isConnected: true })
    })

    socket.on('disconnect', () => {
      set({ isConnected: false })
    })

    socket.on('message:receive', (msg) => {
      useChatStore.getState().addMessage(msg)
    })

    socket.on('typing:start', ({ roomId, userId }) => {
      useChatStore.getState().setTyping(roomId, userId, true)
    })

    socket.on('typing:stop', ({ roomId, userId }) => {
      useChatStore.getState().setTyping(roomId, userId, false)
    })

    socket.on('location:update', ({ userId, lat, lng, timestamp }) => {
      useSpotStore.getState().updatePeerLocation(userId, lat, lng)
    })

    socket.on('location:stop', ({ userId }) => {
      useSpotStore.getState().removePeer(userId)
    })

    socket.on('spot:message', (msg) => {
      useSpotStore.getState().addMessage(msg)
    })

    socket.on('yt:play', ({ currentTime }) => {
      useYouTubeStore.getState().syncPlay(currentTime)
    })
    socket.on('yt:pause', ({ currentTime }) => {
      useYouTubeStore.getState().syncPause(currentTime)
    })
    socket.on('yt:seek', ({ currentTime }) => {
      useYouTubeStore.getState().syncSeek(currentTime)
    })
    socket.on('yt:load_video', ({ videoId }) => {
      useYouTubeStore.getState().setCurrentVideo(videoId)
    })
    socket.on('yt:chat_message', (msg) => {
      useYouTubeStore.getState().addChatMessage(msg)
    })
  },

  disconnect: () => {
    disconnectSocket()
    set({ socket: null, isConnected: false })
  },

  emit: (event, payload) => {
    const socket = getSocket()
    if (socket?.connected) {
      socket.emit(event, payload)
    }
  },
}))
