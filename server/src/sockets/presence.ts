import type { RoomRole } from "../permissions/types.js";

export interface PresenceEntry {
  userId: string;
  online: boolean;
  roomIds: Set<string>;
}

class PresenceTracker {
  private online = new Map<string, Set<string>>();

  add(userId: string, roomId: string): void {
    if (!this.online.has(userId)) this.online.set(userId, new Set());
    this.online.get(userId)!.add(roomId);
  }

  remove(userId: string, roomId: string): void {
    this.online.get(userId)?.delete(roomId);
    if (this.online.get(userId)?.size === 0) this.online.delete(userId);
  }

  removeUser(userId: string): void {
    this.online.delete(userId);
  }

  getOnlineUserIds(roomId: string): string[] {
    const result: string[] = [];
    for (const [userId, rooms] of this.online) {
      if (rooms.has(roomId)) result.push(userId);
    }
    return result;
  }

  isOnline(userId: string): boolean {
    return this.online.has(userId);
  }

  getUserRooms(userId: string): string[] {
    return Array.from(this.online.get(userId) ?? []);
  }
}

export const presenceTracker = new PresenceTracker();
