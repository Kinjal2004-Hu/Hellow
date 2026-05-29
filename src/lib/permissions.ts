// Mirrors server/src/permissions/types.ts for frontend use in permission-aware rendering.
// Import from this file when evaluating UI state (show/hide buttons, etc.)

export type RoomRole = "owner" | "admin" | "member";
export type MeetingRole = "host" | "participant";
export type MusicRole = "host" | "member";
export type CollaboratorRole = "editor" | "viewer";

export type Permission =
  | "room:delete"
  | "room:update"
  | "room:kick_member"
  | "room:promote_member"
  | "room:demote_member"
  | "room:send_message"
  | "room:delete_message"
  | "room:invite"
  | "room:pin_message"
  | "meeting:end"
  | "meeting:mute_all"
  | "meeting:kick_participant"
  | "meeting:share_screen"
  | "music:control_playback"
  | "music:manage_queue"
  | "music:toggle_power_to_all"
  | "collab:read"
  | "collab:write"
  | "collab:delete"
  | "collab:share"
  | "mod:mute"
  | "mod:warn"
  | "mod:ban"
  | "mod:suspend"
  | "mod:view_reports";

export const ROOM_ROLE_PERMISSIONS: Record<RoomRole, readonly Permission[]> = {
  owner: [
    "room:delete",
    "room:update",
    "room:kick_member",
    "room:promote_member",
    "room:demote_member",
    "room:send_message",
    "room:delete_message",
    "room:invite",
    "room:pin_message",
  ],
  admin: [
    "room:update",
    "room:kick_member",
    "room:send_message",
    "room:delete_message",
    "room:invite",
    "room:pin_message",
  ],
  member: ["room:send_message", "room:invite"],
};

export const MEETING_ROLE_PERMISSIONS: Record<MeetingRole, readonly Permission[]> = {
  host: ["meeting:end", "meeting:mute_all", "meeting:kick_participant", "meeting:share_screen"],
  participant: ["meeting:share_screen"],
};

export const MUSIC_ROLE_PERMISSIONS: Record<MusicRole, readonly Permission[]> = {
  host: ["music:control_playback", "music:manage_queue", "music:toggle_power_to_all"],
  member: ["music:control_playback", "music:manage_queue"],
};

export const COLLABORATOR_ROLE_PERMISSIONS: Record<CollaboratorRole, readonly Permission[]> = {
  editor: ["collab:read", "collab:write", "collab:share"],
  viewer: ["collab:read"],
};

export function getRolePermissions(
  domain: "room" | "meeting" | "music" | "collab",
  role: string,
): readonly Permission[] {
  switch (domain) {
    case "room":
      return ROOM_ROLE_PERMISSIONS[role as RoomRole] ?? [];
    case "meeting":
      return MEETING_ROLE_PERMISSIONS[role as MeetingRole] ?? [];
    case "music":
      return MUSIC_ROLE_PERMISSIONS[role as MusicRole] ?? [];
    case "collab":
      return COLLABORATOR_ROLE_PERMISSIONS[role as CollaboratorRole] ?? [];
  }
}

export function getUserRole<T extends { roles?: Record<string, string> }>(
  resource: T,
  userId: string,
): string | null {
  return resource.roles?.[userId] ?? null;
}

export function hasPermission(
  userPermissions: readonly Permission[],
  required: Permission,
): boolean {
  return userPermissions.includes(required);
}

export function checkResourcePermission<T extends { roles?: Record<string, string> }>(
  resource: T,
  userId: string,
  required: Permission,
  domain: "room" | "meeting" | "music" | "collab",
): boolean {
  const role = getUserRole(resource, userId);
  if (!role) return false;
  const perms = getRolePermissions(domain, role);
  return hasPermission(perms, required);
}
