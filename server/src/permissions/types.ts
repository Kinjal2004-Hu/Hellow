// ─── Domain Roles ───

export type RoomRole = "owner" | "admin" | "member";
export type MeetingRole = "host" | "participant";
export type MusicRole = "host" | "member";
export type CollaboratorRole = "editor" | "viewer";
export type WorkspaceRole = "host" | "member";

// ─── Granular Permissions ───

export type Permission =
  // Room
  | "room:delete"
  | "room:update"
  | "room:kick_member"
  | "room:promote_member"
  | "room:demote_member"
  | "room:send_message"
  | "room:delete_message"
  | "room:invite"
  | "room:pin_message"
  // Meeting
  | "meeting:end"
  | "meeting:mute_all"
  | "meeting:kick_participant"
  | "meeting:share_screen"
  // Music
  | "music:control_playback"
  | "music:manage_queue"
  | "music:toggle_power_to_all"
  // Workspace
  | "workspace:update_state"
  | "workspace:manage_members"
  | "workspace:end_session"
  | "workspace:share"
  | "workspace:annotate"
  // Collaboration (shared resources)
  | "collab:read"
  | "collab:write"
  | "collab:delete"
  | "collab:share"
  // Moderation (future)
  | "mod:mute"
  | "mod:warn"
  | "mod:ban"
  | "mod:suspend"
  | "mod:view_reports";

// ─── Role-permission record type ───

export type RolePermissionMap<T extends string> = Record<T, readonly Permission[]>;

// ─── Resource union for generic middleware ───

export type ResourceDomain = "room" | "meeting" | "music" | "note" | "task" | "calendar" | "workspace";
