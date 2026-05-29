import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.js";
import { getAIService } from "./service.js";
import { conversation } from "./conversation.js";
import { embeddingService } from "./embeddings.js";
import { summarize } from "./features/summaries.js";
import { generateNoteContent } from "./features/noteGeneration.js";
import { extractTasks } from "./features/taskExtraction.js";
import { generateMicroLearning } from "./features/microLearning.js";
import { tokenTracker } from "./tracker.js";
import { streamToReadable } from "./streaming.js";
import { AI_PRESETS } from "./types.js";

import type { AIFeatureType } from "./types.js";

// ─── Chat / Completion ───

export async function chatComplete(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { messages, system, model, temperature, maxTokens, feature } = req.body as Record<string, any>;
    const result = await getAIService().complete(
      {
        messages,
        system,
        model,
        temperature,
        maxTokens,
        userId: req.userId,
      },
      (feature as AIFeatureType) ?? "chat",
    );
    res.json(result);
  } catch (err: any) {
    res.status(err.code === "auth" ? 401 : err.code === "rate_limit" ? 429 : 500).json({
      error: err.message ?? "AI completion failed",
    });
  }
}

export async function chatCompleteStream(req: AuthRequest, res: Response): Promise<void> {
  const { messages, system, model, temperature, maxTokens, feature } = req.body as Record<string, any>;

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    const stream = getAIService().completeStream(
      {
        messages,
        system,
        model,
        temperature,
        maxTokens,
        userId: req.userId,
      },
      (feature as AIFeatureType) ?? "chat",
    );

    const readable = streamToReadable(stream);
    const reader = readable.getReader();
    const encoder = new TextEncoder();

    req.on("close", () => reader.cancel());

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(value);
    }

    res.end();
  } catch (err: any) {
    res.write(`data: ${JSON.stringify({ type: "error", error: err.message })}\n\n`);
    res.end();
  }
}

// ─── Embeddings ───

export async function createEmbedding(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { input, model } = req.body as Record<string, any>;
    const result = await embeddingService.embed(input, {
      model,
      userId: req.userId,
    });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "Embedding failed" });
  }
}

// ─── Features ───

export async function handleNoteGeneration(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { title, existingContent, instruction, tone } = req.body as Record<string, any>;
    const result = await generateNoteContent({
      userId: req.userId!,
      title: title ?? "Untitled",
      existingContent: existingContent ?? "",
      instruction: instruction ?? "expand",
      tone,
    });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "Note generation failed" });
  }
}

export async function handleSummary(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { text, maxLength, format } = req.body as Record<string, any>;
    if (!text) { res.status(400).json({ error: "text is required" }); return; }
    const result = await summarize({
      userId: req.userId!,
      text,
      maxLength,
      format,
    });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "Summarization failed" });
  }
}

export async function handleTaskExtraction(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { source, context } = req.body as Record<string, any>;
    if (!source) { res.status(400).json({ error: "source is required" }); return; }
    const result = await extractTasks({
      userId: req.userId!,
      source,
      context,
    });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "Task extraction failed" });
  }
}

export async function handleMicroLearning(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { topic, difficulty, format, length } = req.body as Record<string, any>;
    if (!topic) { res.status(400).json({ error: "topic is required" }); return; }
    const result = await generateMicroLearning({
      userId: req.userId!,
      topic,
      difficulty,
      format,
      length,
    });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "Micro-learning generation failed" });
  }
}

// ─── Conversation ───

export async function createConversation(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { title } = req.body as Record<string, any>;
    const ctx = conversation.createContext(req.userId!, title);
    res.status(201).json(ctx);
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "Failed to create conversation" });
  }
}

export async function listConversations(req: AuthRequest, res: Response): Promise<void> {
  try {
    const contexts = conversation.getContextsByUser(req.userId!);
    res.json(contexts);
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "Failed to list conversations" });
  }
}

export async function getConversation(req: AuthRequest, res: Response): Promise<void> {
  try {
    const contextId = req.params.contextId as string;
    const ctx = conversation.getContext(contextId);
    if (!ctx || ctx.userId !== req.userId) {
      res.status(404).json({ error: "Conversation not found" });
      return;
    }
    res.json(ctx);
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "Failed to get conversation" });
  }
}

export async function deleteConversation(req: AuthRequest, res: Response): Promise<void> {
  try {
    const contextId = req.params.contextId as string;
    const ctx = conversation.getContext(contextId);
    if (!ctx || ctx.userId !== req.userId) {
      res.status(404).json({ error: "Conversation not found" });
      return;
    }
    conversation.deleteContext(contextId);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "Failed to delete conversation" });
  }
}

export async function sendMessage(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { content } = req.body as Record<string, any>;
    const contextId = req.params.contextId as string;

    const ctx = conversation.getContext(contextId);
    if (!ctx || ctx.userId !== req.userId) {
      res.status(404).json({ error: "Conversation not found" });
      return;
    }

    conversation.addEntry(contextId, "user", content);

    const preset = AI_PRESETS.chat;
    const messages = conversation.toMessages(contextId, preset.system);

    const result = await getAIService().complete(
      {
        messages,
        model: preset.model,
        temperature: preset.temperature,
        maxTokens: preset.maxTokens,
        userId: req.userId,
      },
      "chat",
    );

    conversation.addEntry(contextId, "assistant", result.content);

    res.json({ reply: result.content, usage: result.usage });
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "Message failed" });
  }
}

// ─── Token usage ───

export async function getTokenUsage(req: AuthRequest, res: Response): Promise<void> {
  try {
    const usage = tokenTracker.getByUser(req.userId!);
    const totals = tokenTracker.getUserTotals(req.userId!);
    res.json({ records: usage, totals });
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "Failed to get token usage" });
  }
}

// ─── Presets / config (read-only) ───

export async function getPresets(_req: AuthRequest, res: Response): Promise<void> {
  res.json(AI_PRESETS);
}

export async function getAvailableProviders(_req: AuthRequest, res: Response): Promise<void> {
  res.json({ providers: getAIService().getAvailableProviders() });
}
