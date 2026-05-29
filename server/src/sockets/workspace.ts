import type { Server } from "socket.io";
import { verifyToken } from "../services/auth.js";
import { WorkspaceSession } from "../models/WorkspaceSession.js";

interface CursorData {
  x: number;
  y: number;
  target?: string;
}

export function workspaceNamespace(io: Server): void {
  const ns = io.of("/workspace");

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

    socket.on("workspace:join", async (data: { code: string }, ack) => {
      try {
        const session = await WorkspaceSession.findOne({ code: data.code.toUpperCase(), isLive: true }).lean();
        if (!session) { if (ack) ack({ error: "Workspace not found" }); return; }
        if (session.endedAt) { if (ack) ack({ error: "Workspace ended" }); return; }

        socket.join(`workspace:${data.code}`);
        socket.data.sessionCode = data.code;

        const sockets = await ns.in(`workspace:${data.code}`).fetchSockets();
        const memberIds = sockets.map((s: any) => s.data.userId).filter(Boolean);

        socket.emit("workspace:members", memberIds);
        socket.emit("workspace:state", session.sharedState);
        socket.emit("workspace:follow", session.followMode);
        socket.to(`workspace:${data.code}`).emit("workspace:member_joined", userId);

        if (ack) ack({ ok: true, members: memberIds, state: session.sharedState, followMode: session.followMode });
      } catch (err: any) {
        if (ack) ack({ error: err.message });
      }
    });

    socket.on("workspace:leave", () => {
      const code = socket.data.sessionCode;
      if (code) {
        socket.leave(`workspace:${code}`);
        socket.to(`workspace:${code}`).emit("workspace:member_left", userId);
      }
    });

    // URL/route sync
    socket.on("workspace:url", (data: { url: string; route: string }) => {
      const code = socket.data.sessionCode;
      if (code) {
        socket.to(`workspace:${code}`).emit("workspace:url", { userId, url: data.url, route: data.route });
      }
    });

    // Panel state sync
    socket.on("workspace:panel", (data: { panel: string; open: boolean }) => {
      const code = socket.data.sessionCode;
      if (code) {
        socket.to(`workspace:${code}`).emit("workspace:panel", { userId, panel: data.panel, open: data.open });
      }
    });

    // Scroll sync
    socket.on("workspace:scroll", (data: { x: number; y: number }) => {
      const code = socket.data.sessionCode;
      if (code) {
        socket.to(`workspace:${code}`).emit("workspace:scroll", { userId, x: data.x, y: data.y });
      }
    });

    // Cursor presence
    socket.on("workspace:cursor", (data: CursorData) => {
      const code = socket.data.sessionCode;
      if (code) {
        socket.to(`workspace:${code}`).emit("workspace:cursor", { userId, ...data });
      }
    });

    // Presence heartbeat
    socket.on("workspace:presence", (data: { status: "active" | "idle" | "away" }) => {
      const code = socket.data.sessionCode;
      if (code) {
        socket.to(`workspace:${code}`).emit("workspace:presence", { userId, status: data.status, timestamp: Date.now() });
      }
    });

    // Follow mode
    socket.on("workspace:follow", (data: { enabled: boolean }) => {
      const code = socket.data.sessionCode;
      if (code) {
        socket.to(`workspace:${code}`).emit("workspace:follow_mode", { userId, enabled: data.enabled });
      }
    });

    // Shared annotations
    socket.on("workspace:annotation", (data: { type: "add" | "remove"; annotationId: string; content?: string }) => {
      const code = socket.data.sessionCode;
      if (code) {
        socket.to(`workspace:${code}`).emit("workspace:annotation", { userId, ...data });
      }
    });

    // Shared bookmarks
    socket.on("workspace:bookmark", (data: { type: "add" | "remove"; bookmarkId: string; title?: string; url?: string }) => {
      const code = socket.data.sessionCode;
      if (code) {
        socket.to(`workspace:${code}`).emit("workspace:bookmark", { userId, ...data });
      }
    });

    // General workspace event (extension-ready protocol)
    socket.on("workspace:event", (data: { event: string; payload: Record<string, unknown> }) => {
      const code = socket.data.sessionCode;
      if (code) {
        socket.to(`workspace:${code}`).emit("workspace:event", { userId, event: data.event, payload: data.payload });
      }
    });

    socket.on("disconnect", () => {
      const code = socket.data.sessionCode;
      if (code) {
        socket.to(`workspace:${code}`).emit("workspace:member_left", userId);
      }
    });
  });
}
