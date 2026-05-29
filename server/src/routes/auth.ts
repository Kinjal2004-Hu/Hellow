import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import * as authController from "../controllers/authController.js";

const router = Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/me", requireAuth, authController.me);
router.post("/logout", requireAuth, authController.logout);
router.get("/google", authController.googleAuth);
router.get("/google/callback", authController.googleCallback);

export default router;
