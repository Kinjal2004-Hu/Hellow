import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.js";
import { CalendarEvent } from "../models/Event.js";
import { emit } from "../events/index.js";

export async function listEvents(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { start, end } = req.query;
    const filter: Record<string, unknown> = { userId: req.userId! };

    if (start && end) {
      filter.startAt = { $gte: new Date(start as string) };
      filter.endAt = { $lte: new Date(end as string) };
    }

    const events = await CalendarEvent.find(filter).sort({ startAt: 1 }).lean();
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: "Failed to list events" });
  }
}

export async function getEvent(req: AuthRequest, res: Response): Promise<void> {
  try {
    const event = (req as any).resource ?? await CalendarEvent.findById(req.params.eventId);
    if (!event) { res.status(404).json({ error: "Event not found" }); return; }
    res.json(event);
  } catch (err) {
    res.status(500).json({ error: "Failed to get event" });
  }
}

export async function createEvent(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { title, description, startAt, endAt, allDay, color, meetingCode, reminderMinutes, isRecurring, recurringRule } = req.body;

    if (!startAt || !endAt) {
      res.status(400).json({ error: "startAt and endAt are required" });
      return;
    }

    const event = await CalendarEvent.create({
      userId: req.userId!,
      title: title || "Untitled",
      description: description ?? "",
      startAt: new Date(startAt),
      endAt: new Date(endAt),
      allDay: allDay ?? false,
      color: color ?? null,
      meetingCode: meetingCode ?? null,
      reminderMinutes: reminderMinutes ?? [],
      isRecurring: isRecurring ?? false,
      recurringRule: recurringRule ?? null,
    });
    emit("calendar:event_created", {
      eventId: event._id.toString(),
      userId: req.userId!,
      title: event.title,
      startAt: event.startAt.toISOString(),
    });
    res.status(201).json(event);
  } catch (err) {
    res.status(500).json({ error: "Failed to create event" });
  }
}

export async function updateEvent(req: AuthRequest, res: Response): Promise<void> {
  try {
    const event = (req as any).resource ?? await CalendarEvent.findById(req.params.eventId);
    if (!event) { res.status(404).json({ error: "Event not found" }); return; }

    const allowed = ["title", "description", "startAt", "endAt", "allDay", "color", "meetingCode", "reminderMinutes", "isRecurring", "recurringRule"];
    const changes: Record<string, unknown> = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        if (key === "startAt" || key === "endAt") {
          event[key] = new Date(req.body[key]);
          changes[key] = req.body[key];
        } else {
          event[key] = req.body[key];
          changes[key] = req.body[key];
        }
      }
    }
    await event.save();
    emit("calendar:event_updated", { eventId: event._id.toString(), userId: req.userId!, changes });
    res.json(event);
  } catch (err) {
    res.status(500).json({ error: "Failed to update event" });
  }
}

export async function deleteEvent(req: AuthRequest, res: Response): Promise<void> {
  try {
    const event = await CalendarEvent.findOneAndDelete({ _id: req.params.eventId, userId: req.userId! });
    if (!event) { res.status(404).json({ error: "Event not found" }); return; }
    emit("calendar:event_deleted", { eventId: event._id.toString(), userId: req.userId! });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete event" });
  }
}
