import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import * as notificationService from "../notifications/service.js";

export const listNotifications = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { before, limit, includeRead } = req.query;
  const notifications = await notificationService.fetchNotifications(req.userId!, {
    before: before ? new Date(before as string) : undefined,
    limit: limit ? Number(limit) : undefined,
    includeRead: includeRead === "true",
  });
  res.json({ notifications });
});

export const unreadCount = asyncHandler(async (req: AuthRequest, res: Response) => {
  const count = await notificationService.getUnreadCount(req.userId!);
  res.json({ count });
});

export const groupedUnread = asyncHandler(async (req: AuthRequest, res: Response) => {
  const counts = await notificationService.getGroupedUnreadCounts(req.userId!);
  res.json({ counts });
});

export const markRead = asyncHandler(async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string;
  const ok = await notificationService.markRead(id, req.userId!);
  res.json({ ok });
});

export const markAllRead = asyncHandler(async (req: AuthRequest, res: Response) => {
  const count = await notificationService.markAllRead(req.userId!);
  res.json({ ok: true, count });
});

export const dismissNotification = asyncHandler(async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string;
  const ok = await notificationService.markDismissed(id, req.userId!);
  res.json({ ok });
});

export const dismissAllNotifications = asyncHandler(async (req: AuthRequest, res: Response) => {
  const count = await notificationService.dismissAll(req.userId!);
  res.json({ ok: true, count });
});
