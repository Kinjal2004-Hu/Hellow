import { getAIService } from "./service.js";
import type { EmbeddingRequest, EmbeddingResponse } from "./types.js";

/**
 * High-level embedding service that wraps the provider-agnostic AIService.
 * Ready for future RAG integration — vectors returned here can be pushed
 * to a vector store (Pinecone, pgvector, MongoDB Atlas Search, etc.).
 */
export class EmbeddingService {
  async embed(
    input: string | string[],
    options?: { model?: string; userId?: string },
  ): Promise<EmbeddingResponse> {
    const req: EmbeddingRequest = {
      input,
      model: options?.model,
    };

    return getAIService().embed(req, options?.userId);
  }

  /**
   * Embed a single text string (convenience wrapper).
   */
  async embedText(text: string, userId?: string): Promise<number[]> {
    const result = await this.embed(text, { userId });
    return result.embeddings[0];
  }

  /**
   * Embed multiple text chunks (for indexing/search).
   */
  async embedBatch(
    texts: string[],
    userId?: string,
  ): Promise<number[][]> {
    if (texts.length === 0) return [];
    const result = await this.embed(texts, { userId });
    return result.embeddings;
  }
}

export const embeddingService = new EmbeddingService();
