import mongoose, { Schema, type Document } from "mongoose";
import type { MeetingRole } from "../permissions/types.js";

export interface IMeeting extends Document {
  code: string;
  name: string;
  roles: Record<string, MeetingRole>;
  participants: mongoose.Types.ObjectId[];
  createdAt: Date;
  endedAt: Date | null;
}

const meetingSchema = new Schema<IMeeting>(
  {
    code: { type: String, required: true, unique: true, uppercase: true },
    name: { type: String, default: "Quick meeting", trim: true },
    roles: { type: Schema.Types.Mixed, default: {} },
    participants: [{ type: Schema.Types.ObjectId, ref: "User" }],
    endedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

meetingSchema.index({ "roles": 1 });

export const Meeting = mongoose.model<IMeeting>("Meeting", meetingSchema);
