import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.js";
import { SpotSession } from "../models/SpotSession.js";
import { User } from "../models/User.js";
import { emit } from "../events/index.js";

function generateCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export async function createSession(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { name } = req.body;
    let code = generateCode();
    while (await SpotSession.findOne({ code })) code = generateCode();

    const session = await SpotSession.create({
      code,
      name: name || "Map session",
      hostId: req.userId!,
      members: [req.userId!],
    });

    emit("spotsync:created" as any, { sessionCode: code, hostId: req.userId!, name: session.name } as any);
    res.status(201).json(session);
  } catch (err) {
    res.status(500).json({ error: "Failed to create session" });
  }
}

export async function getSession(req: AuthRequest, res: Response): Promise<void> {
  try {
    const code = (req.params.code as string)?.toUpperCase();
    const session = await SpotSession.findOne({ code, isLive: true });
    if (!session) { res.status(404).json({ error: "Session not found" }); return; }
    res.json(session);
  } catch (err) {
    res.status(500).json({ error: "Failed to get session" });
  }
}

export async function listSessions(_req: AuthRequest, res: Response): Promise<void> {
  try {
    const sessions = await SpotSession.find({ isLive: true })
      .sort({ createdAt: -1 }).limit(50).lean();
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: "Failed to list sessions" });
  }
}

export async function joinSession(req: AuthRequest, res: Response): Promise<void> {
  try {
    const code = (req.params.code as string)?.toUpperCase();
    const session = await SpotSession.findOne({ code, isLive: true });
    if (!session) { res.status(404).json({ error: "Session not found" }); return; }
    if (session.endedAt) { res.status(410).json({ error: "Session ended" }); return; }

    if (!session.members.some((m) => m.toString() === req.userId!)) {
      session.members.push(req.userId! as any);
      await session.save();
    }

    emit("spotsync:joined" as any, { sessionCode: session.code, userId: req.userId! } as any);
    res.json(session);
  } catch (err) {
    res.status(500).json({ error: "Failed to join session" });
  }
}

export async function leaveSession(req: AuthRequest, res: Response): Promise<void> {
  try {
    const code = (req.params.code as string)?.toUpperCase();
    const session = await SpotSession.findOne({ code });
    if (!session) { res.status(404).json({ error: "Session not found" }); return; }

    session.members = session.members.filter((m) => m.toString() !== req.userId!);
    await session.save();

    if (session.members.length === 0) {
      session.isLive = false;
      session.endedAt = new Date();
      await session.save();
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to leave session" });
  }
}

export async function addPin(req: AuthRequest, res: Response): Promise<void> {
  try {
    const code = (req.params.code as string)?.toUpperCase();
    const { lat, lng, label, description, imageUrl } = req.body;

    if (lat === undefined || lng === undefined) {
      res.status(400).json({ error: "Latitude and longitude required" });
      return;
    }

    const session = await SpotSession.findOne({ code, isLive: true });
    if (!session) { res.status(404).json({ error: "Session not found" }); return; }

    const pin = {
      lat,
      lng,
      label: label || "",
      description: description || "",
      imageUrl: imageUrl || null,
      createdBy: req.userId!,
      createdAt: new Date(),
    };

    session.pins.push(pin);
    await session.save();

    emit("spotsync:pin_added" as any, { sessionCode: code, pin } as any);
    res.status(201).json(pin);
  } catch (err) {
    res.status(500).json({ error: "Failed to add pin" });
  }
}

export async function getMessages(req: AuthRequest, res: Response): Promise<void> {
  try {
    const code = (req.params.code as string)?.toUpperCase();
    const session = await SpotSession.findOne({ code, isLive: true }).lean();
    if (!session) { res.status(404).json({ error: "Session not found" }); return; }

    res.json(session.messages ?? []);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch messages" });
  }
}

export async function addMessage(req: AuthRequest, res: Response): Promise<void> {
  try {
    const code = (req.params.code as string)?.toUpperCase();
    const content = String(req.body?.content ?? "").trim();
    if (!content) { res.status(400).json({ error: "Message content required" }); return; }

    const session = await SpotSession.findOne({ code, isLive: true });
    if (!session) { res.status(404).json({ error: "Session not found" }); return; }

    const user = await User.findById(req.userId).select("username").lean();
    const senderName = user?.username ?? "User";

    const message = {
      senderId: req.userId!,
      senderName,
      content,
      createdAt: new Date(),
    };

    session.messages.push(message as any);
    if (session.messages.length > 500) {
      session.messages = session.messages.slice(-500) as any;
    }
    await session.save();

    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ error: "Failed to send message" });
  }
}

export async function removePin(req: AuthRequest, res: Response): Promise<void> {
  try {
    const code = (req.params.code as string)?.toUpperCase();
    const pinIndex = Number(req.params.pinIndex);

    const session = await SpotSession.findOne({ code, isLive: true });
    if (!session) { res.status(404).json({ error: "Session not found" }); return; }

    if (pinIndex < 0 || pinIndex >= session.pins.length) {
      res.status(400).json({ error: "Invalid pin index" });
      return;
    }

    session.pins.splice(pinIndex, 1);
    await session.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to remove pin" });
  }
}

export async function endSession(req: AuthRequest, res: Response): Promise<void> {
  try {
    const code = (req.params.code as string)?.toUpperCase();
    const session = await SpotSession.findOne({ code, hostId: req.userId! });
    if (!session) { res.status(404).json({ error: "Session not found or not host" }); return; }

    session.isLive = false;
    session.endedAt = new Date();
    await session.save();

    emit("spotsync:ended" as any, { sessionCode: code, hostId: req.userId! } as any);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to end session" });
  }
}
