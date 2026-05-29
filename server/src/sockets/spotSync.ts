import type { Server } from "socket.io";
import { verifyToken } from "../services/auth.js";
import { SpotSession } from "../models/SpotSession.js";
import { User } from "../models/User.js";

interface LocationData {
  lat: number;
  lng: number;
}

interface PinData {
  lat: number;
  lng: number;
  label: string;
  description: string;
  imageUrl: string | null;
}

interface ChatData {
  content: string;
}

export function spotSyncNamespace(io: Server): void {
  const ns = io.of("/spotsync");

  ns.use((socket, next) => {
    const token = socket.handshake.auth.token ?? socket.handshake.query.token;
    if (!token || typeof token !== "string") return next(new Error("Auth token required"));
    const payload = verifyToken(token);
    if (!payload) return next(new Error("Invalid token"));
    (socket as any).userId = payload.userId;
    next();
  });

  ns.on("connection", async (socket) => {
    const userId = (socket as any).userId as string;
    socket.data.userId = userId;

    socket.on("spotsync:join", async (data: { code: string }, ack) => {
      try {
        const session = await SpotSession.findOne({ code: data.code.toUpperCase(), isLive: true }).lean();
        if (!session) { if (ack) ack({ error: "Session not found" }); return; }
        if (session.endedAt) { if (ack) ack({ error: "Session ended" }); return; }

        socket.join(`spotsync:${data.code}`);
        socket.data.sessionCode = data.code;

        const sockets = await ns.in(`spotsync:${data.code}`).fetchSockets();
        const memberIds = sockets.map((s: any) => s.data.userId).filter(Boolean);

        socket.emit("spotsync:members", memberIds);
        socket.to(`spotsync:${data.code}`).emit("spotsync:member_joined", userId);

        if (ack) ack({ ok: true, members: memberIds, pins: session.pins, messages: session.messages ?? [] });
      } catch (err: any) {
        if (ack) ack({ error: err.message });
      }
    });

    socket.on("spotsync:leave", () => {
      const code = socket.data.sessionCode;
      if (code) {
        socket.leave(`spotsync:${code}`);
        socket.to(`spotsync:${code}`).emit("spotsync:member_left", userId);
      }
    });

    socket.on("spotsync:location", (data: LocationData) => {
      const code = socket.data.sessionCode;
      if (code) {
        socket.to(`spotsync:${code}`).emit("spotsync:location", {
          userId,
          lat: data.lat,
          lng: data.lng,
          timestamp: new Date().toISOString(),
        });
      }
    });

    socket.on("spotsync:pin", (data: PinData) => {
      const code = socket.data.sessionCode;
      if (code) {
        const pin = {
          ...data,
          createdBy: userId,
          createdAt: new Date().toISOString(),
        };
        ns.to(`spotsync:${code}`).emit("spotsync:pin", pin);
      }
    });

    socket.on("spotsync:route", (data: { waypoints: { lat: number; lng: number }[] }) => {
      const code = socket.data.sessionCode;
      if (code) {
        socket.to(`spotsync:${code}`).emit("spotsync:route", { userId, waypoints: data.waypoints });
      }
    });

    socket.on("spotsync:chat", async (data: ChatData, ack?: (payload: any) => void) => {
      try {
        const code = socket.data.sessionCode as string | undefined;
        const content = String(data?.content ?? "").trim();
        if (!code || !content) {
          if (ack) ack({ error: "Invalid message" });
          return;
        }

        const session = await SpotSession.findOne({ code: code.toUpperCase(), isLive: true });
        if (!session) {
          if (ack) ack({ error: "Session not found" });
          return;
        }

        const user = await User.findById(userId).select("username").lean();
        const message = {
          senderId: userId,
          senderName: user?.username ?? "User",
          content,
          createdAt: new Date().toISOString(),
        };

        session.messages.push({
          senderId: message.senderId,
          senderName: message.senderName,
          content: message.content,
          createdAt: new Date(message.createdAt),
        } as any);
        if (session.messages.length > 500) {
          session.messages = session.messages.slice(-500) as any;
        }
        await session.save();

        ns.to(`spotsync:${code}`).emit("spotsync:chat", message);
        if (ack) ack({ ok: true, message });
      } catch (err: any) {
        if (ack) ack({ error: err.message ?? "Failed to send message" });
      }
    });

    socket.on("disconnect", () => {
      const code = socket.data.sessionCode;
      if (code) {
        socket.to(`spotsync:${code}`).emit("spotsync:member_left", userId);
      }
    });
  });
}
