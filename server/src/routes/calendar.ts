import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { requireEventPermission } from "../permissions/middleware.js";
import * as ctrl from "../controllers/calendarController.js";

const router = Router();

router.use(requireAuth);

router.get("/", ctrl.listEvents);
router.get("/:eventId", ctrl.getEvent);
router.post("/", ctrl.createEvent);
router.put("/:eventId", requireEventPermission("collab:write"), ctrl.updateEvent);
router.delete("/:eventId", requireEventPermission("collab:delete"), ctrl.deleteEvent);

export default router;
