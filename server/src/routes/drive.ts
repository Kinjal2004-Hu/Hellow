import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import * as ctrl from "../controllers/driveController.js";
import multer from "multer";
import { v4 as uuid } from "uuid";
import { resolve } from "path";

const UPLOAD_DIR = resolve(import.meta.dirname, "../../uploads");

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = file.originalname.split(".").pop();
    cb(null, `${uuid()}.${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
});

const router = Router();

router.get("/files", requireAuth, ctrl.listFiles);
router.post("/files/upload", requireAuth, upload.single("file"), ctrl.uploadFile);
router.get("/files/:id", requireAuth, ctrl.getFile);
router.put("/files/:id", requireAuth, ctrl.updateFile);
router.delete("/files/:id", requireAuth, ctrl.deleteFile);
router.post("/files/:id/restore", requireAuth, ctrl.restoreFile);
router.delete("/files/:id/permanent", requireAuth, ctrl.permanentDelete);
router.post("/files/save-content", requireAuth, ctrl.saveAppGeneratedContent);

router.get("/folders", requireAuth, ctrl.listFolders);
router.post("/folders", requireAuth, ctrl.createFolder);
router.put("/folders/:id", requireAuth, ctrl.updateFolder);
router.delete("/folders/:id", requireAuth, ctrl.deleteFolder);

export default router;
