import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import * as notificationController from "../controllers/notificationController.js";

const router = Router();

router.use(requireAuth);

router.get("/", notificationController.listNotifications);
router.get("/unread", notificationController.unreadCount);
router.get("/unread/grouped", notificationController.groupedUnread);
router.post("/:id/read", notificationController.markRead);
router.post("/read-all", notificationController.markAllRead);
router.post("/:id/dismiss", notificationController.dismissNotification);
router.post("/dismiss-all", notificationController.dismissAllNotifications);

export default router;
