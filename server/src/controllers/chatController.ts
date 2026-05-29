import type { Response, NextFunction } from "express";
import type { AuthRequest } from "../middleware/auth.js";
import { Room } from "../models/Room.js";
import { Message } from "../models/Message.js";
import { User } from "../models/User.js";
import { checkResourcePermission } from "../permissions/service.js";
import { asyncHandler } from "../middleware/errorHandler.js";

export const listRooms = asyncHandler(async (req: AuthRequest, res: Response) => {
  const rooms = await Room.find({ [`roles.${req.userId!}`]: { $exists: true } })
    .sort({ updatedAt: -1 })
    .lean();

  const result = await Promise.all(
    rooms.map(async (r) => {
      const lastMsg = await Message.findOne({ roomId: r._id })
        .sort({ createdAt: -1 })
        .select("createdAt")
        .lean();
      const lastRead = (r.lastReadAt as Record<string, Date>)?.[req.userId!];
      let unread = 0;
      if (lastMsg && lastRead) {
        unread = await Message.countDocuments({
          roomId: r._id,
          createdAt: { $gt: lastRead },
        });
      } else if (lastMsg && !lastRead) {
        unread = await Message.countDocuments({ roomId: r._id });
      }
      return {
        _id: r._id.toString(),
        name: r.name,
        kind: r.kind,
        category: r.category,
        role: r.roles[req.userId!] ?? null,
        unread,
        memberCount: r.members.length,
        lastActivity: lastMsg?.createdAt?.toISOString() ?? r.createdAt.toISOString(),
      };
    }),
  );

  res.json({ rooms: result });
});

export const createRoom = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { name, kind, category } = req.body;
  if (!name?.trim()) {
    res.status(400).json({ error: "Name required" });
    return;
  }

  const existing = await Room.findOne({ name: name.trim(), kind: kind ?? "channel" });
  if (existing) {
    res.status(409).json({ error: "Room already exists" });
    return;
  }

  const room = await Room.create({
    name: name.trim(),
    kind: kind ?? "channel",
    category: category ?? "saved",
    roles: { [req.userId!]: "owner" },
    members: [req.userId!],
  });

  res.status(201).json({
    _id: room._id.toString(),
    name: room.name,
    kind: room.kind,
    category: room.category,
    role: "owner",
    unread: 0,
    memberCount: 1,
  });
});

export const updateRoom = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { roomId } = req.params;
  const room = await Room.findById(roomId);
  if (!room) {
    res.status(404).json({ error: "Room not found" });
    return;
  }

  if (!checkResourcePermission(room, req.userId!, "room:update", "room")) {
    res.status(403).json({ error: "Insufficient permissions" });
    return;
  }

  if (req.body.name) room.name = req.body.name;
  if (req.body.category) room.category = req.body.category;
  await room.save();

  res.json({ ok: true, room: { _id: room._id.toString(), name: room.name, category: room.category } });
});

export const deleteRoom = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { roomId } = req.params;
  const room = await Room.findById(roomId);
  if (!room) {
    res.status(404).json({ error: "Room not found" });
    return;
  }

  if (!checkResourcePermission(room, req.userId!, "room:delete", "room")) {
    res.status(403).json({ error: "Insufficient permissions" });
    return;
  }

  await Message.deleteMany({ roomId });
  await Room.findByIdAndDelete(roomId);
  res.json({ ok: true });
});

export const getMessages = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { roomId } = req.params;
  const { before, limit } = req.query;

  const room = await Room.findById(roomId);
  if (!room) {
    res.status(404).json({ error: "Room not found" });
    return;
  }

  if (!room.roles[req.userId!]) {
    res.status(403).json({ error: "Not a member" });
    return;
  }

  const filter: any = { roomId };
  if (before) filter.createdAt = { $lt: new Date(before as string) };

  const msgs = await Message.find(filter)
    .sort({ createdAt: -1 })
    .limit(Math.min(Number(limit) || 50, 100))
    .lean();

  const userIds = [...new Set(msgs.map((m) => m.senderId.toString()))];
  const users = await User.find({ _id: { $in: userIds } })
    .select("username email")
    .lean();
  const userMap = Object.fromEntries(users.map((u) => [u._id.toString(), u.username ?? "Unknown"]));

  const result = msgs.reverse().map((m) => ({
    _id: m._id.toString(),
    roomId: m.roomId.toString(),
    senderId: m.senderId.toString(),
    senderName: userMap[m.senderId.toString()] ?? "Unknown",
    content: m.content,
    tempId: m.tempId,
    createdAt: m.createdAt.toISOString(),
  }));

  res.json({ messages: result });
});

