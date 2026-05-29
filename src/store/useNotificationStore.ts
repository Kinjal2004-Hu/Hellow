import { create } from "zustand";
import type { AppNotification } from "@/types/notifications";

interface NotificationState {
  notifications: AppNotification[];
  unreadCount: number;
  groupedUnread: Record<string, number>;
  setNotifications: (n: AppNotification[]) => void;
  addNotification: (n: AppNotification) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  dismissOne: (id: string) => void;
  dismissAll: () => void;
  setUnreadCount: (n: number) => void;
  setGroupedUnread: (g: Record<string, number>) => void;
  clearNotifications: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  groupedUnread: {},

  setNotifications: (notifications) => set({ notifications }),

  addNotification: (n) =>
    set({
      notifications: [n, ...get().notifications],
      unreadCount: get().unreadCount + 1,
      groupedUnread: {
        ...get().groupedUnread,
        [n.category]: (get().groupedUnread[n.category] ?? 0) + 1,
      },
    }),

  markRead: (id) =>
    set({
      notifications: get().notifications.map((n) =>
        n._id === id ? { ...n, readAt: new Date().toISOString() } : n,
      ),
      unreadCount: Math.max(0, get().unreadCount - 1),
    }),

  markAllRead: () =>
    set({
      notifications: get().notifications.map((n) =>
        n.readAt ? n : { ...n, readAt: new Date().toISOString() },
      ),
      unreadCount: 0,
      groupedUnread: {},
    }),

  dismissOne: (id) =>
    set({
      notifications: get().notifications.filter((n) => n._id !== id),
    }),

  dismissAll: () =>
    set({ notifications: [], unreadCount: 0, groupedUnread: {} }),

  setUnreadCount: (count) => set({ unreadCount: count }),

  setGroupedUnread: (grouped) => set({ groupedUnread: grouped }),

  clearNotifications: () => set({ notifications: [], unreadCount: 0, groupedUnread: {} }),
}));
