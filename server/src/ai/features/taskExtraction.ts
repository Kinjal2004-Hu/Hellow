import { getAIService } from "../service.js";
import { AI_PRESETS } from "../types.js";
import type { Message, AIFeatureType } from "../types.js";

export interface ExtractedTask {
  title: string;
  content?: string;
  priority?: "low" | "medium" | "high";
  dueAt?: string | null;
}

export interface TaskExtractionRequest {
  userId: string;
  source: string;
  context?: string;
}

export interface TaskExtractionResult {
  tasks: ExtractedTask[];
  model: string;
  usage: { promptTokens: number; completionTokens: number; totalTokens: number };
}

export async function extractTasks(
  req: TaskExtractionRequest,
): Promise<TaskExtractionResult> {
  const preset = AI_PRESETS.task_extraction;

  const messages: Message[] = [
    {
      role: "user",
      content: [
        req.context ? `Context: ${req.context}\n` : "",
        `Extract all actionable tasks from the following text. Return a valid JSON array of objects with shape { title: string, content?: string, priority?: "low"|"medium"|"high", dueAt?: string|null }.`,
        ``,
        req.source,
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
    "task_extraction" as AIFeatureType,
  );

  let tasks: ExtractedTask[] = [];

  try {
    const cleaned = result.content
      .replace(/```json\s*/gi, "")
      .replace(/```\s*$/, "")
      .trim();
    tasks = JSON.parse(cleaned);
    if (!Array.isArray(tasks)) tasks = [];
  } catch {
    tasks = [{ title: result.content.slice(0, 200) }];
  }

  return {
    tasks,
    model: result.model,
    usage: result.usage,
  };
}
