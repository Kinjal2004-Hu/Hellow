import type { Server } from "socket.io";
import { verifyToken } from "../services/auth.js";

interface PlaybackState {
  videoId: string;
  isPlaying: boolean;
  currentTime: number;
  playbackRate: number;
  hostId: string;
  lastUpdate: number;
}

const rooms = new Map<string, PlaybackState>();

export function youtubeNamespace(io: Server): void {
  const ns = io.of("/youtube");

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
    socket.data.userId = userId;

    socket.on("youtube:join", (data: { roomCode: string }, ack) => {
      socket.join(`yt:${data.roomCode}`);
      socket.data.roomCode = data.roomCode;

      if (!rooms.has(data.roomCode)) {
        rooms.set(data.roomCode, {
          videoId: "",
          isPlaying: false,
          currentTime: 0,
          playbackRate: 1,
          hostId: userId,
          lastUpdate: Date.now(),
        });
      }

      const state = rooms.get(data.roomCode)!;
      socket.emit("youtube:state", state);

      const sockets = ns.adapter?.rooms?.get(`yt:${data.roomCode}`);
      const count = sockets?.size ?? 1;
      ns.to(`yt:${data.roomCode}`).emit("youtube:participant_count", count);

      if (ack) ack({ ok: true, state });
    });

    socket.on("youtube:leave", () => {
      const code = socket.data.roomCode;
      if (code) {
        socket.leave(`yt:${code}`);
        const sockets = ns.adapter?.rooms?.get(`yt:${code}`);
        const count = sockets?.size ?? 0;
        ns.to(`yt:${code}`).emit("youtube:participant_count", count);
      }
    });

    // Host commands
    socket.on("youtube:play", (data: { videoId?: string; currentTime?: number }) => {
      const state = rooms.get(socket.data.roomCode);
      if (!state) return;
      state.isPlaying = true;
      if (data.videoId) state.videoId = data.videoId;
      if (data.currentTime !== undefined) state.currentTime = data.currentTime;
      state.hostId = userId;
      state.lastUpdate = Date.now();
      ns.to(`yt:${socket.data.roomCode}`).emit("youtube:play", { ...state, by: userId });
    });

    socket.on("youtube:pause", (data: { currentTime: number }) => {
      const state = rooms.get(socket.data.roomCode);
      if (!state) return;
      state.isPlaying = false;
      state.currentTime = data.currentTime;
      state.lastUpdate = Date.now();
      ns.to(`yt:${socket.data.roomCode}`).emit("youtube:pause", { currentTime: data.currentTime, by: userId });
    });

    socket.on("youtube:seek", (data: { currentTime: number }) => {
      const state = rooms.get(socket.data.roomCode);
      if (!state) return;
      state.currentTime = data.currentTime;
      state.lastUpdate = Date.now();
      ns.to(`yt:${socket.data.roomCode}`).emit("youtube:seek", { currentTime: data.currentTime, by: userId });
    });

    socket.on("youtube:rate", (data: { playbackRate: number }) => {
      const state = rooms.get(socket.data.roomCode);
      if (!state) return;
      state.playbackRate = data.playbackRate;
      state.lastUpdate = Date.now();
      ns.to(`yt:${socket.data.roomCode}`).emit("youtube:rate", { playbackRate: data.playbackRate, by: userId });
    });

    // Drift correction: followers periodically broadcast their position
    socket.on("youtube:drift", (data: { currentTime: number }) => {
      socket.to(`yt:${socket.data.roomCode}`).emit("youtube:drift", { userId, currentTime: data.currentTime });
    });

    // Power To All: anyone can control playback
    socket.on("youtube:power-to-all", (data: { enabled: boolean }) => {
      ns.to(`yt:${socket.data.roomCode}`).emit("youtube:power-to-all", { enabled: data.enabled });
    });

    socket.on("youtube:load-video", (data: { videoId: string }) => {
      const state = rooms.get(socket.data.roomCode);
      if (!state) return;
      state.videoId = data.videoId;
      state.currentTime = 0;
      state.isPlaying = false;
      state.lastUpdate = Date.now();
      ns.to(`yt:${socket.data.roomCode}`).emit("youtube:load-video", { videoId: data.videoId, by: userId });
    });

    socket.on("disconnect", () => {
      const code = socket.data.roomCode;
      if (code) {
        socket.leave(`yt:${code}`);
        const adapterRooms = ns.adapter?.rooms;
        const socketsInRoom = adapterRooms?.get(`yt:${code}`);
        const count = socketsInRoom?.size ?? 0;
        ns.to(`yt:${code}`).emit("youtube:participant_count", count);
        if (count === 0) rooms.delete(code);
      }
    });
  });
}
