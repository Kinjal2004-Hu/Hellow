import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import * as ctrl from "../controllers/gmailController.js";

const router = Router();

router.get("/connect", requireAuth, ctrl.connectGmail);
router.get("/callback", requireAuth, ctrl.gmailCallback);
router.get("/status", requireAuth, ctrl.checkStatus);
router.get("/inbox", requireAuth, ctrl.inbox);
router.get("/message/:messageId", requireAuth, ctrl.messageDetail);
router.post("/disconnect", requireAuth, ctrl.disconnect);

export default router;
