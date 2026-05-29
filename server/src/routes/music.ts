import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { requireMusicPermission } from "../permissions/middleware.js";
import * as ctrl from "../controllers/musicController.js";

const router = Router();

router.use(requireAuth);

router.get("/", ctrl.listMusicRooms);
router.post("/", ctrl.createMusicRoom);
router.get("/:code", ctrl.getMusicRoom);
router.post("/:code/join", ctrl.joinMusicRoom);
router.post("/:code/leave", ctrl.leaveMusicRoom);
router.post("/:code/queue", requireMusicPermission("music:manage_queue"), ctrl.addToQueue);
router.delete("/:code/queue/:index", requireMusicPermission("music:manage_queue"), ctrl.removeFromQueue);
router.delete("/:code/queue", requireMusicPermission("music:manage_queue"), ctrl.clearQueue);
router.post("/:code/skip", requireMusicPermission("music:control_playback"), ctrl.skipTrack);

export default router;
