import mongoose, { Schema, type Document } from "mongoose";
import type { CollaboratorRole } from "../permissions/types.js";

export type TaskPriority = "low" | "medium" | "high";
export type RecurringRule = "daily" | "weekdays" | "weekly" | "monthly" | "yearly" | null;

export interface ITask extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  content: string;
  dueAt: Date | null;
  done: boolean;
  priority: TaskPriority;
  tags: string[];
  reminderAt: Date | null;
  isRecurring: boolean;
  recurringRule: RecurringRule;
  isArchived: boolean;
  collaborators: Record<string, CollaboratorRole>;
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new Schema<ITask>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true },
    content: { type: String, default: "" },
    dueAt: { type: Date, default: null },
    done: { type: Boolean, default: false },
    priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
    tags: [{ type: String, trim: true }],
    reminderAt: { type: Date, default: null },
    isRecurring: { type: Boolean, default: false },
    recurringRule: { type: String, enum: ["daily", "weekdays", "weekly", "monthly", "yearly", null], default: null },
    isArchived: { type: Boolean, default: false },
    collaborators: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

taskSchema.index({ userId: 1, done: 1 });
taskSchema.index({ userId: 1, dueAt: 1 });
taskSchema.index({ userId: 1, priority: 1 });

export const Task = mongoose.model<ITask>("Task", taskSchema);
