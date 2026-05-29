// ─── Domain Event Map ───
// Every feature event lives here. Add a new key + payload type whenever a feature
// needs to broadcast something other modules may care about.

export interface DomainEventMap {
  // Auth
  "user:registered": { userId: string; email: string; method: "email" | "google" };
  "user:logged_in": { userId: string; email: string };

  // Rooms
  "room:created": { roomId: string; name: string; kind: string; creatorId: string; category: string };
  "room:updated": { roomId: string; actorId: string; changes: Record<string, unknown> };
  "room:deleted": { roomId: string; actorId: string };
  "room:member_joined": { roomId: string; userId: string; role: string };
  "room:member_left": { roomId: string; userId: string };
  "room:member_role_changed": { roomId: string; actorId: string; targetId: string; oldRole: string; newRole: string };

  // Messaging
  "message:sent": { messageId: string; roomId: string; senderId: string; senderName: string; content: string; tempId: string | null };
  "message:deleted": { messageId: string; roomId: string; actorId: string };

  // Notes
  "note:created": { noteId: string; userId: string; title: string };
  "note:updated": { noteId: string; userId: string; changes: Record<string, unknown> };
  "note:deleted": { noteId: string; userId: string };

  // Tasks
  "task:created": { taskId: string; userId: string; title: string; content: string; dueAt: string | null };
  "task:completed": { taskId: string; userId: string };
  "task:updated": { taskId: string; userId: string; changes: Record<string, unknown> };
  "task:deleted": { taskId: string; userId: string };

  // Calendar
  "calendar:event_created": { eventId: string; userId: string; title: string; startAt: string };
  "calendar:event_updated": { eventId: string; userId: string; changes: Record<string, unknown> };
  "calendar:event_deleted": { eventId: string; userId: string };

  // Meetings
  "meeting:started": { meetingCode: string; hostId: string; name: string };
  "meeting:ended": { meetingCode: string; hostId: string };
  "meeting:participant_joined": { meetingCode: string; userId: string };

  // Collaboration
  "collab:resource_shared": { resourceId: string; resourceType: string; resourceTitle: string; ownerId: string; sharedWithId: string };
  "collab:resource_edited": { resourceId: string; resourceType: string; actorId: string; actorName: string };

  // Gmail
  "gmail:connected": { userId: string; email: string };
  "gmail:disconnected": { userId: string };

  // Bookmarks
  "bookmark:created": { bookmarkId: string; userId: string; title: string; url: string };
  "bookmark:deleted": { bookmarkId: string; userId: string };

  // Drive
  "drive:file_uploaded": { fileId: string; userId: string; name: string; size: number };
  "drive:file_deleted": { fileId: string; userId: string };
  "drive:folder_created": { folderId: string; userId: string; name: string };

  // SpotSync
  "spotsync:created": { sessionCode: string; hostId: string; name: string };
  "spotsync:ended": { sessionCode: string; hostId: string };
  "spotsync:joined": { sessionCode: string; userId: string };
  "spotsync:pin_added": { sessionCode: string; pin: { lat: number; lng: number; label: string; description: string; imageUrl: string | null } };

  // Workspace
  "workspace:created": { sessionCode: string; hostId: string; name: string };
  "workspace:joined": { sessionCode: string; userId: string };
  "workspace:ended": { sessionCode: string; hostId: string };
  "workspace:state_updated": { sessionCode: string; userId: string; sharedState: Record<string, unknown> };
  "workspace:follow_changed": { sessionCode: string; userId: string; followMode: boolean };

  // Notifications
  "notification:created": { notificationId: string; userId: string; type: string; title: string };

  // System
  "system:startup": { version: string };
  "system:shutdown": {};
}

export type DomainEventType = keyof DomainEventMap & string;

export type DomainPayload<E extends DomainEventType> = DomainEventMap[E];

export interface DomainEvent<E extends DomainEventType = DomainEventType> {
  type: E;
  payload: DomainPayload<E>;
  timestamp: Date;
  correlationId: string | null;
}

export type EventHandler<E extends DomainEventType = DomainEventType> = (
  payload: DomainPayload<E>,
  event: DomainEvent<E>,
) => void | Promise<void>;

export type Unsubscribe = () => void;
