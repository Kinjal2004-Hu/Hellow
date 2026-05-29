import mongoose, { Schema, type Document } from "mongoose";
import type { CollaboratorRole } from "../permissions/types.js";

export interface INote extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  content: string;
  folderId: mongoose.Types.ObjectId | null;
  tags: string[];
  isArchived: boolean;
  collaborators: Record<string, CollaboratorRole>;
  createdAt: Date;
  updatedAt: Date;
}

const noteSchema = new Schema<INote>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true },
    content: { type: String, default: "" },
    folderId: { type: Schema.Types.ObjectId, ref: "NoteFolder", default: null },
    tags: [{ type: String, trim: true }],
    isArchived: { type: Boolean, default: false },
    collaborators: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

noteSchema.index({ userId: 1, isArchived: 1 });
noteSchema.index({ tags: 1 });

export const Note = mongoose.model<INote>("Note", noteSchema);

export interface INoteFolder extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  parentId: mongoose.Types.ObjectId | null;
}

const noteFolderSchema = new Schema<INoteFolder>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true },
    parentId: { type: Schema.Types.ObjectId, ref: "NoteFolder", default: null },
  },
  { timestamps: true },
);

export const NoteFolder = mongoose.model<INoteFolder>("NoteFolder", noteFolderSchema);
