import { create } from 'zustand'
import { getStoredToken, getStoredUser, clearStoredAuth, setStoredAuth } from '../services/auth'
import { createSocket, disconnectSocket } from '../services/socket'

import { getMe } from '../services/auth'

export const useAuthStore = create((set, get) => ({
  user: getStoredUser(),
  token: getStoredToken(),
  isAuthenticated: !!getStoredToken(),
  isHydrating: true,

  login: (token, user) => {
    setStoredAuth(token, user)
    set({ user, token, isAuthenticated: true })
    createSocket(token)
  },

  logout: () => {
    clearStoredAuth()
    disconnectSocket()
    set({ user: null, token: null, isAuthenticated: false })
  },

  setUser: (user) => {
    localStorage.setItem('hellow_user', JSON.stringify(user))
    set({ user })
  },

  setHydrating: (val) => set({ isHydrating: val }),

  hydrate: async () => {
    const token = get().token
    if (!token) {
      set({ isHydrating: false })
      return
    }
    try {
      const res = await getMe()
      if (res?.data) {
        localStorage.setItem('hellow_user', JSON.stringify(res.data))
        set({ user: res.data, isAuthenticated: true, isHydrating: false })
        createSocket(token)
      } else {
        get().logout()
        set({ isHydrating: false })
      }
    } catch {
      get().logout()
      set({ isHydrating: false })
    }
  },
}))
