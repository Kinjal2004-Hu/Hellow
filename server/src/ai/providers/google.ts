import type { AIProviderConfig } from "../types.js";
import { BaseAIProvider } from "../provider.js";
import type {
  AIProviderName,
  AICompletionRequest,
  AICompletionResponse,
  EmbeddingRequest,
  EmbeddingResponse,
  StreamChunk,
} from "../types.js";

/**
 * Google Gemini provider stub.
 * Implement when Google Generative AI SDK is added and GEMINI_API_KEY is configured.
 */
export class GoogleProvider extends BaseAIProvider {
  readonly name: AIProviderName = "google";
  private config: AIProviderConfig;

  constructor(config: AIProviderConfig) {
    super();
    this.config = config;
  }

  isAvailable(): boolean {
    return false; // Requires SDK + API key
  }

  async complete(_req: AICompletionRequest): Promise<AICompletionResponse> {
    throw new Error("Google provider is not yet implemented");
  }

  async *completeStream(_req: AICompletionRequest): AsyncIterable<StreamChunk> {
    throw new Error("Google provider is not yet implemented");
  }

  async embed(_req: EmbeddingRequest): Promise<EmbeddingResponse> {
    throw new Error("Google provider is not yet implemented");
  }
}
