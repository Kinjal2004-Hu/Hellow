import mongoose, { Schema, type Document } from "mongoose";

export interface IContact extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  phone: string;
  email: string;
  notes: string;
  isFavorite: boolean;
  createdAt: Date;
}

const contactSchema = new Schema<IContact>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, default: "" },
    email: { type: String, default: "", lowercase: true, trim: true },
    notes: { type: String, default: "" },
    isFavorite: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const Contact = mongoose.model<IContact>("Contact", contactSchema);
