import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.js";
import { MusicRoom } from "../models/MusicRoom.js";

function generateCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export async function createMusicRoom(req: AuthRequest, res: Response): Promise<void> {
  try {
    let code = generateCode();
    while (await MusicRoom.findOne({ code })) code = generateCode();

    const room = await MusicRoom.create({
      code,
      roles: { [req.userId!]: "host" },
      members: [req.userId!],
      queue: [],
      isPlaying: false,
      position: 0,
      powerToAll: false,
    });

    res.status(201).json(room);
  } catch (err) {
    res.status(500).json({ error: "Failed to create music room" });
  }
}

export async function getMusicRoom(req: AuthRequest, res: Response): Promise<void> {
  try {
    const code = (req.params.code as string)?.toUpperCase();
    const room = await MusicRoom.findOne({ code });
    if (!room) { res.status(404).json({ error: "Music room not found" }); return; }
    res.json(room);
  } catch (err) {
    res.status(500).json({ error: "Failed to get music room" });
  }
}

export async function listMusicRooms(_req: AuthRequest, res: Response): Promise<void> {
  try {
    const rooms = await MusicRoom.find().sort({ createdAt: -1 }).limit(20).lean();
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ error: "Failed to list music rooms" });
  }
}

export async function joinMusicRoom(req: AuthRequest, res: Response): Promise<void> {
  try {
    const code = (req.params.code as string)?.toUpperCase();
    const room = await MusicRoom.findOne({ code });
    if (!room) { res.status(404).json({ error: "Music room not found" }); return; }

    if (!room.roles[req.userId!]) {
      room.roles[req.userId!] = "member";
    }
    if (!room.members.some((m) => m.toString() === req.userId!)) {
      room.members.push(req.userId! as any);
    }
    await room.save();
    res.json(room);
  } catch (err) {
    res.status(500).json({ error: "Failed to join music room" });
  }
}

export async function leaveMusicRoom(req: AuthRequest, res: Response): Promise<void> {
  try {
    const code = (req.params.code as string)?.toUpperCase();
    const room = await MusicRoom.findOne({ code });
    if (!room) { res.status(404).json({ error: "Music room not found" }); return; }

    delete room.roles[req.userId!];
    room.members = room.members.filter((m) => m.toString() !== req.userId!);
    await room.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to leave music room" });
  }
}

export async function addToQueue(req: AuthRequest, res: Response): Promise<void> {
  try {
    const code = (req.params.code as string)?.toUpperCase();
    const room = await MusicRoom.findOne({ code });
    if (!room) { res.status(404).json({ error: "Music room not found" }); return; }

    const { id, title, artist, albumArt, duration } = req.body;
    if (!id || !title) { res.status(400).json({ error: "id and title required" }); return; }

    room.queue.push({ id, title, artist: artist ?? "", albumArt: albumArt ?? "", duration: duration ?? 0 });
    await room.save();
    res.json(room);
  } catch (err) {
    res.status(500).json({ error: "Failed to add to queue" });
  }
}

export async function removeFromQueue(req: AuthRequest, res: Response): Promise<void> {
  try {
    const code = (req.params.code as string)?.toUpperCase();
    const room = await MusicRoom.findOne({ code });
    if (!room) { res.status(404).json({ error: "Music room not found" }); return; }

    const index = parseInt(req.params.index as string, 10);
    if (isNaN(index) || index < 0 || index >= room.queue.length) {
      res.status(400).json({ error: "Invalid queue index" }); return;
    }

    room.queue.splice(index, 1);
    await room.save();
    res.json(room);
  } catch (err) {
    res.status(500).json({ error: "Failed to remove from queue" });
  }
}

export async function clearQueue(req: AuthRequest, res: Response): Promise<void> {
  try {
    const code = (req.params.code as string)?.toUpperCase();
    const room = await MusicRoom.findOneAndUpdate(
      { code },
      { $set: { queue: [] } },
      { new: true },
    );
    if (!room) { res.status(404).json({ error: "Music room not found" }); return; }
    res.json(room);
  } catch (err) {
    res.status(500).json({ error: "Failed to clear queue" });
  }
}

export async function skipTrack(req: AuthRequest, res: Response): Promise<void> {
  try {
    const code = (req.params.code as string)?.toUpperCase();
    const room = await MusicRoom.findOne({ code });
    if (!room) { res.status(404).json({ error: "Music room not found" }); return; }

    if (room.queue.length > 0) {
      const next = room.queue.shift()!;
      room.currentTrack = next;
      room.isPlaying = true;
      room.position = 0;
    } else {
      room.currentTrack = null;
      room.isPlaying = false;
      room.position = 0;
    }
    await room.save();
    res.json(room);
  } catch (err) {
    res.status(500).json({ error: "Failed to skip track" });
  }
}
