import type { Server } from "socket.io";
import { verifyToken } from "../services/auth.js";

export function notificationNamespace(io: Server): void {
  const ns = io.of("/notifications");

  ns.use((socket, next) => {
    const token = socket.handshake.auth.token ?? socket.handshake.query.token;
    if (!token || typeof token !== "string") return next(new Error("Auth token required"));
    const payload = verifyToken(token);
    if (!payload) return next(new Error("Invalid token"));
    (socket as any).userId = payload.userId;
    next();
  });

  ns.on("connection", (socket) => {
    const userId = (socket as any).userId as string;
    socket.join(`notifications:${userId}`);
    socket.data.userId = userId;

    socket.on("disconnect", () => {});
  });
}

export function emitNotification(
  io: Server,
  userId: string,
  notification: {
    _id: string;
    type: string;
    category: string;
    title: string;
    body: string;
    data: Record<string, unknown>;
    groupKey: string | null;
    createdAt: Date;
  },
): void {
  io.of("/notifications").to(`notifications:${userId}`).emit("notification:new", notification);
}

export function emitUnreadCount(
  io: Server,
  userId: string,
  count: number,
): void {
  io.of("/notifications").to(`notifications:${userId}`).emit("notification:unread", { count });
}
