import mongoose, { Schema, type Document } from "mongoose";

export interface IDriveFile extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  mimeType: string;
  size: number;
  url: string;
  folderId: mongoose.Types.ObjectId | null;
  isStarred: boolean;
  isTrashed: boolean;
  source: "user" | "app";
  createdAt: Date;
}

const driveFileSchema = new Schema<IDriveFile>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true },
    mimeType: { type: String, default: "application/octet-stream" },
    size: { type: Number, default: 0 },
    url: { type: String, required: true },
    folderId: { type: Schema.Types.ObjectId, ref: "DriveFolder", default: null },
    isStarred: { type: Boolean, default: false },
    isTrashed: { type: Boolean, default: false },
    source: { type: String, enum: ["user", "app"], default: "user" },
  },
  { timestamps: true },
);

export const DriveFile = mongoose.model<IDriveFile>("DriveFile", driveFileSchema);
