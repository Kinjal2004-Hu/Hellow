import type { Server } from "socket.io";
import { verifyToken } from "../services/auth.js";
import { Meeting } from "../models/Meeting.js";

interface PeerSignal {
  to: string;
  signal: any;
}

export function meetingNamespace(io: Server): void {
  const ns = io.of("/meetings");

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

    socket.on(
      "meeting:join",
      async (data: { code: string }, ack) => {
        try {
          const meeting = await Meeting.findOne({ code: data.code.toUpperCase() }).lean();
          if (!meeting) { if (ack) ack({ error: "Meeting not found" }); return; }
          if (meeting.endedAt) { if (ack) ack({ error: "Meeting ended" }); return; }

          socket.join(`meeting:${data.code}`);
          socket.data.meetingCode = data.code;

          const sockets = await ns.in(`meeting:${data.code}`).fetchSockets();
          const participantIds = sockets.map((s: any) => s.data.userId).filter(Boolean);

          socket.emit("meeting:participants", participantIds);
          socket.to(`meeting:${data.code}`).emit("meeting:participant_joined", userId);

          if (ack) ack({ ok: true, participants: participantIds });
        } catch (err: any) {
          if (ack) ack({ error: err.message });
        }
      },
    );

    socket.on("meeting:leave", () => {
      const code = socket.data.meetingCode;
      if (code) {
        socket.leave(`meeting:${code}`);
        socket.to(`meeting:${code}`).emit("meeting:participant_left", userId);
      }
    });

    // WebRTC signaling
    socket.on("signal:offer", (data: PeerSignal) => {
      socket.to(`meeting:${socket.data.meetingCode}`).emit("signal:offer", { from: userId, signal: data.signal });
    });

    socket.on("signal:answer", (data: PeerSignal) => {
      socket.to(`meeting:${socket.data.meetingCode}`).emit("signal:answer", { from: userId, signal: data.signal });
    });

    socket.on("signal:ice-candidate", (data: PeerSignal) => {
      socket.to(`meeting:${socket.data.meetingCode}`).emit("signal:ice-candidate", { from: userId, candidate: data.signal });
    });

    // Media state
    socket.on("meeting:media-state", (data: { mic: boolean; camera: boolean }) => {
      socket.to(`meeting:${socket.data.meetingCode}`).emit("meeting:media-state", { userId, mic: data.mic, camera: data.camera });
    });

    socket.on("meeting:speaking", (data: { speaking: boolean }) => {
      socket.to(`meeting:${socket.data.meetingCode}`).emit("meeting:speaking", { userId, speaking: data.speaking });
    });

    // Meeting chat
    socket.on("meeting:chat", (data: { content: string }) => {
      ns.to(`meeting:${socket.data.meetingCode}`).emit("meeting:chat", {
        userId,
        content: data.content,
        timestamp: new Date().toISOString(),
      });
    });

    // Screen share
    socket.on("meeting:screen-share", (data: { sharing: boolean }) => {
      socket.to(`meeting:${socket.data.meetingCode}`).emit("meeting:screen-share", { userId, sharing: data.sharing });
    });

    // Mute all (host only)
    socket.on("meeting:mute-all", () => {
      socket.to(`meeting:${socket.data.meetingCode}`).emit("meeting:mute-all");
    });

    socket.on("disconnect", () => {
      const code = socket.data.meetingCode;
      if (code) {
        socket.to(`meeting:${code}`).emit("meeting:participant_left", userId);
      }
    });
  });
}
