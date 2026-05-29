import mongoose, { Schema, type Document } from "mongoose";

export interface IGmailToken extends Document {
  userId: mongoose.Types.ObjectId;
  accessToken: string;
  refreshToken: string;
  scope: string;
  tokenType: string;
  expiryDate: Date;
  gmailAddress: string;
  createdAt: Date;
  updatedAt: Date;
}

const gmailTokenSchema = new Schema<IGmailToken>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    accessToken: { type: String, required: true },
    refreshToken: { type: String, required: true },
    scope: { type: String, required: true },
    tokenType: { type: String, default: "Bearer" },
    expiryDate: { type: Date, required: true },
    gmailAddress: { type: String, required: true },
  },
  { timestamps: true },
);

export const GmailToken = mongoose.model<IGmailToken>("GmailToken", gmailTokenSchema);
