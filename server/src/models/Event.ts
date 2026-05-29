import mongoose, { Schema, type Document } from "mongoose";
import type { CollaboratorRole } from "../permissions/types.js";

export type RecurringRule = "daily" | "weekly" | "monthly" | "yearly" | null;

export interface ICalendarEvent extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  startAt: Date;
  endAt: Date;
  allDay: boolean;
  color: string | null;
  meetingCode: string | null;
  reminderMinutes: number[];
  isRecurring: boolean;
  recurringRule: RecurringRule;
  collaborators: Record<string, CollaboratorRole>;
  createdAt: Date;
  updatedAt: Date;
}

const eventSchema = new Schema<ICalendarEvent>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    startAt: { type: Date, required: true },
    endAt: { type: Date, required: true },
    allDay: { type: Boolean, default: false },
    color: { type: String, default: null },
    meetingCode: { type: String, default: null },
    reminderMinutes: [{ type: Number }],
    isRecurring: { type: Boolean, default: false },
    recurringRule: { type: String, enum: ["daily", "weekly", "monthly", "yearly", null], default: null },
    collaborators: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

eventSchema.index({ userId: 1, startAt: 1 });
eventSchema.index({ meetingCode: 1 });

export const CalendarEvent = mongoose.model<ICalendarEvent>("CalendarEvent", eventSchema);
