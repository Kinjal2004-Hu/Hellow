import { Router } from "express";
import authRoutes from "./auth.js";
import chatRoutes from "./chat.js";
import notificationRoutes from "./notifications.js";
import noteRoutes from "./notes.js";
import taskRoutes from "./tasks.js";
import calendarRoutes from "./calendar.js";
import { aiRoutes } from "../ai/index.js";
import meetingRoutes from "./meetings.js";
import musicRoutes from "./music.js";
import youtubeRoutes from "./youtube.js";
import gmailRoutes from "./gmail.js";
import bookmarkRoutes from "./bookmarks.js";
import driveRoutes from "./drive.js";
import spotSyncRoutes from "./spotSync.js";
import workspaceRoutes from "./workspace.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/chat", chatRoutes);
router.use("/notifications", notificationRoutes);
router.use("/notes", noteRoutes);
router.use("/tasks", taskRoutes);
router.use("/calendar", calendarRoutes);
router.use("/ai", aiRoutes);
router.use("/meetings", meetingRoutes);
router.use("/music", musicRoutes);
router.use("/youtube", youtubeRoutes);
router.use("/gmail", gmailRoutes);
router.use("/bookmarks", bookmarkRoutes);
router.use("/drive", driveRoutes);
router.use("/spotsync", spotSyncRoutes);
router.use("/workspace", workspaceRoutes);

export default router;
