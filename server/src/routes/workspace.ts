import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { requireWorkspacePermission } from "../permissions/middleware.js";
import * as ctrl from "../controllers/workspaceController.js";

const router = Router();

router.use(requireAuth);

router.get("/", ctrl.listSessions);
router.post("/", ctrl.createSession);
router.get("/:code", ctrl.getSession);
router.post("/:code/join", ctrl.joinSession);
router.post("/:code/leave", ctrl.leaveSession);
router.put("/:code/state", ctrl.updateSharedState);
router.put("/:code/follow", ctrl.setFollowMode);
router.post("/:code/end", requireWorkspacePermission("workspace:end_session"), ctrl.endSession);

export default router;
