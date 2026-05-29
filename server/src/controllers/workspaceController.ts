import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.js";
import { WorkspaceSession } from "../models/WorkspaceSession.js";
import { emit } from "../events/index.js";

function generateCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export async function createSession(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { name } = req.body;
    let code = generateCode();
    while (await WorkspaceSession.findOne({ code })) code = generateCode();

    const session = await WorkspaceSession.create({
      code,
      name: name || "Workspace",
      hostId: req.userId!,
      members: [req.userId!],
      roles: { [req.userId!]: "host" },
    });

    emit("workspace:created" as any, { sessionCode: code, hostId: req.userId!, name: session.name } as any);
    res.status(201).json(session);
  } catch (err) {
    res.status(500).json({ error: "Failed to create workspace" });
  }
}

export async function getSession(req: AuthRequest, res: Response): Promise<void> {
  try {
    const code = (req.params.code as string)?.toUpperCase();
    const session = await WorkspaceSession.findOne({ code, isLive: true });
    if (!session) { res.status(404).json({ error: "Workspace not found" }); return; }
    res.json(session);
  } catch (err) {
    res.status(500).json({ error: "Failed to get workspace" });
  }
}

export async function listSessions(_req: AuthRequest, res: Response): Promise<void> {
  try {
    const sessions = await WorkspaceSession.find({ isLive: true })
      .sort({ createdAt: -1 }).limit(50).lean();
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: "Failed to list workspaces" });
  }
}

export async function joinSession(req: AuthRequest, res: Response): Promise<void> {
  try {
    const code = (req.params.code as string)?.toUpperCase();
    const session = await WorkspaceSession.findOne({ code, isLive: true });
    if (!session) { res.status(404).json({ error: "Workspace not found" }); return; }
    if (session.endedAt) { res.status(410).json({ error: "Workspace ended" }); return; }

    if (!session.roles[req.userId!]) {
      session.roles[req.userId!] = "member";
    }
    if (!session.members.some((m) => m.toString() === req.userId!)) {
      session.members.push(req.userId! as any);
    }
    await session.save();

    emit("workspace:joined" as any, { sessionCode: session.code, userId: req.userId! } as any);
    res.json(session);
  } catch (err) {
    res.status(500).json({ error: "Failed to join workspace" });
  }
}

export async function leaveSession(req: AuthRequest, res: Response): Promise<void> {
  try {
    const code = (req.params.code as string)?.toUpperCase();
    const session = await WorkspaceSession.findOne({ code });
    if (!session) { res.status(404).json({ error: "Workspace not found" }); return; }

    delete session.roles[req.userId!];
    session.members = session.members.filter((m) => m.toString() !== req.userId!);
    await session.save();

    if (session.members.length === 0) {
      session.isLive = false;
      session.endedAt = new Date();
      await session.save();
      emit("workspace:ended" as any, { sessionCode: code, hostId: req.userId! } as any);
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to leave workspace" });
  }
}

export async function updateSharedState(req: AuthRequest, res: Response): Promise<void> {
  try {
    const code = (req.params.code as string)?.toUpperCase();
    const { sharedState } = req.body;
    if (!sharedState) { res.status(400).json({ error: "sharedState required" }); return; }

    const session = await WorkspaceSession.findOne({ code, isLive: true });
    if (!session) { res.status(404).json({ error: "Workspace not found" }); return; }

    if (sharedState.currentUrl !== undefined) session.sharedState.currentUrl = sharedState.currentUrl;
    if (sharedState.currentRoute !== undefined) session.sharedState.currentRoute = sharedState.currentRoute;
    if (sharedState.panels !== undefined) session.sharedState.panels = sharedState.panels;
    if (sharedState.scrollPosition !== undefined) session.sharedState.scrollPosition = sharedState.scrollPosition;
    if (sharedState.activeAnnotations !== undefined) session.sharedState.activeAnnotations = sharedState.activeAnnotations;
    if (sharedState.activeBookmarks !== undefined) session.sharedState.activeBookmarks = sharedState.activeBookmarks;

    await session.save();

    emit("workspace:state_updated" as any, { sessionCode: code, userId: req.userId!, sharedState: session.sharedState } as any);
    res.json(session.sharedState);
  } catch (err) {
    res.status(500).json({ error: "Failed to update state" });
  }
}

export async function setFollowMode(req: AuthRequest, res: Response): Promise<void> {
  try {
    const code = (req.params.code as string)?.toUpperCase();
    const { followMode } = req.body;
    if (typeof followMode !== "boolean") { res.status(400).json({ error: "followMode boolean required" }); return; }

    const session = await WorkspaceSession.findOne({ code, isLive: true });
    if (!session) { res.status(404).json({ error: "Workspace not found" }); return; }

    session.followMode = followMode;
    await session.save();

    emit("workspace:follow_changed" as any, { sessionCode: code, userId: req.userId!, followMode } as any);
    res.json({ followMode });
  } catch (err) {
    res.status(500).json({ error: "Failed to set follow mode" });
  }
}

export async function endSession(req: AuthRequest, res: Response): Promise<void> {
  try {
    const code = (req.params.code as string)?.toUpperCase();
    const session = await WorkspaceSession.findOne({ code, hostId: req.userId! });
    if (!session) { res.status(404).json({ error: "Workspace not found or not host" }); return; }

    session.isLive = false;
    session.endedAt = new Date();
    await session.save();

    emit("workspace:ended" as any, { sessionCode: code, hostId: req.userId! } as any);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to end workspace" });
  }
}
