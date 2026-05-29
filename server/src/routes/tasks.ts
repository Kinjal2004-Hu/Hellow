import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { requireTaskPermission } from "../permissions/middleware.js";
import * as ctrl from "../controllers/tasksController.js";

const router = Router();

router.use(requireAuth);

router.get("/", ctrl.listTasks);
router.get("/:taskId", ctrl.getTask);
router.post("/", ctrl.createTask);
router.put("/:taskId", requireTaskPermission("collab:write"), ctrl.updateTask);
router.delete("/:taskId", requireTaskPermission("collab:delete"), ctrl.deleteTask);

export default router;
