import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { requireMeetingPermission } from "../permissions/middleware.js";
import * as ctrl from "../controllers/meetingsController.js";

const router = Router();

router.use(requireAuth);

router.get("/", ctrl.listMeetings);
router.post("/", ctrl.createMeeting);
router.get("/:code", ctrl.getMeeting);
router.post("/:code/join", ctrl.joinMeeting);
router.post("/:code/leave", ctrl.leaveMeeting);
router.post("/:code/end", requireMeetingPermission("meeting:end"), ctrl.endMeeting);
router.post("/:code/kick", requireMeetingPermission("meeting:kick_participant"), ctrl.kickParticipant);

export default router;
