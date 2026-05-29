import mongoose, { Schema, type Document } from "mongoose";

export interface IMicroLearning extends Document {
  bookTitle: string;
  author: string;
  category: string;
  coverImage: string;
  readTime: number;
  ideas: { title: string; body: string }[];
  date: Date;
}

const microLearningSchema = new Schema<IMicroLearning>(
  {
    bookTitle: { type: String, required: true },
    author: { type: String, required: true },
    category: { type: String, required: true },
    coverImage: { type: String, default: "" },
    readTime: { type: Number, default: 3 },
    ideas: [{ title: String, body: String }],
    date: { type: Date, required: true, index: true },
  },
  { timestamps: true },
);

export const MicroLearning = mongoose.model<IMicroLearning>("MicroLearning", microLearningSchema);
