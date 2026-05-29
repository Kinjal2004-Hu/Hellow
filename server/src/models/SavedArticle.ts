import mongoose, { Schema, type Document } from "mongoose";

export interface ISavedArticle extends Document {
  userId: mongoose.Types.ObjectId;
  articleUrl: string;
  title: string;
  source: string;
  savedAt: Date;
}

const savedArticleSchema = new Schema<ISavedArticle>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    articleUrl: { type: String, required: true },
    title: { type: String, required: true },
    source: { type: String, default: "" },
    savedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

export const SavedArticle = mongoose.model<ISavedArticle>("SavedArticle", savedArticleSchema);
