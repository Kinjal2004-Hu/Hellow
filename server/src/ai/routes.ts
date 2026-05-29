import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import * as ctrl from "./controller.js";

const router = Router();

router.use(requireAuth);

// ─── Chat / Completion ───
router.post("/complete", ctrl.chatComplete);
router.post("/complete/stream", ctrl.chatCompleteStream);

// ─── Embeddings ───
router.post("/embeddings", ctrl.createEmbedding);

// ─── Feature endpoints ───
router.post("/features/note-generation", ctrl.handleNoteGeneration);
router.post("/features/summarize", ctrl.handleSummary);
router.post("/features/extract-tasks", ctrl.handleTaskExtraction);
router.post("/features/micro-learning", ctrl.handleMicroLearning);

// ─── Conversation management ───
router.get("/conversations", ctrl.listConversations);
router.post("/conversations", ctrl.createConversation);
router.get("/conversations/:contextId", ctrl.getConversation);
router.delete("/conversations/:contextId", ctrl.deleteConversation);
router.post("/conversations/:contextId/messages", ctrl.sendMessage);

// ─── Token usage ───
router.get("/usage", ctrl.getTokenUsage);

// ─── Config / discovery ───
router.get("/presets", ctrl.getPresets);
router.get("/providers", ctrl.getAvailableProviders);

export default router;
