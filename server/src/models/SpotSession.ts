import mongoose, { Schema, type Document } from "mongoose";

export interface LocationPin {
  lat: number;
  lng: number;
  label: string;
  description: string;
  imageUrl: string | null;
  createdBy: string;
  createdAt: Date;
}

export interface LocationUpdate {
  userId: string;
  lat: number;
  lng: number;
  timestamp: Date;
}

export interface SpotMessage {
  senderId: string;
  senderName: string;
  content: string;
  createdAt: Date;
}

export interface ISpotSession extends Document {
  code: string;
  name: string;
  hostId: mongoose.Types.ObjectId;
  members: mongoose.Types.ObjectId[];
  pins: LocationPin[];
  messages: SpotMessage[];
  locationHistory: LocationUpdate[];
  isLive: boolean;
  createdAt: Date;
  endedAt: Date | null;
}

const locationPinSchema = new Schema<LocationPin>({
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  label: { type: String, default: "" },
  description: { type: String, default: "" },
  imageUrl: { type: String, default: null },
  createdBy: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
}, { _id: false });

const locationUpdateSchema = new Schema<LocationUpdate>({
  userId: { type: String, required: true },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
}, { _id: false });

const spotMessageSchema = new Schema<SpotMessage>({
  senderId: { type: String, required: true },
  senderName: { type: String, required: true },
  content: { type: String, required: true, trim: true },
  createdAt: { type: Date, default: Date.now },
}, { _id: false });

const spotSessionSchema = new Schema<ISpotSession>(
  {
    code: { type: String, required: true, unique: true, uppercase: true },
    name: { type: String, default: "Map session", trim: true },
    hostId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    members: [{ type: Schema.Types.ObjectId, ref: "User" }],
    pins: [locationPinSchema],
    messages: [spotMessageSchema],
    locationHistory: [locationUpdateSchema],
    isLive: { type: Boolean, default: true },
    endedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

export const SpotSession = mongoose.model<ISpotSession>("SpotSession", spotSessionSchema);
