import type { NotificationType, NotificationCategory } from "./types.js";
import { categoryForType, groupKeyForPayload } from "./types.js";
import { Notification } from "../models/Notification.js";
import type mongoose from "mongoose";

export interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  body?: string;
  data?: Record<string, unknown>;
  groupKey?: string | null;
}

export async function createNotification(input: CreateNotificationInput): Promise<{
  _id: string;
  userId: string;
  type: string;
  category: string;
  title: string;
  body: string;
  data: Record<string, unknown>;
  groupKey: string | null;
  readAt: Date | null;
  createdAt: Date;
}> {
  const category = categoryForType(input.type);
  const groupKey = input.groupKey !== undefined ? input.groupKey : groupKeyForPayload({
    type: input.type,
    data: input.data ?? {},
  });

  const doc = await Notification.create({
    userId: input.userId,
    type: input.type,
    category,
    title: input.title,
    body: input.body ?? "",
    data: input.data ?? {},
    groupKey,
  });

  return {
    _id: doc._id.toString(),
    userId: doc.userId.toString(),
    type: doc.type,
    category: doc.category,
    title: doc.title,
    body: doc.body,
    data: doc.data,
    groupKey: doc.groupKey,
    readAt: doc.readAt,
    createdAt: doc.createdAt,
  };
}

export async function fetchNotifications(
  userId: string,
  options: { before?: Date; limit?: number; includeRead?: boolean } = {},
) {
  const filter: Record<string, any> = { userId };

  if (options.before) filter.createdAt = { $lt: options.before };
  if (!options.includeRead) filter.readAt = null;

  const docs = await Notification.find(filter)
    .sort({ createdAt: -1 })
    .limit(Math.min(options.limit ?? 50, 100))
    .lean();

  return docs.map((d) => ({
    _id: d._id.toString(),
    userId: d.userId.toString(),
    type: d.type,
    category: d.category,
    title: d.title,
    body: d.body,
    data: d.data,
    groupKey: d.groupKey,
    readAt: d.readAt,
    dismissedAt: d.dismissedAt,
    createdAt: d.createdAt,
  }));
}

export async function markRead(notificationId: string, userId: string): Promise<boolean> {
  const res = await Notification.updateOne(
    { _id: notificationId, userId },
    { $set: { readAt: new Date() } },
  );
  return res.modifiedCount > 0;
}

export async function markAllRead(userId: string): Promise<number> {
  const res = await Notification.updateMany(
    { userId, readAt: null },
    { $set: { readAt: new Date() } },
  );
  return res.modifiedCount;
}

export async function markDismissed(notificationId: string, userId: string): Promise<boolean> {
  const res = await Notification.updateOne(
    { _id: notificationId, userId },
    { $set: { dismissedAt: new Date() } },
  );
  return res.modifiedCount > 0;
}

export async function dismissAll(userId: string): Promise<number> {
  const res = await Notification.updateMany(
    { userId, dismissedAt: null },
    { $set: { dismissedAt: new Date() } },
  );
  return res.modifiedCount;
}

export async function getUnreadCount(userId: string): Promise<number> {
  return Notification.countDocuments({ userId, readAt: null, dismissedAt: null });
}

export async function getGroupedUnreadCounts(userId: string): Promise<Record<string, number>> {
  const docs = await Notification.aggregate([
    { $match: { userId: new (await import("mongoose")).Types.ObjectId(userId), readAt: null, dismissedAt: null } },
    { $group: { _id: "$category", count: { $sum: 1 } } },
  ]);
  return Object.fromEntries(docs.map((d: any) => [d._id, d.count]));
}
