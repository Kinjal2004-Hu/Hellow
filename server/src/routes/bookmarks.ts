import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import * as ctrl from "../controllers/bookmarksController.js";

const router = Router();

router.get("/", requireAuth, ctrl.listBookmarks);
router.post("/", requireAuth, ctrl.createBookmark);
router.get("/:id", requireAuth, ctrl.getBookmark);
router.put("/:id", requireAuth, ctrl.updateBookmark);
router.delete("/:id", requireAuth, ctrl.deleteBookmark);

export default router;
