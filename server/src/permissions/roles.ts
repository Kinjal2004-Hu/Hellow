import type {
  Permission,
  RoomRole,
  MeetingRole,
  MusicRole,
  CollaboratorRole,
  WorkspaceRole,
  RolePermissionMap,
} from "./types.js";

export const ROOM_ROLE_PERMISSIONS: RolePermissionMap<RoomRole> = {
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

export const MEETING_ROLE_PERMISSIONS: RolePermissionMap<MeetingRole> = {
  host: [
    "meeting:end",
    "meeting:mute_all",
    "meeting:kick_participant",
    "meeting:share_screen",
  ],
  participant: ["meeting:share_screen"],
};

export const MUSIC_ROLE_PERMISSIONS: RolePermissionMap<MusicRole> = {
  host: ["music:control_playback", "music:manage_queue", "music:toggle_power_to_all"],
  member: ["music:control_playback", "music:manage_queue"],
};

export const COLLABORATOR_ROLE_PERMISSIONS: RolePermissionMap<CollaboratorRole> = {
  editor: ["collab:read", "collab:write", "collab:share"],
  viewer: ["collab:read"],
};

export const WORKSPACE_ROLE_PERMISSIONS: RolePermissionMap<WorkspaceRole> = {
  host: [
    "workspace:update_state",
    "workspace:manage_members",
    "workspace:end_session",
    "workspace:share",
    "workspace:annotate",
  ],
  member: [
    "workspace:update_state",
    "workspace:share",
    "workspace:annotate",
  ],
};

export function getRolePermissions(
  domain: "room" | "meeting" | "music" | "collab" | "workspace",
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
    case "workspace":
      return WORKSPACE_ROLE_PERMISSIONS[role as WorkspaceRole] ?? [];
  }
}
