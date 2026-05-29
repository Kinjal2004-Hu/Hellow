import { api } from "./api";
import type { AppNotification } from "@/types/notifications";

export async function fetchNotifications(params?: {
  before?: string;
  limit?: number;
  includeRead?: boolean;
}): Promise<{ notifications: AppNotification[] }> {
  const { data } = await api.get("/notifications", { params });
  return data;
}

export async function fetchUnreadCount(): Promise<{ count: number }> {
  const { data } = await api.get("/notifications/unread");
  return data;
}

export async function fetchGroupedUnread(): Promise<{
  counts: Record<string, number>;
}> {
  const { data } = await api.get("/notifications/unread/grouped");
  return data;
}

export async function markNotificationRead(id: string): Promise<void> {
  await api.post(`/notifications/${id}/read`);
}

export async function markAllNotificationsRead(): Promise<void> {
  await api.post("/notifications/read-all");
}

export async function dismissNotification(id: string): Promise<void> {
  await api.post(`/notifications/${id}/dismiss`);
}

export async function dismissAllNotifications(): Promise<void> {
  await api.post("/notifications/dismiss-all");
}
