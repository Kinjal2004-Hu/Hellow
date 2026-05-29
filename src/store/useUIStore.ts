import { create } from "zustand";

export type ModalName =
  | "notes"
  | "tasks"
  | "calendar"
  | "bookmarks"
  | "newContact"
  | "search"
  | "aiChat"
  | "microLearning";

export type PanelName = "youtube" | "gmail" | "search";

export type DrawerType =
  | "contacts"
  | "location"
  | "meetings"
  | "news"
  | "media"
  | "actions"
  | "mail"
  | "tasks"
  | "profile";

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
  activeDrawer: DrawerType | null;
  leftSidebarCollapsed: boolean;

  openModal: (name: ModalName) => void;
  closeModal: (name: ModalName) => void;
  closeAllModals: () => void;
  openPanel: (name: PanelName) => void;
  closePanel: (name: PanelName) => void;
  setSearchQuery: (q: string) => void;
  openDrawer: (name: DrawerType) => void;
  closeDrawer: () => void;
  toggleDrawer: (name: DrawerType) => void;
  toggleLeftSidebar: () => void;
  setLeftSidebarCollapsed: (collapsed: boolean) => void;
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
  aiChat: false,
  microLearning: false,
};

const initialPanels: Record<PanelName, boolean> = {
  youtube: false,
  gmail: false,
  search: false,
};

export const useUIStore = create<UIState>((set, get) => ({
  modals: initialModals,
  panels: initialPanels,
  searchQuery: "",
  toast: null,
  activeDrawer: null,
  leftSidebarCollapsed: false,

  openModal: (name) =>
    set({ modals: { ...initialModals, [name]: true } }),
  closeModal: (name) =>
    set({ modals: { ...get().modals, [name]: false } }),
  closeAllModals: () => set({ modals: { ...initialModals } }),
  openPanel: (name) =>
    set({ panels: { ...get().panels, [name]: true } }),
  closePanel: (name) =>
    set({ panels: { ...get().panels, [name]: false } }),
  openDrawer: (name) => set({ activeDrawer: name }),
  closeDrawer: () => set({ activeDrawer: null }),
  toggleDrawer: (name) =>
    set({ activeDrawer: get().activeDrawer === name ? null : name }),
  toggleLeftSidebar: () =>
    set({ leftSidebarCollapsed: !get().leftSidebarCollapsed }),
  setLeftSidebarCollapsed: (collapsed) =>
    set({ leftSidebarCollapsed: collapsed }),
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
