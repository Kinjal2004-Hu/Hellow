import type { Permission } from "./types.js";
import { getRolePermissions } from "./roles.js";

export function getUserRole<T extends Record<string, Record<string, string>>>(
  resource: T,
  userId: string,
  field: string = "roles",
): string | null {
  return resource[field]?.[userId] ?? null;
}

export function hasPermission(
  userPermissions: readonly Permission[],
  required: Permission,
): boolean {
  return userPermissions.includes(required);
}

export function checkResourcePermission(
  resource: any,
  userId: string,
  required: Permission,
  domain: "room" | "meeting" | "music" | "collab" | "workspace",
  field: string = "roles",
): boolean {
  const role = getUserRole(resource, userId, field);
  if (!role) return false;
  const perms = getRolePermissions(domain, role);
  return hasPermission(perms, required);
}

export function getOwners(
  resource: any,
  ownerRoles: string[] = ["owner", "host"],
  field: string = "roles",
): string[] {
  return Object.entries(resource[field] ?? {})
    .filter(([, role]) => ownerRoles.includes(role as string))
    .map(([userId]) => userId);
}

export function getUsersByRole(
  resource: any,
  targetRole: string,
  field: string = "roles",
): string[] {
  return Object.entries(resource[field] ?? {})
    .filter(([, role]) => role === targetRole)
    .map(([userId]) => userId);
}

export function getAdmins(resource: any, field: string = "roles"): string[] {
  return getUsersByRole(resource, "admin", field);
}
