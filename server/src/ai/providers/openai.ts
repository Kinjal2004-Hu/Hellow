import OpenAI from "openai";
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

type OpenAIRole = "system" | "user" | "assistant" | "tool" | "function";

export class OpenAIProvider extends BaseAIProvider {
  readonly name: AIProviderName = "openai";
  private client: OpenAI;
  private defaultModel: string;
  private timeoutMs: number;

  constructor(config: AIProviderConfig) {
    super();
    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseUrl,
      timeout: config.timeoutMs ?? 30_000,
      maxRetries: config.maxRetries ?? 2,
    });
    this.defaultModel = config.defaultModel ?? "gpt-4o";
    this.timeoutMs = config.timeoutMs ?? 30_000;
  }

  isAvailable(): boolean {
    return true;
  }

  async complete(req: AICompletionRequest): Promise<AICompletionResponse> {
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];

    if (req.system) {
      messages.push({ role: "system", content: req.system });
    }

    for (const m of req.messages) {
      messages.push({ role: m.role as OpenAIRole, content: m.content } as OpenAI.Chat.ChatCompletionMessageParam);
    }

    const response = await this.client.chat.completions.create(
      {
        model: req.model ?? this.defaultModel,
        messages,
        temperature: req.temperature,
        max_tokens: req.maxTokens,
        stop: req.stop,
        stream: false,
      },
      { signal: AbortSignal.timeout(this.timeoutMs) },
    );

    const choice = response.choices[0];

    return {
      id: response.id,
      model: response.model,
      content: choice?.message?.content ?? "",
      finishReason: (choice?.finish_reason ?? null) as AICompletionResponse["finishReason"],
      usage: {
        promptTokens: response.usage?.prompt_tokens ?? 0,
        completionTokens: response.usage?.completion_tokens ?? 0,
        totalTokens: response.usage?.total_tokens ?? 0,
      },
    };
  }

  async *completeStream(req: AICompletionRequest): AsyncIterable<StreamChunk> {
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];

    if (req.system) {
      messages.push({ role: "system", content: req.system });
    }

    for (const m of req.messages) {
      messages.push({ role: m.role as OpenAIRole, content: m.content } as OpenAI.Chat.ChatCompletionMessageParam);
    }

    const stream = await this.client.chat.completions.create(
      {
        model: req.model ?? this.defaultModel,
        messages,
        temperature: req.temperature,
        max_tokens: req.maxTokens,
        stop: req.stop,
        stream: true,
        stream_options: { include_usage: true },
      },
      { signal: AbortSignal.timeout(this.timeoutMs) },
    );

    for await (const chunk of stream) {
      const delta = chunk.choices?.[0]?.delta;
      if (delta?.content) {
        yield { type: "content", content: delta.content };
      }

      if (chunk.choices?.[0]?.finish_reason) {
        yield {
          type: "done",
          finishReason: chunk.choices[0].finish_reason as AICompletionResponse["finishReason"],
          usage: chunk.usage
            ? {
                promptTokens: chunk.usage.prompt_tokens ?? 0,
                completionTokens: chunk.usage.completion_tokens ?? 0,
                totalTokens: chunk.usage.total_tokens ?? 0,
              }
            : undefined,
        };
      }
    }
  }

  async embed(req: EmbeddingRequest): Promise<EmbeddingResponse> {
    const input = typeof req.input === "string" ? req.input : req.input;
    const response = await this.client.embeddings.create({
      model: req.model ?? "text-embedding-3-small",
      input,
    });

    return {
      embeddings: response.data.map((d) => d.embedding),
      model: response.model,
      usage: {
        promptTokens: response.usage?.prompt_tokens ?? 0,
        completionTokens: 0,
        totalTokens: response.usage?.total_tokens ?? 0,
      },
    };
  }
}
