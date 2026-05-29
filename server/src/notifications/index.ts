export type { NotificationType, NotificationCategory, NotificationPayload } from "./types.js";
export { categoryForType, groupKeyForPayload } from "./types.js";
export {
  createNotification,
  fetchNotifications,
  markRead,
  markAllRead,
  markDismissed,
  dismissAll,
  getUnreadCount,
  getGroupedUnreadCounts,
} from "./service.js";
export { notificationNamespace, emitNotification, emitUnreadCount } from "./socket.js";
