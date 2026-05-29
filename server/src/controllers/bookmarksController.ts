import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.js";
import { Bookmark } from "../models/Bookmark.js";
import { emit } from "../events/index.js";

export async function createBookmark(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { title, url, notes } = req.body;
    if (!title || !url) {
      res.status(400).json({ error: "Title and URL required" });
      return;
    }
    const bookmark = await Bookmark.create({
      userId: req.userId!,
      title,
      url,
      notes: notes || "",
    });
    emit("bookmark:created", { bookmarkId: bookmark._id.toString(), userId: req.userId!, title, url });
    res.status(201).json(bookmark);
  } catch (err) {
    res.status(500).json({ error: "Failed to create bookmark" });
  }
}

export async function listBookmarks(req: AuthRequest, res: Response): Promise<void> {
  try {
    const search = req.query.search as string;
    const filter: any = { userId: req.userId! };
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { url: { $regex: search, $options: "i" } },
        { notes: { $regex: search, $options: "i" } },
      ];
    }
    const bookmarks = await Bookmark.find(filter).sort({ createdAt: -1 }).lean();
    res.json(bookmarks);
  } catch (err) {
    res.status(500).json({ error: "Failed to list bookmarks" });
  }
}

export async function getBookmark(req: AuthRequest, res: Response): Promise<void> {
  try {
    const bookmark = await Bookmark.findOne({ _id: req.params.id, userId: req.userId! });
    if (!bookmark) { res.status(404).json({ error: "Bookmark not found" }); return; }
    res.json(bookmark);
  } catch (err) {
    res.status(500).json({ error: "Failed to get bookmark" });
  }
}

export async function updateBookmark(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { title, url, notes } = req.body;
    const bookmark = await Bookmark.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId! },
      { $set: { title, url, notes } },
      { new: true },
    );
    if (!bookmark) { res.status(404).json({ error: "Bookmark not found" }); return; }
    res.json(bookmark);
  } catch (err) {
    res.status(500).json({ error: "Failed to update bookmark" });
  }
}

export async function deleteBookmark(req: AuthRequest, res: Response): Promise<void> {
  try {
    const bookmark = await Bookmark.findOneAndDelete({ _id: req.params.id, userId: req.userId! });
    if (!bookmark) { res.status(404).json({ error: "Bookmark not found" }); return; }
    emit("bookmark:deleted", { bookmarkId: req.params.id as string, userId: req.userId! });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete bookmark" });
  }
}
