import mongoose, { Schema, type Document } from "mongoose";
import type { WorkspaceRole } from "../permissions/types.js";

export interface WorkspaceSharedState {
  currentUrl: string;
  currentRoute: string;
  panels: Record<string, boolean>;
  scrollPosition: { x: number; y: number };
  activeAnnotations: string[];
  activeBookmarks: string[];
}

export interface IWorkspaceSession extends Document {
  code: string;
  name: string;
  hostId: mongoose.Types.ObjectId;
  members: mongoose.Types.ObjectId[];
  roles: Record<string, WorkspaceRole>;
  sharedState: WorkspaceSharedState;
  followMode: boolean;
  isLive: boolean;
  createdAt: Date;
  endedAt: Date | null;
}

const sharedStateSchema = new Schema<WorkspaceSharedState>({
  currentUrl: { type: String, default: "" },
  currentRoute: { type: String, default: "/" },
  panels: { type: Schema.Types.Mixed, default: {} },
  scrollPosition: { x: { type: Number, default: 0 }, y: { type: Number, default: 0 } },
  activeAnnotations: { type: [String], default: [] },
  activeBookmarks: { type: [String], default: [] },
}, { _id: false });

const workspaceSessionSchema = new Schema<IWorkspaceSession>(
  {
    code: { type: String, required: true, unique: true, uppercase: true },
    name: { type: String, default: "Workspace", trim: true },
    hostId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    members: [{ type: Schema.Types.ObjectId, ref: "User" }],
    roles: { type: Schema.Types.Mixed, default: {} },
    sharedState: { type: sharedStateSchema, default: () => ({
      currentUrl: "",
      currentRoute: "/",
      panels: {},
      scrollPosition: { x: 0, y: 0 },
      activeAnnotations: [],
      activeBookmarks: [],
    })},
    followMode: { type: Boolean, default: false },
    isLive: { type: Boolean, default: true },
    endedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

export const WorkspaceSession = mongoose.model<IWorkspaceSession>("WorkspaceSession", workspaceSessionSchema);
