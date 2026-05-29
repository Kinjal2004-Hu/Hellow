import type { AIProvider } from "./provider.js";
import type {
  AICompletionRequest,
  AICompletionResponse,
  EmbeddingRequest,
  EmbeddingResponse,
  StreamChunk,
  AIFeatureType,
  AIProviderName,
} from "./types.js";
import { AI_PRESETS } from "./types.js";
import { OpenAIProvider } from "./providers/openai.js";
import { AnthropicProvider } from "./providers/anthropic.js";
import { GoogleProvider } from "./providers/google.js";
import { NvidiaProvider } from "./providers/nvidia.js";
import { tokenTracker } from "./tracker.js";
import { collectStream } from "./streaming.js";
import { ConversationManager } from "./context.js";
import { env } from "../config/env.js";
import { BaseAIProvider } from "./provider.js";
// ─── Error classes ───

export class AIError extends Error {
  constructor(
    message: string,
    public readonly provider: string,
    public readonly code: "rate_limit" | "timeout" | "auth" | "model" | "unknown",
  ) {
    super(message);
    this.name = "AIError";
  }
}

export class AIConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AIConfigurationError";
  }
}

// ─── Retry helper ───

async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number,
  providerName: string,
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      lastError = err;

      const isRateLimit = err?.status === 429 || err?.code === "rate_limit";
      const isTimeout = err?.code === "TIMEOUT" || err?.name === "AbortError";

      if (isRateLimit && attempt < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, attempt) + Math.random() * 1000, 30_000);
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }

      if (isTimeout && attempt < maxRetries) {
        continue;
      }

      const code = isRateLimit ? "rate_limit" : isTimeout ? "timeout" : "unknown";
      throw new AIError(
        err?.message ?? "AI request failed",
        providerName,
        code,
      );
    }
  }

  throw lastError;
}

// ─── AIService ───

export class AIService {
  private providers = new Map<AIProviderName, AIProvider>();
  private primaryProvider: AIProviderName;
  private fallbackProvider: AIProviderName | null;
  private defaultMaxRetries = 2;
  conversation: ConversationManager;

  constructor(config?: {
    primary?: AIProviderName;
    fallback?: AIProviderName | null;
  }) {
    this.primaryProvider = config?.primary ?? "openai";
    this.fallbackProvider = config?.fallback ?? null;

    this.registerDefaultProviders();

    const primary = this.getProvider(this.primaryProvider) ?? this.getAvailableProviders()[0] as unknown as BaseAIProvider | undefined;
    this.conversation = new ConversationManager(
      primary ?? new (class extends BaseAIProvider {
        readonly name: AIProviderName = "openai";
        complete = async () => { throw new AIConfigurationError("No AI provider configured"); };
        completeStream = async function* () { throw new AIConfigurationError("No AI provider configured"); };
        embed = async () => { throw new AIConfigurationError("No AI provider configured"); };
      })(),
    );
  }

  private registerDefaultProviders(): void {
    const apiKey = env.OPENAI_API_KEY;
    if (apiKey) {
      this.registerProvider(
        new OpenAIProvider({
          name: "openai",
          apiKey,
          defaultModel: AI_PRESETS.chat.model,
        }),
      );
    }

    this.registerProvider(
      new AnthropicProvider({ name: "anthropic", apiKey: "" }),
    );

    this.registerProvider(
      new GoogleProvider({ name: "google", apiKey: "" }),
    );

    const nvidiaKey = env.NVIDIA_API_KEY;
    if (nvidiaKey) {
      this.registerProvider(
        new NvidiaProvider({
          name: "nvidia",
          apiKey: nvidiaKey,
          baseUrl: env.NVIDIA_BASE_URL,
          defaultModel: AI_PRESETS.chat.model,
        }),
      );
    }
  }

  registerProvider(provider: AIProvider): void {
    this.providers.set(provider.name, provider);
  }

  getProvider(name: AIProviderName): AIProvider | undefined {
    return this.providers.get(name);
  }

  getAvailableProviders(): AIProviderName[] {
    const available: AIProviderName[] = [];
    for (const [name, provider] of this.providers) {
      if (provider.isAvailable()) available.push(name);
    }
    return available;
  }

  // ─── Completion with retry + optional fallback ───

