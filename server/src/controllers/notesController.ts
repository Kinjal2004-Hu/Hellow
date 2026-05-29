import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.js";
import { Note, NoteFolder } from "../models/Note.js";
import { emit } from "../events/index.js";

export async function listNotes(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { folderId, tag, archived } = req.query;
    const filter: Record<string, unknown> = { userId: req.userId! };

    if (folderId && folderId !== "null") filter.folderId = folderId;
    if (tag) filter.tags = tag;
    filter.isArchived = archived === "true";

    const notes = await Note.find(filter).sort({ updatedAt: -1 }).lean();
    res.json(notes);
  } catch (err) {
    res.status(500).json({ error: "Failed to list notes" });
  }
}

export async function getNote(req: AuthRequest, res: Response): Promise<void> {
  try {
    const note = (req as any).resource ?? await Note.findById(req.params.noteId);
    if (!note) { res.status(404).json({ error: "Note not found" }); return; }
    res.json(note);
  } catch (err) {
    res.status(500).json({ error: "Failed to get note" });
  }
}

export async function createNote(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { title, content, folderId, tags } = req.body;
    const note = await Note.create({
      userId: req.userId!,
      title: title || "Untitled",
      content: content ?? "",
      folderId: folderId ?? null,
      tags: tags ?? [],
    });
    emit("note:created", { noteId: note._id.toString(), userId: req.userId!, title: note.title });
    res.status(201).json(note);
  } catch (err) {
    res.status(500).json({ error: "Failed to create note" });
  }
}

export async function updateNote(req: AuthRequest, res: Response): Promise<void> {
  try {
    const note = (req as any).resource ?? await Note.findById(req.params.noteId);
    if (!note) { res.status(404).json({ error: "Note not found" }); return; }

    const allowed = ["title", "content", "folderId", "tags", "isArchived"];
    const changes: Record<string, unknown> = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        note[key] = req.body[key];
        changes[key] = req.body[key];
      }
    }
    await note.save();
    emit("note:updated", { noteId: note._id.toString(), userId: req.userId!, changes });
    res.json(note);
  } catch (err) {
    res.status(500).json({ error: "Failed to update note" });
  }
}

export async function deleteNote(req: AuthRequest, res: Response): Promise<void> {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.noteId, userId: req.userId! });
    if (!note) { res.status(404).json({ error: "Note not found" }); return; }
    emit("note:deleted", { noteId: note._id.toString(), userId: req.userId! });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete note" });
  }
}

// ─── Folders ───

export async function listFolders(req: AuthRequest, res: Response): Promise<void> {
  try {
    const folders = await NoteFolder.find({ userId: req.userId! }).sort({ name: 1 }).lean();
    res.json(folders);
  } catch (err) {
    res.status(500).json({ error: "Failed to list folders" });
  }
}

export async function createFolder(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { name, parentId } = req.body;
    const folder = await NoteFolder.create({ userId: req.userId!, name, parentId: parentId ?? null });
    res.status(201).json(folder);
  } catch (err) {
    res.status(500).json({ error: "Failed to create folder" });
  }
}

export async function updateFolder(req: AuthRequest, res: Response): Promise<void> {
  try {
    const folder = await NoteFolder.findOneAndUpdate(
      { _id: req.params.folderId, userId: req.userId! },
      { $set: { name: req.body.name } },
      { new: true },
    );
    if (!folder) { res.status(404).json({ error: "Folder not found" }); return; }
    res.json(folder);
  } catch (err) {
    res.status(500).json({ error: "Failed to update folder" });
  }
}

export async function deleteFolder(req: AuthRequest, res: Response): Promise<void> {
  try {
    const folder = await NoteFolder.findOneAndDelete({ _id: req.params.folderId, userId: req.userId! });
    if (!folder) { res.status(404).json({ error: "Folder not found" }); return; }
    await Note.updateMany({ folderId: folder._id }, { $set: { folderId: null } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete folder" });
  }
}
