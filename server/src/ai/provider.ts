import type {
  AIProviderName,
  AICompletionRequest,
  AICompletionResponse,
  EmbeddingRequest,
  EmbeddingResponse,
  StreamChunk,
} from "./types.js";

export interface AIProvider {
  readonly name: AIProviderName;

  complete(req: AICompletionRequest): Promise<AICompletionResponse>;
  completeStream(req: AICompletionRequest): AsyncIterable<StreamChunk>;
  embed(req: EmbeddingRequest): Promise<EmbeddingResponse>;

  isAvailable(): boolean;
}

export abstract class BaseAIProvider implements AIProvider {
  abstract readonly name: AIProviderName;

  abstract complete(req: AICompletionRequest): Promise<AICompletionResponse>;
  abstract completeStream(req: AICompletionRequest): AsyncIterable<StreamChunk>;
  abstract embed(req: EmbeddingRequest): Promise<EmbeddingResponse>;

  isAvailable(): boolean {
    return true;
  }
}
