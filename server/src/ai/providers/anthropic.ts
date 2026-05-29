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
 * Anthropic Claude provider stub.
 * Implement when Anthropic SDK is added and ANTHROPIC_API_KEY is configured.
 */
export class AnthropicProvider extends BaseAIProvider {
  readonly name: AIProviderName = "anthropic";
  private config: AIProviderConfig;

  constructor(config: AIProviderConfig) {
    super();
    this.config = config;
  }

  isAvailable(): boolean {
    return false; // Requires SDK + API key
  }

  async complete(_req: AICompletionRequest): Promise<AICompletionResponse> {
    throw new Error("Anthropic provider is not yet implemented");
  }

  async *completeStream(_req: AICompletionRequest): AsyncIterable<StreamChunk> {
    throw new Error("Anthropic provider is not yet implemented");
  }

  async embed(_req: EmbeddingRequest): Promise<EmbeddingResponse> {
    throw new Error("Anthropic provider does not support embeddings");
  }
}
