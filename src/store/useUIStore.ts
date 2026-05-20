import { create } from "zustand";

export type ModalName =
  | "notes"
  | "tasks"
  | "calendar"
  | "bookmarks"
  | "newContact"
  | "search";

export type PanelName = "youtube" | "gmail" | "chatRoom";

export interface Toast {
  id: string;
  message: string;
  type?: "default" | "success" | "error";
}

interface UIState {
  modals: Record<ModalName, boolean>;
  panels: Record<PanelName, boolean>;
  searchQuery: string;
  toast: Toast | null;

  openModal: (name: ModalName) => void;
  closeModal: (name: ModalName) => void;
  closeAllModals: () => void;
  openPanel: (name: PanelName) => void;
  closePanel: (name: PanelName) => void;
  setSearchQuery: (q: string) => void;
  showToast: (message: string, type?: Toast["type"]) => void;
  clearToast: () => void;
}

const initialModals: Record<ModalName, boolean> = {
  notes: false,
  tasks: false,
  calendar: false,
  bookmarks: false,
  newContact: false,
  search: false,
};

const initialPanels: Record<PanelName, boolean> = {
  youtube: false,
  gmail: false,
  chatRoom: false,
};

export const useUIStore = create<UIState>((set, get) => ({
  modals: initialModals,
  panels: initialPanels,
  searchQuery: "",
  toast: null,

  openModal: (name) =>
    set({ modals: { ...initialModals, [name]: true } }),
  closeModal: (name) =>
    set({ modals: { ...get().modals, [name]: false } }),
  closeAllModals: () => set({ modals: { ...initialModals } }),
  openPanel: (name) =>
    set({ panels: { ...get().panels, [name]: true } }),
  closePanel: (name) =>
    set({ panels: { ...get().panels, [name]: false } }),
  setSearchQuery: (q) =>
    set({ searchQuery: q, modals: { ...initialModals, search: true } }),
  showToast: (message, type = "default") => {
    const id = crypto.randomUUID();
    set({ toast: { id, message, type } });
    setTimeout(() => {
      if (get().toast?.id === id) set({ toast: null });
    }, 3000);
  },
  clearToast: () => set({ toast: null }),
}));
