import { on } from "../emitter.js";
import type { DomainEventType, DomainPayload, DomainEvent } from "../types.js";
import { ActivityLog } from "../../models/ActivityLog.js";

const LOGGED_EVENTS: DomainEventType[] = [
  "user:registered",
  "room:created",
  "room:deleted",
  "room:member_joined",
  "room:member_left",
  "room:member_role_changed",
  "message:sent",
  "message:deleted",
  "note:created",
  "note:updated",
  "note:deleted",
  "task:created",
  "task:completed",
  "task:updated",
  "task:deleted",
  "calendar:event_created",
  "calendar:event_updated",
  "calendar:event_deleted",
  "meeting:started",
  "meeting:ended",
  "collab:resource_shared",
  "collab:resource_edited",
  "gmail:connected",
  "gmail:disconnected",
  "bookmark:created",
  "bookmark:deleted",
  "drive:file_uploaded",
  "drive:file_deleted",
  "drive:folder_created",
  "spotsync:created",
  "spotsync:ended",
  "spotsync:joined",
  "spotsync:pin_added",
  "workspace:created",
  "workspace:joined",
  "workspace:ended",
  "workspace:state_updated",
  "workspace:follow_changed",
];

function moduleForEvent(type: DomainEventType): string {
  if (type.startsWith("user:")) return "auth";
  if (type.startsWith("room:") || type.startsWith("message:")) return "chat";
  if (type.startsWith("note:")) return "notes";
  if (type.startsWith("task:")) return "tasks";
  if (type.startsWith("calendar:")) return "calendar";
  if (type.startsWith("meeting:")) return "meetings";
  if (type.startsWith("collab:")) return "collab";
  if (type.startsWith("gmail:")) return "gmail";
  if (type.startsWith("bookmark:")) return "bookmarks";
  if (type.startsWith("drive:")) return "drive";
  if (type.startsWith("spotsync:")) return "spotsync";
  if (type.startsWith("workspace:")) return "workspace";
  return "system";
}

function extractUserId(type: DomainEventType, payload: any): string | null {
  return payload.userId ?? payload.actorId ?? payload.senderId ?? payload.creatorId ?? payload.hostId ?? payload.ownerId ?? null;
}

export function registerActivityLogger(): void {
  for (const eventType of LOGGED_EVENTS) {
    on(eventType, async (payload: any, event: any) => {
      const userId = extractUserId(eventType, payload);
      if (!userId) return;

      try {
        await ActivityLog.create({
          userId,
          module: moduleForEvent(eventType),
          event: eventType,
          metadata: { ...payload, correlationId: event.correlationId },
          timestamp: event.timestamp,
        });
      } catch (err) {
        console.error(`[ActivityLog] Failed to log ${eventType}:`, err);
      }
    }, `activity:${eventType}`);
  }
}
