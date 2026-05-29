import { getAIService } from "../service.js";
import { AI_PRESETS } from "../types.js";
import type { Message, AIFeatureType } from "../types.js";

export interface SummaryRequest {
  userId: string;
  text: string;
  maxLength?: "short" | "medium" | "long";
  format?: "paragraph" | "bullets" | "tldr";
}

export interface SummaryResult {
  summary: string;
  model: string;
  usage: { promptTokens: number; completionTokens: number; totalTokens: number };
}

const lengthGuide: Record<string, string> = {
  short: "1-2 sentences",
  medium: "1 short paragraph",
  long: "2-3 paragraphs",
};

export async function summarize(
  req: SummaryRequest,
): Promise<SummaryResult> {
  const preset = AI_PRESETS.summary;
  const length = lengthGuide[req.maxLength ?? "medium"];
  const formatMap: Record<string, string> = {
    paragraph: "Write the summary as a coherent paragraph.",
    bullets: "Write the summary as bullet points.",
    tldr: "Write a TL;DR in one sentence.",
  };

  const messages: Message[] = [
    {
      role: "user",
      content: [
        `Summarize the following text (${length}):`,
        formatMap[req.format ?? "paragraph"],
        ``,
        req.text.slice(0, 8000),
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
    "summary" as AIFeatureType,
  );

  return {
    summary: result.content,
    model: result.model,
    usage: result.usage,
  };
}
