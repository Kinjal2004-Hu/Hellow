import mongoose, { Schema, type Document } from "mongoose";
import type { NotificationType, NotificationCategory } from "../notifications/types.js";

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  type: NotificationType;
  category: NotificationCategory;
  title: string;
  body: string;
  data: Record<string, unknown>;
  groupKey: string | null;
  readAt: Date | null;
  dismissedAt: Date | null;
  createdAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: {
      type: String,
      required: true,
      enum: [
        "message:new", "message:reply", "message:mention",
        "room:invite", "room:role_changed",
        "task:reminder", "task:assigned", "task:overdue",
        "calendar:reminder", "calendar:invite", "calendar:updated",
        "meeting:started", "meeting:invite", "meeting:reminder",
        "collab:shared", "collab:edited", "collab:commented",
        "gmail:new_email", "spotsync:event",
        "system:update",
      ],
    },
    category: {
      type: String,
      required: true,
      enum: ["chat", "tasks", "calendar", "meetings", "collab", "gmail", "spotsync", "system"],
    },
    title: { type: String, required: true },
    body: { type: String, default: "" },
    data: { type: Schema.Types.Mixed, default: {} },
    groupKey: { type: String, default: null },
    readAt: { type: Date, default: null },
    dismissedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, readAt: 1 });
notificationSchema.index({ groupKey: 1, createdAt: -1 });

export const Notification = mongoose.model<INotification>("Notification", notificationSchema);
