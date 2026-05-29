import mongoose, { Schema, type Document } from "mongoose";

export interface IMessage extends Document {
  roomId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  content: string;
  type: "text" | "image" | "location";
  tempId: string | null;
  createdAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    roomId: { type: Schema.Types.ObjectId, ref: "Room", required: true, index: true },
    senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
    type: { type: String, enum: ["text", "image", "location"], default: "text" },
    tempId: { type: String, default: null },
  },
  { timestamps: true },
);

messageSchema.index({ roomId: 1, createdAt: -1 });

export const Message = mongoose.model<IMessage>("Message", messageSchema);