export const inviteToRoom = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { roomId } = req.params;
  const { email } = req.body;

  const room = await Room.findById(roomId);
  if (!room) {
    res.status(404).json({ error: "Room not found" });
    return;
  }

  if (!checkResourcePermission(room, req.userId!, "room:invite", "room")) {
    res.status(403).json({ error: "Insufficient permissions" });
    return;
  }

  const target = await User.findOne({ email: email?.toLowerCase() });
  if (!target) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  const targetId = target._id.toString();
  if (room.roles[targetId]) {
    res.status(409).json({ error: "User already in room" });
    return;
  }

  room.roles[targetId] = "member";
  room.members.push(target._id);
  await room.save();

  res.json({ ok: true, userId: targetId, username: target.username });
});

export const kickMember = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { roomId } = req.params;
  const { userId: targetId } = req.body;

  const room = await Room.findById(roomId);
  if (!room) {
    res.status(404).json({ error: "Room not found" });
    return;
  }

  if (!checkResourcePermission(room, req.userId!, "room:kick_member", "room")) {
    res.status(403).json({ error: "Insufficient permissions" });
    return;
  }

  const targetRole = room.roles[targetId];
  if (!targetRole) {
    res.status(404).json({ error: "User not in room" });
    return;
  }
  if (targetRole === "owner") {
    res.status(403).json({ error: "Cannot kick owner" });
    return;
  }

  delete room.roles[targetId];
  (room.members as any).pull(targetId);
  await room.save();

  res.json({ ok: true });
});

export const promoteMember = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { roomId } = req.params;
  const { userId: targetId } = req.body;

  const room = await Room.findById(roomId);
  if (!room) {
    res.status(404).json({ error: "Room not found" });
    return;
  }

  if (!checkResourcePermission(room, req.userId!, "room:promote_member", "room")) {
    res.status(403).json({ error: "Insufficient permissions" });
    return;
  }

  if (room.roles[targetId] !== "member") {
    res.status(400).json({ error: "User is not a member" });
    return;
  }

  room.roles[targetId] = "admin";
  await room.save();
  res.json({ ok: true, role: "admin" });
});

export const demoteMember = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { roomId } = req.params;
  const { userId: targetId } = req.body;

  const room = await Room.findById(roomId);
  if (!room) {
    res.status(404).json({ error: "Room not found" });
    return;
  }

  if (!checkResourcePermission(room, req.userId!, "room:demote_member", "room")) {
    res.status(403).json({ error: "Insufficient permissions" });
    return;
  }

  if (room.roles[targetId] !== "admin") {
    res.status(400).json({ error: "User is not an admin" });
    return;
  }

  room.roles[targetId] = "member";
  await room.save();
  res.json({ ok: true, role: "member" });
});

export const getRoomMembers = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { roomId } = req.params;
  const room = await Room.findById(roomId);
  if (!room) {
    res.status(404).json({ error: "Room not found" });
    return;
  }

  const users = await User.find({ _id: { $in: room.members } })
    .select("_id username email avatarUrl")
    .lean();

  const result = users.map((u) => ({
    _id: u._id.toString(),
    username: u.username,
    email: u.email,
    avatarUrl: u.avatarUrl,
    role: room.roles[u._id.toString()] ?? "member",
  }));

  res.json({ members: result });
});

export const searchUsers = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { q } = req.query;
  if (!q || typeof q !== "string") {
    res.status(400).json({ error: "Query required" });
    return;
  }

  const users = await User.find({
    $or: [
      { username: { $regex: q, $options: "i" } },
      { email: { $regex: q, $options: "i" } },
    ],
  })
    .select("_id username email avatarUrl")
    .limit(20)
    .lean();

  const result = users
    .filter((u) => u._id.toString() !== req.userId!)
    .map((u) => ({
      _id: u._id.toString(),
      username: u.username,
      email: u.email,
      avatarUrl: u.avatarUrl,
    }));

  res.json({ users: result });
});
