import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.js";
import { Meeting } from "../models/Meeting.js";

export async function createYouTubeRoom(req: AuthRequest, res: Response): Promise<void> {
  try {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const room = await Meeting.create({
      code,
      name: "YouTube Watch Party",
      roles: { [req.userId!]: "host" },
      participants: [req.userId!],
    });
    res.status(201).json(room);
  } catch (err) {
    res.status(500).json({ error: "Failed to create room" });
  }
}

export async function getYouTubeRoom(req: AuthRequest, res: Response): Promise<void> {
  try {
    const code = (req.params.code as string)?.toUpperCase();
    const room = await Meeting.findOne({ code });
    if (!room) { res.status(404).json({ error: "Room not found" }); return; }
    res.json(room);
  } catch (err) {
    res.status(500).json({ error: "Failed to get room" });
  }
}
