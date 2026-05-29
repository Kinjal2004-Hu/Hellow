export type {
  Permission,
  RoomRole,
  MeetingRole,
  MusicRole,
  CollaboratorRole,
  WorkspaceRole,
  RolePermissionMap,
  ResourceDomain,
} from "./types.js";

export {
  ROOM_ROLE_PERMISSIONS,
  MEETING_ROLE_PERMISSIONS,
  MUSIC_ROLE_PERMISSIONS,
  COLLABORATOR_ROLE_PERMISSIONS,
  WORKSPACE_ROLE_PERMISSIONS,
  getRolePermissions,
} from "./roles.js";

export {
  getUserRole,
  hasPermission,
  checkResourcePermission,
  getOwners,
  getUsersByRole,
  getAdmins,
} from "./service.js";

export {
  requirePermission,
  requireRoomPermission,
  requireMeetingPermission,
  requireMusicPermission,
  requireNotePermission,
  requireTaskPermission,
  requireEventPermission,
  requireWorkspacePermission,
} from "./middleware.js";
