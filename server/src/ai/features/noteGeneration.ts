import { getAIService } from "../service.js";
import { AI_PRESETS } from "../types.js";
import type { Message } from "../types.js";

export interface NoteGenerationRequest {
  userId: string;
  title: string;
  existingContent: string;
  instruction: "expand" | "rewrite" | "continue" | "summarize";
  tone?: "formal" | "casual" | "academic" | "creative";
}

export interface NoteGenerationResult {
  content: string;
  model: string;
  usage: { promptTokens: number; completionTokens: number; totalTokens: number };
}

export async function generateNoteContent(
  req: NoteGenerationRequest,
): Promise<NoteGenerationResult> {
  const preset = AI_PRESETS.note_generation;

  const toneInstruction = req.tone
    ? ` Write in a ${req.tone} tone.`
    : "";

  const instructionMap: Record<string, string> = {
    expand: "Expand the following note with more detail, examples, and depth while preserving the original meaning.",
    rewrite: "Rewrite the following note to improve clarity, structure, and flow.",
    continue: "Continue writing from where the note leaves off, maintaining the same style and voice.",
    summarize: "Summarize the following note into a concise version while retaining key information.",
  };

  const messages: Message[] = [
    {
      role: "user",
      content: [
        `Title: "${req.title}"`,
        ``,
        instructionMap[req.instruction] ?? instructionMap.expand,
        toneInstruction,
        ``,
        req.existingContent || "(empty note — generate fresh content based on the title)",
      ].join("\n"),
    },
  ];

  const result = await getAIService().complete(
    {
      model: preset.model,
      system: preset.system,
      messages,
      temperature: preset.temperature,
      maxTokens: preset.maxTokens,
      userId: req.userId,
    },
    "note_generation",
  );

  return {
    content: result.content,
    model: result.model,
    usage: result.usage,
  };
}

export async function generateNoteTitle(
  userId: string,
  content: string,
): Promise<string> {
  const preset = AI_PRESETS.note_generation;

  const messages: Message[] = [
    {
      role: "user",
      content: `Generate a concise, descriptive title (max 8 words) for the following note content. Return ONLY the title, no quotes or punctuation:\n\n${content.slice(0, 2000)}`,
    },
  ];

  const result = await getAIService().complete(
    {
      model: "gpt-4o-mini",
      messages,
      temperature: 0.3,
      maxTokens: 30,
      userId,
    },
    "note_generation",
  );

  return result.content.trim();
}
