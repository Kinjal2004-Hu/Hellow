import { Server as HTTPServer } from "http";
import { Server } from "socket.io";
import { verifyToken } from "../services/auth.js";
import { env } from "../config/env.js";
import { getAllowedOrigins } from "../config/cors.js";
import { chatNamespace } from "./chat.js";
import { notificationNamespace } from "../notifications/socket.js";
import { meetingNamespace } from "./meetings.js";
import { youtubeNamespace } from "./youtube.js";
import { musicNamespace } from "./music.js";
import { spotSyncNamespace } from "./spotSync.js";
import { workspaceNamespace } from "./workspace.js";

export function createSocketServer(httpServer: HTTPServer): Server {
  const io = new Server(httpServer, {
    cors: { origin: getAllowedOrigins(), credentials: true },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token ?? socket.handshake.query.token;
    if (!token || typeof token !== "string") return next(new Error("Auth token required"));
    const payload = verifyToken(token);
    if (!payload) return next(new Error("Invalid token"));
    (socket as any).userId = payload.userId;
    next();
  });

  io.on("connection", (socket) => {
    const userId = (socket as any).userId as string;
    socket.join(`user:${userId}`);

    socket.on("spot:sync", (data) => {
      socket.broadcast.to(`spot:${data.roomId}`).emit("spot:sync", data);
    });
    socket.on("disconnect", () => {});
  });

  chatNamespace(io);
  notificationNamespace(io);
  meetingNamespace(io);
  youtubeNamespace(io);
  musicNamespace(io);
  spotSyncNamespace(io);
  workspaceNamespace(io);

  return io;
}
