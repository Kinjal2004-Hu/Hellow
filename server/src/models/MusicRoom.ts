import mongoose, { Schema, type Document } from "mongoose";
import type { MusicRole } from "../permissions/types.js";

export interface IMusicRoom extends Document {
  code: string;
  roles: Record<string, MusicRole>;
  members: mongoose.Types.ObjectId[];
  currentTrack: {
    id: string;
    title: string;
    artist: string;
    albumArt: string;
    duration: number;
  } | null;
  queue: { id: string; title: string; artist: string; albumArt: string; duration: number }[];
  isPlaying: boolean;
  position: number;
  powerToAll: boolean;
  createdAt: Date;
}

const musicRoomSchema = new Schema<IMusicRoom>(
  {
    code: { type: String, required: true, unique: true, uppercase: true },
    roles: { type: Schema.Types.Mixed, default: {} },
    members: [{ type: Schema.Types.ObjectId, ref: "User" }],
    currentTrack: {
      id: String,
      title: String,
      artist: String,
      albumArt: String,
      duration: Number,
    },
    queue: [
      {
        id: String,
        title: String,
        artist: String,
        albumArt: String,
        duration: Number,
      },
    ],
    isPlaying: { type: Boolean, default: false },
    position: { type: Number, default: 0 },
    powerToAll: { type: Boolean, default: false },
  },
  { timestamps: true },
);

musicRoomSchema.index({ "roles": 1 });

export const MusicRoom = mongoose.model<IMusicRoom>("MusicRoom", musicRoomSchema);
