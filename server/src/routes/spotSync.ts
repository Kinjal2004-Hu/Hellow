import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import * as ctrl from "../controllers/spotSyncController.js";

const router = Router();

router.post("/", requireAuth, ctrl.createSession);
router.get("/", requireAuth, ctrl.listSessions);
router.get("/:code", requireAuth, ctrl.getSession);
router.post("/:code/join", requireAuth, ctrl.joinSession);
router.post("/:code/leave", requireAuth, ctrl.leaveSession);
router.get("/:code/messages", requireAuth, ctrl.getMessages);
router.post("/:code/messages", requireAuth, ctrl.addMessage);
router.post("/:code/pins", requireAuth, ctrl.addPin);
router.delete("/:code/pins/:pinIndex", requireAuth, ctrl.removePin);
router.post("/:code/end", requireAuth, ctrl.endSession);

export default router;
