import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.js";
import { Meeting } from "../models/Meeting.js";
import { emit } from "../events/index.js";

function generateCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export async function createMeeting(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { name } = req.body;
    let code = generateCode();
    while (await Meeting.findOne({ code })) code = generateCode();

    const meeting = await Meeting.create({
      code,
      name: name || "Quick meeting",
      roles: { [req.userId!]: "host" },
      participants: [req.userId!],
    });

    emit("meeting:started", { meetingCode: code, hostId: req.userId!, name: meeting.name });
    res.status(201).json(meeting);
  } catch (err) {
    res.status(500).json({ error: "Failed to create meeting" });
  }
}

export async function getMeeting(req: AuthRequest, res: Response): Promise<void> {
  try {
    const code = (req.params.code as string)?.toUpperCase();
    const meeting = await Meeting.findOne({ code });
    if (!meeting) { res.status(404).json({ error: "Meeting not found" }); return; }
    res.json(meeting);
  } catch (err) {
    res.status(500).json({ error: "Failed to get meeting" });
  }
}

export async function listMeetings(_req: AuthRequest, res: Response): Promise<void> {
  try {
    const meetings = await Meeting.find({ endedAt: null }).sort({ createdAt: -1 }).limit(50).lean();
    res.json(meetings);
  } catch (err) {
    res.status(500).json({ error: "Failed to list meetings" });
  }
}

export async function joinMeeting(req: AuthRequest, res: Response): Promise<void> {
  try {
    const code = (req.params.code as string)?.toUpperCase();
    const meeting = await Meeting.findOne({ code });
    if (!meeting) { res.status(404).json({ error: "Meeting not found" }); return; }
    if (meeting.endedAt) { res.status(410).json({ error: "Meeting has ended" }); return; }

    if (!meeting.roles[req.userId!]) {
      meeting.roles[req.userId!] = "participant";
    }
    if (!meeting.participants.some((p) => p.toString() === req.userId!)) {
      meeting.participants.push(req.userId! as any);
    }
    await meeting.save();

    emit("meeting:participant_joined", { meetingCode: meeting.code, userId: req.userId! });
    res.json(meeting);
  } catch (err) {
    res.status(500).json({ error: "Failed to join meeting" });
  }
}

export async function leaveMeeting(req: AuthRequest, res: Response): Promise<void> {
  try {
    const code = (req.params.code as string)?.toUpperCase();
    const meeting = await Meeting.findOne({ code });
    if (!meeting) { res.status(404).json({ error: "Meeting not found" }); return; }

    delete meeting.roles[req.userId!];
    meeting.participants = meeting.participants.filter((p) => p.toString() !== req.userId!);
    await meeting.save();

    if (meeting.participants.length === 0) {
      meeting.endedAt = new Date();
      await meeting.save();
      emit("meeting:ended", { meetingCode: meeting.code, hostId: req.userId! });
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to leave meeting" });
  }
}

export async function endMeeting(req: AuthRequest, res: Response): Promise<void> {
  try {
    const code = (req.params.code as string)?.toUpperCase();
    const meeting = await Meeting.findOne({ code });
    if (!meeting) { res.status(404).json({ error: "Meeting not found" }); return; }

    meeting.endedAt = new Date();
    await meeting.save();
    emit("meeting:ended", { meetingCode: meeting.code, hostId: req.userId! });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to end meeting" });
  }
}

export async function kickParticipant(req: AuthRequest, res: Response): Promise<void> {
  try {
    const code = (req.params.code as string)?.toUpperCase();
    const meeting = await Meeting.findOne({ code });
    if (!meeting) { res.status(404).json({ error: "Meeting not found" }); return; }

    const targetId = (req.params.userId as string) || req.body.userId;
    if (!targetId) { res.status(400).json({ error: "userId required" }); return; }

    delete meeting.roles[targetId];
    meeting.participants = meeting.participants.filter((p) => p.toString() !== targetId);
    await meeting.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to kick participant" });
  }
}
