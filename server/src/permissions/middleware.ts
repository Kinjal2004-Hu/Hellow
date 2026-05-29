import type { Response, NextFunction } from "express";
import type { AuthRequest } from "../middleware/auth.js";
import type { Permission } from "./types.js";
import { Room } from "../models/Room.js";
import { Meeting } from "../models/Meeting.js";
import { MusicRoom } from "../models/MusicRoom.js";
import { Note } from "../models/Note.js";
import { Task } from "../models/Task.js";
import { CalendarEvent } from "../models/Event.js";
import { WorkspaceSession } from "../models/WorkspaceSession.js";
import { checkResourcePermission } from "./service.js";

type ResourceType = "room" | "meeting" | "music" | "note" | "task" | "calendar" | "workspace";

interface ResourceConfig {
  domain: "room" | "meeting" | "music" | "collab" | "workspace";
  field: string;
  idParams: string[];
}

const RESOURCE_CONFIG: Record<ResourceType, ResourceConfig> = {
  room: { domain: "room", field: "roles", idParams: ["roomId", "room_id"] },
  meeting: { domain: "meeting", field: "roles", idParams: ["meetingId", "meeting_id", "code"] },
  music: { domain: "music", field: "roles", idParams: ["musicId", "music_id", "roomCode", "room_code"] },
  note: { domain: "collab", field: "collaborators", idParams: ["noteId", "note_id"] },
  task: { domain: "collab", field: "collaborators", idParams: ["taskId", "task_id"] },
  calendar: { domain: "collab", field: "collaborators", idParams: ["eventId", "event_id", "calendarId", "calendar_id"] },
  workspace: { domain: "workspace", field: "roles", idParams: ["code", "sessionCode", "session_code"] },
};

function extractId(req: AuthRequest, cfg: ResourceConfig): string | null {
  for (const key of cfg.idParams) {
    const val = req.params[key] ?? req.body[key] ?? req.query[key];
    if (val && typeof val === "string") return val;
  }
  return null;
}

async function loadResource(resource: ResourceType, id: string) {
  switch (resource) {
    case "room": return Room.findById(id);
    case "meeting": return Meeting.findById(id);
    case "music": return MusicRoom.findById(id);
    case "note": return Note.findById(id);
    case "task": return Task.findById(id);
    case "calendar": return CalendarEvent.findById(id);
    case "workspace": return WorkspaceSession.findById(id);
  }
}

export function requirePermission(resource: ResourceType, permission: Permission) {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const cfg = RESOURCE_CONFIG[resource];
    const resourceId = extractId(req, cfg);
    if (!resourceId) {
      res.status(400).json({ error: `${resource} ID required` });
      return;
    }

    const doc = await loadResource(resource, resourceId);
    if (!doc) {
      res.status(404).json({ error: `${resource} not found` });
      return;
    }

    if (!checkResourcePermission(doc, req.userId!, permission, cfg.domain, cfg.field)) {
      res.status(403).json({ error: "Insufficient permissions" });
      return;
    }

    (req as any).resource = doc;
    next();
  };
}

export const requireRoomPermission = (p: Permission) => requirePermission("room", p);
export const requireMeetingPermission = (p: Permission) => requirePermission("meeting", p);
export const requireMusicPermission = (p: Permission) => requirePermission("music", p);
export const requireNotePermission = (p: Permission) => requirePermission("note", p);
export const requireTaskPermission = (p: Permission) => requirePermission("task", p);
export const requireEventPermission = (p: Permission) => requirePermission("calendar", p);
export const requireWorkspacePermission = (p: Permission) => requirePermission("workspace", p);
