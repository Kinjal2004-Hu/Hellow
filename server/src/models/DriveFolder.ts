import mongoose, { Schema, type Document } from "mongoose";

export interface IDriveFolder extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  parentId: mongoose.Types.ObjectId | null;
  createdAt: Date;
}

const driveFolderSchema = new Schema<IDriveFolder>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true },
    parentId: { type: Schema.Types.ObjectId, ref: "DriveFolder", default: null },
  },
  { timestamps: true },
);

export const DriveFolder = mongoose.model<IDriveFolder>("DriveFolder", driveFolderSchema);
