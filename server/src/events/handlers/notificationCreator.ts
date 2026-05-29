import type { Server } from "socket.io";
import { on } from "../emitter.js";
import { createNotification, getUnreadCount } from "../../notifications/service.js";
import { emitNotification, emitUnreadCount } from "../../notifications/socket.js";
import { Room } from "../../models/Room.js";

const ROOM_PREVIEW_MAX = 80;

export function registerNotificationCreator(io: Server): void {
  on("message:sent", async (payload) => {
    const room = await Room.findById(payload.roomId).lean();
    if (!room) return;

    const preview = payload.content.length > ROOM_PREVIEW_MAX
      ? payload.content.slice(0, ROOM_PREVIEW_MAX) + "…"
      : payload.content;

    for (const [memberId, role] of Object.entries(room.roles)) {
      if (memberId === payload.senderId || !role) continue;

      const notif = await createNotification({
        userId: memberId,
        type: "message:new",
        title: room.name,
        body: `${payload.senderName}: ${preview}`,
        data: {
          roomId: payload.roomId,
          messageId: payload.messageId,
          senderId: payload.senderId,
          senderName: payload.senderName,
          preview,
        },
      });

      emitNotification(io, memberId, notif);
      const count = await getUnreadCount(memberId);
      emitUnreadCount(io, memberId, count);
    }
  }, "notif:message:sent");

  on("room:member_joined", async (payload) => {
    const room = await Room.findById(payload.roomId).lean();
    if (!room) return;

    const notif = await createNotification({
      userId: payload.userId,
      type: "room:role_changed",
      title: `Joined ${room.name}`,
      body: `You were added as ${payload.role}`,
      data: { roomId: payload.roomId, role: payload.role },
    });

    emitNotification(io, payload.userId, notif);
  }, "notif:room:member_joined");
}
