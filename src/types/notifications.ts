// Mirrors server/src/notifications/types.ts

export type NotificationType =
  | "message:new"
  | "message:reply"
  | "message:mention"
  | "room:invite"
  | "room:role_changed"
  | "task:reminder"
  | "task:assigned"
  | "task:overdue"
  | "calendar:reminder"
  | "calendar:invite"
  | "calendar:updated"
  | "meeting:started"
  | "meeting:invite"
  | "meeting:reminder"
  | "collab:shared"
  | "collab:edited"
  | "collab:commented"
  | "gmail:new_email"
  | "spotsync:event"
  | "system:update";

export type NotificationCategory =
  | "chat" | "tasks" | "calendar" | "meetings" | "collab" | "gmail" | "spotsync" | "system";

export interface AppNotification {
  _id: string;
  type: NotificationType;
  category: NotificationCategory;
  title: string;
  body: string;
  data: Record<string, unknown>;
  groupKey: string | null;
  readAt: string | null;
  dismissedAt: string | null;
  createdAt: string;
}

export function categoryForType(type: NotificationType): NotificationCategory {
  if (type.startsWith("message:") || type.startsWith("room:")) return "chat";
  if (type.startsWith("task:")) return "tasks";
  if (type.startsWith("calendar:")) return "calendar";
  if (type.startsWith("meeting:")) return "meetings";
  if (type.startsWith("collab:")) return "collab";
  if (type.startsWith("gmail:")) return "gmail";
  if (type.startsWith("spotsync:")) return "spotsync";
  return "system";
}
