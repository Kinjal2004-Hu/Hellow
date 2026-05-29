import mongoose, { Schema, type Document } from "mongoose";
import type { RoomRole } from "../permissions/types.js";

export type RoomCategory = "saved" | "hooked" | "trash";
export type RoomKind = "dm" | "channel";

export interface IRoom extends Document {
  name: string;
  kind: RoomKind;
  category: RoomCategory;
  roles: Record<string, RoomRole>;
  members: mongoose.Types.ObjectId[];
  lastReadAt: Record<string, Date>;
  createdAt: Date;
}

const roomSchema = new Schema<IRoom>(
  {
    name: { type: String, required: true, trim: true },
    kind: { type: String, enum: ["dm", "channel"], required: true },
    category: { type: String, enum: ["saved", "hooked", "trash"], default: "saved" },
    roles: { type: Schema.Types.Mixed, default: {} },
    members: [{ type: Schema.Types.ObjectId, ref: "User" }],
    lastReadAt: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

roomSchema.index({ "roles": 1 });

export const Room = mongoose.model<IRoom>("Room", roomSchema);
