// ─── Provider names ───

export type AIProviderName = "openai" | "anthropic" | "google" | "nvidia" | "custom";

// ─── Models ───

export type AIModelId = string; // e.g. "gpt-4o", "claude-3-opus", "gemini-1.5-pro"

// ─── Roles ───

export type MessageRole = "system" | "user" | "assistant" | "tool";

// ─── Messages ───

export interface Message {
  role: MessageRole;
  content: string;
  name?: string;
  toolCallId?: string;
}

// ─── Completion ───

export interface AICompletionRequest {
  model?: AIModelId;
  system?: string;
  messages: Message[];
  temperature?: number;
  top_p?: number;
  maxTokens?: number;
  stop?: string[];
  stream?: boolean;
  userId?: string;
}

export type FinishReason = "stop" | "length" | "content_filter" | "tool_calls" | "error" | null;

export interface AICompletionResponse {
  id: string;
  model: AIModelId;
  content: string;
  finishReason: FinishReason;
  usage: TokenUsage;
}

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

// ─── Streaming ───

export interface StreamChunk {
  type: "content" | "done" | "error";
  content?: string;
  finishReason?: FinishReason;
  usage?: TokenUsage;
  error?: string;
}

// ─── Embeddings ───

export interface EmbeddingRequest {
  input: string | string[];
  model?: string;
}

export interface EmbeddingResponse {
  embeddings: number[][];
  model: string;
  usage: TokenUsage;
}

// ─── Provider config ───

export interface AIProviderConfig {
  name: AIProviderName;
  apiKey: string;
  baseUrl?: string;
  defaultModel?: string;
  maxRetries?: number;
  timeoutMs?: number;
}

// ─── Token usage tracking ───

export interface TokenUsageRecord {
  id: string;
  userId: string;
  provider: AIProviderName;
  model: AIModelId;
  feature: AIFeatureType;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  createdAt: Date;
}

// ─── Feature types ───

export type AIFeatureType =
  | "chat"
  | "note_generation"
  | "summary"
  | "task_extraction"
  | "micro_learning"
  | "embedding";

// ─── Conversation context ───

export interface ConversationEntry {
  role: MessageRole;
  content: string;
  timestamp: Date;
  tokenCount?: number;
}

export interface ConversationContext {
  id: string;
  userId: string;
  title: string;
  entries: ConversationEntry[];
  maxEntries: number;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Presets ───

export interface AIPreset {
  provider: AIProviderName;
  model: AIModelId;
  temperature: number;
  maxTokens: number;
  system?: string;
}

// ─── Feature presets ───

export const AI_PRESETS: Record<AIFeatureType, AIPreset> = {
  chat: {
    provider: "openai",
    model: "gpt-4o",
    temperature: 0.7,
    maxTokens: 2048,
  },
  note_generation: {
    provider: "openai",
    model: "gpt-4o",
    temperature: 0.8,
    maxTokens: 1024,
    system: "You are a thoughtful writing assistant. Expand and refine notes while preserving the author's voice and intent.",
  },
  summary: {
    provider: "openai",
    model: "gpt-4o-mini",
    temperature: 0.3,
    maxTokens: 512,
    system: "You are a precise summarizer. Condense the following text while retaining all key information and nuance.",
  },
  task_extraction: {
    provider: "openai",
    model: "gpt-4o-mini",
    temperature: 0.1,
    maxTokens: 1024,
    system: "You extract actionable tasks from text. Return a JSON array of { title, content?, priority?, dueAt? } objects.",
  },
  micro_learning: {
    provider: "openai",
    model: "gpt-4o",
    temperature: 0.7,
    maxTokens: 2048,
    system: "You create concise micro-learning content. Break down complex topics into digestible chunks with key takeaways and optional quiz questions.",
  },
  embedding: {
    provider: "openai",
    model: "text-embedding-3-small",
    temperature: 0,
    maxTokens: 0,
  },
};
