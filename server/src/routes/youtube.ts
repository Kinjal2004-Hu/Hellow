import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import * as ctrl from "../controllers/youtubeController.js";

const router = Router();

router.use(requireAuth);

router.post("/rooms", ctrl.createYouTubeRoom);
router.get("/rooms/:code", ctrl.getYouTubeRoom);

export default router;
