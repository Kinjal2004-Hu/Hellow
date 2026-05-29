import mongoose, { Schema, type Document } from "mongoose";

export interface IUser extends Document {
  email: string;
  passwordHash: string | null;
  username: string;
  avatarUrl: string | null;
  googleId: string | null;
  preferences: {
    theme: "light" | "dark" | "system";
    notifications: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, default: null },
    username: { type: String, required: true, trim: true },
    avatarUrl: { type: String, default: null },
    googleId: { type: String, default: null, sparse: true },
    preferences: {
      theme: { type: String, enum: ["light", "dark", "system"], default: "light" },
      notifications: { type: Boolean, default: true },
    },
  },
  { timestamps: true },
);

userSchema.index({ googleId: 1 }, { sparse: true });

export const User = mongoose.model<IUser>("User", userSchema);
