import mongoose, { Schema, type Document } from "mongoose";

export interface IBookmark extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  url: string;
  notes: string;
  createdAt: Date;
}

const bookmarkSchema = new Schema<IBookmark>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true },
    url: { type: String, required: true },
    notes: { type: String, default: "" },
  },
  { timestamps: true },
);

export const Bookmark = mongoose.model<IBookmark>("Bookmark", bookmarkSchema);