  async complete(
    req: AICompletionRequest,
    feature: AIFeatureType = "chat",
  ): Promise<AICompletionResponse> {
    const providerName = this.resolveProvider(feature);
    const provider = this.providers.get(providerName);

    if (!provider) {
      throw new AIConfigurationError(`No provider available for "${providerName}"`);
    }

    try {
      const result = await withRetry(
        () => provider.complete(req),
        req.model ? 0 : this.defaultMaxRetries,
        providerName,
      );

      if (req.userId) {
        tokenTracker.track(
          req.userId,
          provider.name,
          result.model,
          feature,
          result.usage.promptTokens,
          result.usage.completionTokens,
        );
      }

      return result;
    } catch (err) {
      if (this.fallbackProvider && err instanceof AIError) {
        const fallbackProvider = this.providers.get(this.fallbackProvider);
        if (fallbackProvider?.isAvailable()) {
          const result = await withRetry(
            () => fallbackProvider.complete(req),
            1,
            this.fallbackProvider!,
          );

          if (req.userId) {
            tokenTracker.track(
              req.userId,
              fallbackProvider.name,
              result.model,
              feature,
              result.usage.promptTokens,
              result.usage.completionTokens,
            );
          }

          return result;
        }
      }
      throw err;
    }
  }

  // ─── Streaming with retry ───

  async *completeStream(
    req: AICompletionRequest,
    feature: AIFeatureType = "chat",
  ): AsyncIterable<StreamChunk> {
    const providerName = this.resolveProvider(feature);
    const provider = this.providers.get(providerName);

    if (!provider) {
      yield { type: "error", error: `No provider available for "${providerName}"` };
      return;
    }

    const stream = this.tryStreamWithRetry(provider, req, this.defaultMaxRetries, providerName);

    for await (const chunk of stream) {
      yield chunk;

      if (chunk.type === "done" && chunk.usage && req.userId) {
        tokenTracker.track(
          req.userId,
          provider.name,
          req.model ?? "",
          feature,
          chunk.usage.promptTokens,
          chunk.usage.completionTokens,
        );
      }
    }
  }

  private async *tryStreamWithRetry(
    provider: AIProvider,
    req: AICompletionRequest,
    maxRetries: number,
    providerName: AIProviderName,
  ): AsyncIterable<StreamChunk> {
    let lastError: unknown;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const stream = provider.completeStream(req);
        for await (const chunk of stream) {
          yield chunk;
        }
        return;
      } catch (err: any) {
        lastError = err;
        const isRateLimit = err?.status === 429 || err?.code === "rate_limit";
        const isTimeout = err?.code === "TIMEOUT" || err?.name === "AbortError";

        if ((isRateLimit || isTimeout) && attempt < maxRetries) {
          const delay = isRateLimit
            ? Math.min(1000 * Math.pow(2, attempt) + Math.random() * 1000, 30_000)
            : 500;
          await new Promise((r) => setTimeout(r, delay));
          continue;
        }

        yield {
          type: "error",
          error: err?.message ?? "Stream failed",
        };
        return;
      }
    }

    // Fallback
    if (this.fallbackProvider && lastError instanceof AIError) {
      const fallbackProvider = this.providers.get(this.fallbackProvider);
      if (fallbackProvider?.isAvailable()) {
        const fallbackStream = fallbackProvider.completeStream(req);
        for await (const chunk of fallbackStream) {
          yield chunk;
        }
        return;
      }
    }

    yield {
      type: "error",
      error: lastError instanceof Error ? lastError.message : "Stream failed after retries",
    };
  }

  // ─── Embeddings ───

  async embed(
    req: EmbeddingRequest,
    userId?: string,
  ): Promise<EmbeddingResponse> {
    const providerName = "openai";
    const provider = this.providers.get(providerName);

    if (!provider) {
      throw new AIConfigurationError("No embedding provider available");
    }

    const result = await withRetry(
      () => provider.embed(req),
      this.defaultMaxRetries,
      providerName,
    );

    if (userId) {
      tokenTracker.track(
        userId,
        provider.name,
        result.model,
        "embedding",
        result.usage.promptTokens,
        result.usage.completionTokens,
      );
    }

    return result;
  }

  // ─── Provider resolution ───

  private resolveProvider(feature: AIFeatureType): AIProviderName {
    const preset = AI_PRESETS[feature];
    if (preset && this.providers.get(preset.provider)?.isAvailable()) {
      return preset.provider;
    }

    if (this.providers.get(this.primaryProvider)?.isAvailable()) {
      return this.primaryProvider;
    }

    const available = this.getAvailableProviders();
    if (available.length > 0) return available[0];

    return this.primaryProvider;
  }
}

// ─── Singleton ───

let _instance: AIService | null = null;

export function getAIService(): AIService {
  if (!_instance) {
    _instance = new AIService();
  }
  return _instance;
}
