import { getAIService } from "../service.js";
import { AI_PRESETS } from "../types.js";
import type { Message, AIFeatureType } from "../types.js";

export interface MicroLearningRequest {
  userId: string;
  topic: string;
  difficulty?: "beginner" | "intermediate" | "advanced";
  format?: "explanation" | "guide" | "qa";
  length?: "short" | "medium" | "long";
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface MicroLearningResult {
  title: string;
  content: string;
  keyTakeaways: string[];
  quizQuestions: QuizQuestion[];
  model: string;
  usage: { promptTokens: number; completionTokens: number; totalTokens: number };
}

export async function generateMicroLearning(
  req: MicroLearningRequest,
): Promise<MicroLearningResult> {
  const preset = AI_PRESETS.micro_learning;

  const difficultyGuide: Record<string, string> = {
    beginner: "Assume no prior knowledge. Use simple language and analogies.",
    intermediate: "Assume basic familiarity. Focus on depth and connections.",
    advanced: "Assume strong understanding. Focus on nuance, trade-offs, and expert insights.",
  };

  const formatGuide: Record<string, string> = {
    explanation: "Write a clear, engaging explanation.",
    guide: "Write a step-by-step practical guide.",
    qa: "Write in a question-and-answer format.",
  };

  const lengthGuide: Record<string, string> = {
    short: "Keep it brief — around 150 words.",
    medium: "Moderate depth — around 400 words.",
    long: "Comprehensive — around 800 words.",
  };

  const messages: Message[] = [
    {
      role: "user",
      content: [
        `Topic: ${req.topic}`,
        difficultyGuide[req.difficulty ?? "beginner"],
        formatGuide[req.format ?? "explanation"],
        lengthGuide[req.length ?? "medium"],
        ``,
        `Return your response as a JSON object with this exact shape:
{
  "title": "string",
  "content": "string (the main body)",
  "keyTakeaways": ["string", ...] (3-5 bullet points),
  "quizQuestions": [
    {
      "question": "string",
      "options": ["string", "string", "string", "string"],
      "correctIndex": number (0-3),
      "explanation": "string"
    }
  ]
}`,
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
    "micro_learning" as AIFeatureType,
  );

  let parsed: Partial<MicroLearningResult> = {};

  try {
    const cleaned = result.content
      .replace(/```json\s*/gi, "")
      .replace(/```\s*$/, "")
      .trim();
    parsed = JSON.parse(cleaned);
  } catch {
    parsed = { content: result.content, keyTakeaways: [], quizQuestions: [] };
  }

  return {
    title: parsed.title ?? req.topic,
    content: parsed.content ?? result.content,
    keyTakeaways: parsed.keyTakeaways ?? [],
    quizQuestions: parsed.quizQuestions ?? [],
    model: result.model,
    usage: result.usage,
  };
}
