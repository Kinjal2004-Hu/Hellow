import { create } from 'zustand'

export const useUIStore = create((set, get) => ({
  modals: {
    notes: false,
    tasks: false,
    calendar: false,
    bookmarks: false,
    newContact: false,
    search: false,
  },
  panels: {
    youtube: false,
    gmail: false,
  },
  searchQuery: '',
  toast: null,
  chatPanelOpen: false,

  openModal: (name) => {
    const { modals } = get()
    const closed = Object.keys(modals).reduce((acc, k) => ({ ...acc, [k]: false }), {})
    set({ modals: { ...closed, [name]: true } })
  },

  closeModal: (name) => {
    set((s) => ({ modals: { ...s.modals, [name]: false } }))
  },

  closeAllModals: () => {
    const closed = Object.keys(get().modals).reduce((acc, k) => ({ ...acc, [k]: false }), {})
    set({ modals: closed })
  },

  openPanel: (name) => {
    set((s) => {
      const closed = Object.keys(s.panels).reduce((acc, k) => ({ ...acc, [k]: false }), {})
      return { panels: { ...closed, [name]: true } }
    })
  },

  closePanel: (name) => {
    set((s) => ({ panels: { ...s.panels, [name]: false } }))
  },

  closeAllPanels: () => {
    const closed = Object.keys(get().panels).reduce((acc, k) => ({ ...acc, [k]: false }), {})
    set({ panels: closed })
  },

  setSearchQuery: (q) => set({ searchQuery: q }),

  showToast: (message, type = 'info') => {
    set({ toast: { message, type, id: Date.now() } })
    setTimeout(() => {
      set((s) => (s.toast?.id === Date.now() ? { toast: null } : {}))
    }, 3000)
  },

  dismissToast: () => set({ toast: null }),

  setChatPanelOpen: (val) => set({ chatPanelOpen: val }),
}))
