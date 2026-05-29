import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { requireNotePermission } from "../permissions/middleware.js";
import * as ctrl from "../controllers/notesController.js";

const router = Router();

router.use(requireAuth);

router.get("/", ctrl.listNotes);
router.get("/:noteId", ctrl.getNote);
router.post("/", ctrl.createNote);
router.put("/:noteId", requireNotePermission("collab:write"), ctrl.updateNote);
router.delete("/:noteId", requireNotePermission("collab:delete"), ctrl.deleteNote);

// Folders
router.get("/folders/all", ctrl.listFolders);
router.post("/folders", ctrl.createFolder);
router.put("/folders/:folderId", ctrl.updateFolder);
router.delete("/folders/:folderId", ctrl.deleteFolder);

export default router;
