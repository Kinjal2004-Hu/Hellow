import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.js";
import { DriveFile } from "../models/DriveFile.js";
import { DriveFolder } from "../models/DriveFolder.js";
import { emit } from "../events/index.js";
import { v4 as uuid } from "uuid";
import { writeFile, unlink, mkdir } from "fs/promises";
import { resolve } from "path";

const UPLOAD_DIR = resolve(import.meta.dirname, "../../uploads");
const MAX_FILE_SIZE = 20 * 1024 * 1024;

export async function createFolder(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { name, parentId } = req.body;
    if (!name) { res.status(400).json({ error: "Folder name required" }); return; }

    const folder = await DriveFolder.create({
      userId: req.userId!,
      name,
      parentId: parentId || null,
    });
    emit("drive:folder_created", { folderId: folder._id.toString(), userId: req.userId!, name });
    res.status(201).json(folder);
  } catch (err) {
    res.status(500).json({ error: "Failed to create folder" });
  }
}

export async function listFolders(req: AuthRequest, res: Response): Promise<void> {
  try {
    const parentId = (req.query.parentId as string) || null;
    const filter: any = { userId: req.userId! };
    if (parentId) filter.parentId = parentId;
    else filter.parentId = null;

    const folders = await DriveFolder.find(filter).sort({ name: 1 }).lean();
    res.json(folders);
  } catch (err) {
    res.status(500).json({ error: "Failed to list folders" });
  }
}

export async function updateFolder(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { name, parentId } = req.body;
    const folder = await DriveFolder.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId! },
      { $set: { name, parentId: parentId ?? null } },
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
    const folder = await DriveFolder.findOneAndDelete({ _id: req.params.id, userId: req.userId! });
    if (!folder) { res.status(404).json({ error: "Folder not found" }); return; }
    await DriveFile.updateMany({ folderId: req.params.id }, { $set: { folderId: null } });
    await DriveFolder.updateMany({ parentId: req.params.id }, { $set: { parentId: null } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete folder" });
  }
}

export async function uploadFile(req: AuthRequest, res: Response): Promise<void> {
  try {
    const file = (req as any).file;
    if (!file) { res.status(400).json({ error: "File required" }); return; }

    const folderId = req.body.folderId || null;
    const source = req.body.source || "user";

    const doc = await DriveFile.create({
      userId: req.userId!,
      name: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      url: `/uploads/${file.filename}`,
      folderId: folderId || null,
      source,
    });

    emit("drive:file_uploaded", { fileId: doc._id.toString(), userId: req.userId!, name: doc.name, size: doc.size });
    res.status(201).json(doc);
  } catch (err) {
    res.status(500).json({ error: "Failed to upload file" });
  }
}

export async function listFiles(req: AuthRequest, res: Response): Promise<void> {
  try {
    const folderId = (req.query.folderId as string) || null;
    const search = req.query.search as string;
    const trashed = req.query.trashed === "true";

    const filter: any = { userId: req.userId!, isTrashed: trashed };
    if (folderId) filter.folderId = folderId;
    else filter.folderId = null;

    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }

    const files = await DriveFile.find(filter).sort({ createdAt: -1 }).lean();
    res.json(files);
  } catch (err) {
    res.status(500).json({ error: "Failed to list files" });
  }
}

export async function getFile(req: AuthRequest, res: Response): Promise<void> {
  try {
    const file = await DriveFile.findOne({ _id: req.params.id, userId: req.userId! });
    if (!file) { res.status(404).json({ error: "File not found" }); return; }
    res.json(file);
  } catch (err) {
    res.status(500).json({ error: "Failed to get file" });
  }
}

export async function updateFile(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { name, folderId, isStarred } = req.body;
    const update: any = {};
    if (name !== undefined) update.name = name;
    if (folderId !== undefined) update.folderId = folderId || null;
    if (isStarred !== undefined) update.isStarred = isStarred;

    const file = await DriveFile.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId! },
      { $set: update },
      { new: true },
    );
    if (!file) { res.status(404).json({ error: "File not found" }); return; }
    res.json(file);
  } catch (err) {
    res.status(500).json({ error: "Failed to update file" });
  }
}

export async function deleteFile(req: AuthRequest, res: Response): Promise<void> {
  try {
    const file = await DriveFile.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId! },
      { $set: { isTrashed: true } },
      { new: true },
    );
    if (!file) { res.status(404).json({ error: "File not found" }); return; }
    emit("drive:file_deleted", { fileId: file._id.toString(), userId: req.userId! });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete file" });
  }
}

export async function restoreFile(req: AuthRequest, res: Response): Promise<void> {
  try {
    const file = await DriveFile.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId! },
      { $set: { isTrashed: false } },
      { new: true },
    );
    if (!file) { res.status(404).json({ error: "File not found" }); return; }
    res.json(file);
  } catch (err) {
    res.status(500).json({ error: "Failed to restore file" });
  }
}

export async function permanentDelete(req: AuthRequest, res: Response): Promise<void> {
  try {
    const file = await DriveFile.findOneAndDelete({ _id: req.params.id, userId: req.userId! });
    if (!file) { res.status(404).json({ error: "File not found" }); return; }

    const filePath = resolve(UPLOAD_DIR, file.url.replace("/uploads/", ""));
    try { await unlink(filePath); } catch {}

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to permanently delete file" });
  }
}

export async function saveAppGeneratedContent(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { name, content, mimeType, folderId, source } = req.body;
    if (!name || !content) {
      res.status(400).json({ error: "Name and content required" });
      return;
    }

    await mkdir(UPLOAD_DIR, { recursive: true });
    const filename = `${uuid()}-${name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const filePath = resolve(UPLOAD_DIR, filename);
    await writeFile(filePath, content, "utf-8");

    const doc = await DriveFile.create({
      userId: req.userId!,
      name,
      mimeType: mimeType || "text/plain",
      size: Buffer.byteLength(content, "utf-8"),
      url: `/uploads/${filename}`,
      folderId: folderId || null,
      source: source || "app",
    });

    res.status(201).json(doc);
  } catch (err) {
    res.status(500).json({ error: "Failed to save content" });
  }
}
