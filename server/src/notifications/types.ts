// ─── Event Type Enum ───
// Each notification has exactly one type. Add new types here as features grow.

export type NotificationType =
  // Chat / Messaging
  | "message:new"
  | "message:reply"
  | "message:mention"
  | "room:invite"
  | "room:role_changed"
  // Tasks
  | "task:reminder"
  | "task:assigned"
  | "task:overdue"
  // Calendar
  | "calendar:reminder"
  | "calendar:invite"
  | "calendar:updated"
  // Meetings
  | "meeting:started"
  | "meeting:invite"
  | "meeting:reminder"
  // Collaboration
  | "collab:shared"
  | "collab:edited"
  | "collab:commented"
  // External integrations
  | "gmail:new_email"
  | "spotsync:event"
  | "workspace:invite"
  | "workspace:state_change"
  // System
  | "system:update";

// ─── Category grouping for UI sections ───

export type NotificationCategory = "chat" | "tasks" | "calendar" | "meetings" | "collab" | "gmail" | "spotsync" | "workspace" | "system";

export function categoryForType(type: NotificationType): NotificationCategory {
  if (type.startsWith("message:") || type.startsWith("room:")) return "chat";
  if (type.startsWith("task:")) return "tasks";
  if (type.startsWith("calendar:")) return "calendar";
  if (type.startsWith("meeting:")) return "meetings";
  if (type.startsWith("collab:")) return "collab";
  if (type.startsWith("gmail:")) return "gmail";
  if (type.startsWith("spotsync:")) return "spotsync";
  if (type.startsWith("workspace:")) return "workspace";
  return "system";
}

// ─── Payload shapes per domain ───

export interface MessageNotificationPayload {
  roomId: string;
  messageId: string;
  senderId: string;
  senderName: string;
  preview: string;
}

export interface RoomNotificationPayload {
  roomId: string;
  roomName: string;
  actorId?: string;
  actorName?: string;
  newRole?: string;
}

export interface TaskNotificationPayload {
  taskId: string;
  taskContent: string;
  dueAt?: string;
  assignedBy?: string;
}

export interface CalendarNotificationPayload {
  eventId: string;
  eventTitle: string;
  startAt: string;
}

export interface MeetingNotificationPayload {
  meetingCode: string;
  meetingName: string;
  hostName?: string;
}

export interface CollabNotificationPayload {
  resourceId: string;
  resourceType: "note" | "task" | "calendar";
  resourceTitle: string;
  actorName: string;
}

export interface GmailNotificationPayload {
  messageId: string;
  threadId: string;
  sender: string;
  subject: string;
  preview: string;
}

export interface SpotSyncNotificationPayload {
  eventId: string;
  venue: string;
  action: string;
}

// ─── Discriminated union for typed payloads ───

export type NotificationPayload =
  | { type: "message:new" | "message:reply" | "message:mention"; data: MessageNotificationPayload }
  | { type: "room:invite" | "room:role_changed"; data: RoomNotificationPayload }
  | { type: "task:reminder" | "task:assigned" | "task:overdue"; data: TaskNotificationPayload }
  | { type: "calendar:reminder" | "calendar:invite" | "calendar:updated"; data: CalendarNotificationPayload }
  | { type: "meeting:started" | "meeting:invite" | "meeting:reminder"; data: MeetingNotificationPayload }
  | { type: "collab:shared" | "collab:edited" | "collab:commented"; data: CollabNotificationPayload }
  | { type: "gmail:new_email"; data: GmailNotificationPayload }
  | { type: "spotsync:event"; data: SpotSyncNotificationPayload }
  | { type: "system:update"; data: { message: string; link?: string } }
  | { type: "workspace:invite"; data: { sessionCode: string; sessionName: string; hostName: string } }
  | { type: "workspace:state_change"; data: { sessionCode: string; actorName: string; change: string } };

// ─── Group key helper ───

export function groupKeyForPayload(payload: {
  type: NotificationType;
  data: Record<string, unknown>;
}): string | null {
  switch (payload.type) {
    case "message:new":
    case "message:reply":
    case "message:mention":
      return `room:${payload.data.roomId}`;
    case "room:invite":
    case "room:role_changed":
      return `room:${payload.data.roomId}`;
    case "task:reminder":
    case "task:assigned":
    case "task:overdue":
      return `task:${payload.data.taskId}`;
    case "calendar:reminder":
    case "calendar:invite":
    case "calendar:updated":
      return `event:${payload.data.eventId}`;
    case "meeting:started":
    case "meeting:invite":
    case "meeting:reminder":
      return `meeting:${payload.data.meetingCode}`;
    case "collab:shared":
    case "collab:edited":
    case "collab:commented":
      return `${payload.data.resourceType}:${payload.data.resourceId}`;
    case "gmail:new_email":
      return null; // each email is its own
    case "spotsync:event":
      return `spotsync:${payload.data.eventId}`;
    case "workspace:invite":
    case "workspace:state_change":
      return `workspace:${(payload.data as any).sessionCode}`;
    case "system:update":
      return null;
  }
}
