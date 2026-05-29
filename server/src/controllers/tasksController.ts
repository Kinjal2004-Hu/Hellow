import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.js";
import { Task } from "../models/Task.js";
import { emit } from "../events/index.js";

export async function listTasks(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { done, priority, tag, archived } = req.query;
    const filter: Record<string, unknown> = { userId: req.userId! };

    if (done === "true") filter.done = true;
    else if (done === "false") filter.done = false;
    if (priority) filter.priority = priority;
    if (tag) filter.tags = tag;
    filter.isArchived = archived === "true";

    const tasks = await Task.find(filter).sort({ createdAt: -1 }).lean();
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: "Failed to list tasks" });
  }
}

export async function getTask(req: AuthRequest, res: Response): Promise<void> {
  try {
    const task = (req as any).resource ?? await Task.findById(req.params.taskId);
    if (!task) { res.status(404).json({ error: "Task not found" }); return; }
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: "Failed to get task" });
  }
}

export async function createTask(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { title, content, dueAt, priority, tags, reminderAt, isRecurring, recurringRule } = req.body;
    const task = await Task.create({
      userId: req.userId!,
      title: title || "Untitled",
      content: content ?? "",
      dueAt: dueAt ?? null,
      priority: priority ?? "medium",
      tags: tags ?? [],
      reminderAt: reminderAt ?? null,
      isRecurring: isRecurring ?? false,
      recurringRule: recurringRule ?? null,
    });
    emit("task:created", {
      taskId: task._id.toString(),
      userId: req.userId!,
      title: task.title,
      content: task.content,
      dueAt: task.dueAt?.toISOString() ?? null,
    });
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ error: "Failed to create task" });
  }
}

export async function updateTask(req: AuthRequest, res: Response): Promise<void> {
  try {
    const task = (req as any).resource ?? await Task.findById(req.params.taskId);
    if (!task) { res.status(404).json({ error: "Task not found" }); return; }

    const allowed = ["title", "content", "dueAt", "done", "priority", "tags", "reminderAt", "isRecurring", "recurringRule", "isArchived"];
    const changes: Record<string, unknown> = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        task[key] = req.body[key];
        changes[key] = req.body[key];
      }
    }
    await task.save();

    if (req.body.done) {
      emit("task:completed", { taskId: task._id.toString(), userId: req.userId! });
    }
    emit("task:updated", { taskId: task._id.toString(), userId: req.userId!, changes });
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: "Failed to update task" });
  }
}

export async function deleteTask(req: AuthRequest, res: Response): Promise<void> {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.taskId, userId: req.userId! });
    if (!task) { res.status(404).json({ error: "Task not found" }); return; }
    emit("task:deleted", { taskId: task._id.toString(), userId: req.userId! });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete task" });
  }
}
