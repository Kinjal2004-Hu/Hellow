import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import * as chatController from "../controllers/chatController.js";

const router = Router();

router.use(requireAuth);

router.get("/rooms", chatController.listRooms);
router.post("/rooms", chatController.createRoom);
router.put("/rooms/:roomId", chatController.updateRoom);
router.delete("/rooms/:roomId", chatController.deleteRoom);
router.get("/rooms/:roomId/messages", chatController.getMessages);
router.get("/rooms/:roomId/members", chatController.getRoomMembers);
router.post("/rooms/:roomId/invite", chatController.inviteToRoom);
router.post("/rooms/:roomId/kick", chatController.kickMember);
router.post("/rooms/:roomId/promote", chatController.promoteMember);
router.post("/rooms/:roomId/demote", chatController.demoteMember);
router.get("/users/search", chatController.searchUsers);

export default router;
