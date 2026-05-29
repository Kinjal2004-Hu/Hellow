import type { Server } from "socket.io";
import { Message } from "../models/Message.js";
import { Room } from "../models/Room.js";
import { User } from "../models/User.js";
import { presenceTracker } from "./presence.js";
import { verifyToken } from "../services/auth.js";
import { emit } from "../events/index.js";

const TYPING_TIMEOUT = 3000;

export function chatNamespace(io: Server): void {
  const chat = io.of("/chat");

  chat.use((socket, next) => {
    const token = socket.handshake.auth.token ?? socket.handshake.query.token;
    if (!token || typeof token !== "string") return next(new Error("Auth token required"));
    const payload = verifyToken(token);
    if (!payload) return next(new Error("Invalid token"));
    (socket as any).userId = payload.userId;
    next();
  });

  chat.on("connection", async (socket) => {
    const userId = (socket as any).userId as string;

    socket.join(`user:${userId}`);
    socket.data.userId = userId;

    const userRooms = await Room.find({ [`roles.${userId}`]: { $exists: true } }).lean();
    for (const room of userRooms) {
      socket.join(`room:${room._id.toString()}`);
      presenceTracker.add(userId, room._id.toString());
    }

    const onlineInRooms = new Set<string>();
    for (const room of userRooms) {
      for (const uid of presenceTracker.getOnlineUserIds(room._id.toString())) {
        onlineInRooms.add(uid);
      }
    }
    for (const room of userRooms) {
      socket.emit("chat:presence", {
        roomId: room._id.toString(),
        userIds: presenceTracker.getOnlineUserIds(room._id.toString()),
      });
    }

    socket.on("chat:join_room", async (data: { roomId: string }, ack) => {
      socket.join(`room:${data.roomId}`);
      presenceTracker.add(userId, data.roomId);
      chat.to(`room:${data.roomId}`).emit("chat:presence", {
        roomId: data.roomId,
        userIds: presenceTracker.getOnlineUserIds(data.roomId),
      });
      if (ack) ack({ ok: true });
    });

    socket.on("chat:leave_room", (data: { roomId: string }) => {
      socket.leave(`room:${data.roomId}`);
      presenceTracker.remove(userId, data.roomId);
      chat.to(`room:${data.roomId}`).emit("chat:presence", {
        roomId: data.roomId,
        userIds: presenceTracker.getOnlineUserIds(data.roomId),
      });
    });

    socket.on(
      "chat:send",
      async (
        data: { roomId: string; content: string; tempId: string },
        ack,
      ) => {
        if (!data.content?.trim()) {
          if (ack) ack({ error: "Content required" });
          return;
        }

        try {
          const msg = await Message.create({
            roomId: data.roomId,
            senderId: userId,
            content: data.content.trim(),
            tempId: data.tempId ?? null,
          });

          const user = await User.findById(userId).select("username email").lean();
          const payload = {
            _id: msg._id.toString(),
            roomId: data.roomId,
            senderId: userId,
            senderName: user?.username ?? "Unknown",
            content: data.content.trim(),
            tempId: data.tempId ?? null,
            createdAt: msg.createdAt.toISOString(),
          };

          chat.to(`room:${data.roomId}`).emit("chat:message", payload);

          emit("message:sent", {
            messageId: msg._id.toString(),
            roomId: data.roomId,
            senderId: userId,
            senderName: user?.username ?? "Unknown",
            content: data.content.trim(),
            tempId: data.tempId ?? null,
          });

          if (ack) ack({ ok: true, message: payload });
        } catch (err: any) {
          if (ack) ack({ error: err.message ?? "Failed to send" });
        }
      },
    );

    socket.on("chat:read", async (data: { roomId: string }) => {
      await Room.findByIdAndUpdate(data.roomId, {
        $set: { [`lastReadAt.${userId}`]: new Date() },
      });
    });

    socket.on(
      "chat:typing",
      (data: { roomId: string; isTyping: boolean }) => {
        socket
          .to(`room:${data.roomId}`)
          .emit("chat:typing", { roomId: data.roomId, userId, isTyping: data.isTyping });
      },
    );

    socket.on("disconnect", () => {
      const userRoomsIds = presenceTracker.getUserRooms(userId);
      presenceTracker.removeUser(userId);
      for (const roomId of userRoomsIds) {
        chat.to(`room:${roomId}`).emit("chat:presence", {
          roomId,
          userIds: presenceTracker.getOnlineUserIds(roomId),
        });
      }
    });
  });
}
