import type { Server } from "socket.io";
import { verifyToken } from "../services/auth.js";
import { MusicRoom } from "../models/MusicRoom.js";

interface MusicRoomState {
  isPlaying: boolean;
  position: number;
  currentTrackId: string | null;
  powerToAll: boolean;
  lastUpdate: number;
}

const roomStates = new Map<string, MusicRoomState>();

export function musicNamespace(io: Server): void {
  const ns = io.of("/music");

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

    socket.on("music:join", async (data: { roomCode: string }, ack) => {
      try {
        const room = await MusicRoom.findOne({ code: data.roomCode.toUpperCase() }).lean();
        if (!room) { if (ack) ack({ error: "Music room not found" }); return; }

        socket.join(`music:${data.roomCode}`);
        socket.data.roomCode = data.roomCode;

        if (!roomStates.has(data.roomCode)) {
          roomStates.set(data.roomCode, {
            isPlaying: room.isPlaying,
            position: room.position,
            currentTrackId: room.currentTrack?.id ?? null,
            powerToAll: room.powerToAll,
            lastUpdate: Date.now(),
          });
        }

        const state = roomStates.get(data.roomCode)!;
        socket.emit("music:state", { ...state, queue: room.queue, currentTrack: room.currentTrack });

        const sockets = await ns.in(`music:${data.roomCode}`).fetchSockets();
        const memberIds = sockets.map((s: any) => s.data.userId).filter(Boolean);
        ns.to(`music:${data.roomCode}`).emit("music:members", memberIds);

        if (ack) ack({ ok: true });
      } catch (err: any) {
        if (ack) ack({ error: err.message });
      }
    });

    socket.on("music:play", () => {
      const state = roomStates.get(socket.data.roomCode);
      if (!state) return;
      state.isPlaying = true;
      state.lastUpdate = Date.now();
      ns.to(`music:${socket.data.roomCode}`).emit("music:play", { by: userId });
    });

    socket.on("music:pause", () => {
      const state = roomStates.get(socket.data.roomCode);
      if (!state) return;
      state.isPlaying = false;
      state.lastUpdate = Date.now();
      ns.to(`music:${socket.data.roomCode}`).emit("music:pause", { by: userId });
    });

    socket.on("music:seek", (data: { position: number }) => {
      const state = roomStates.get(socket.data.roomCode);
      if (!state) return;
      state.position = data.position;
      state.lastUpdate = Date.now();
      ns.to(`music:${socket.data.roomCode}`).emit("music:seek", { position: data.position, by: userId });
    });

    socket.on("music:skip", async () => {
      try {
        const room = await MusicRoom.findOne({ code: socket.data.roomCode?.toUpperCase() });
        if (!room) return;

        const state = roomStates.get(socket.data.roomCode);
        if (!state) return;

        if (room.queue.length > 0) {
          const next = room.queue.shift()!;
          room.currentTrack = next;
          room.position = 0;
          state.position = 0;
          state.currentTrackId = next.id;
        } else {
          room.currentTrack = null;
          room.isPlaying = false;
          room.position = 0;
          state.isPlaying = false;
          state.currentTrackId = null;
          state.position = 0;
        }
        await room.save();

        ns.to(`music:${socket.data.roomCode}`).emit("music:track-change", {
          currentTrack: room.currentTrack,
          queue: room.queue,
          position: room.position,
        });
      } catch (err) {
        // skip failed
      }
    });

    socket.on("music:queue-update", async () => {
      const room = await MusicRoom.findOne({ code: socket.data.roomCode?.toUpperCase() }).lean();
      if (!room) return;
      ns.to(`music:${socket.data.roomCode}`).emit("music:queue-update", {
        queue: room.queue,
        currentTrack: room.currentTrack,
      });
    });

    socket.on("music:power-to-all", (data: { enabled: boolean }) => {
      const state = roomStates.get(socket.data.roomCode);
      if (!state) return;
      state.powerToAll = data.enabled;
      ns.to(`music:${socket.data.roomCode}`).emit("music:power-to-all", { enabled: data.enabled, by: userId });
    });

    // Drift sync
    socket.on("music:drift", (data: { position: number }) => {
      socket.to(`music:${socket.data.roomCode}`).emit("music:drift", { userId, position: data.position });
    });

    socket.on("disconnect", () => {
      const code = socket.data.roomCode;
      if (code) {
        socket.leave(`music:${code}`);
      }
      // Cleanup empty rooms after timeout
      setTimeout(() => {
        const adapterRooms = ns.adapter?.rooms;
        const room = adapterRooms?.get(`music:${code}`);
        if (!room || room.size === 0) {
          roomStates.delete(code);
        }
      }, 5000);
    });
  });
}
