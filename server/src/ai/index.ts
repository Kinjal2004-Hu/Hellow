// ─── Types ───
export type {
  AIProviderName,
  AIModelId,
  MessageRole,
  Message,
  AICompletionRequest,
  AICompletionResponse,
  FinishReason,
  TokenUsage,
  StreamChunk,
  EmbeddingRequest,
  EmbeddingResponse,
  AIProviderConfig,
  TokenUsageRecord,
  AIFeatureType,
  ConversationEntry,
  ConversationContext,
  AIPreset,
} from "./types.js";

export { AI_PRESETS } from "./types.js";

// ─── Provider interface ───
export type { AIProvider } from "./provider.js";
export { BaseAIProvider } from "./provider.js";

// ─── Provider implementations ───
export { OpenAIProvider } from "./providers/openai.js";
export { AnthropicProvider } from "./providers/anthropic.js";
export { GoogleProvider } from "./providers/google.js";
export { NvidiaProvider } from "./providers/nvidia.js";

// ─── Service ───
export { AIService, AIError, AIConfigurationError, getAIService } from "./service.js";

// ─── Streaming ───
export { StreamManager, streamToReadable, collectStream } from "./streaming.js";

// ─── Conversation ───
export { ConversationManager } from "./context.js";
export { conversation } from "./conversation.js";

// ─── Embeddings ───
export { EmbeddingService, embeddingService } from "./embeddings.js";

// ─── Tracker ───
export { tokenTracker } from "./tracker.js";

// ─── Features ───
export { generateNoteContent, generateNoteTitle } from "./features/noteGeneration.js";
export { summarize } from "./features/summaries.js";
export { extractTasks } from "./features/taskExtraction.js";
export { generateMicroLearning } from "./features/microLearning.js";

// ─── Routes ───
export { default as aiRoutes } from "./routes.js";
