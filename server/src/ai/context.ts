import type { Message, ConversationContext, ConversationEntry } from "./types.js";
import { v4 as uuid } from "uuid";
import type { AIProvider } from "./provider.js";

// ─── Tokenizer approximation ───

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

// ─── In-memory conversation store ───
// Will be replaced with DB-backed store for persistence + RAG later.

const stores = new Map<string, ConversationContext>();

// ─── Context manager ───

export class ConversationManager {
  private provider: AIProvider;
  private maxTokens: number;

  constructor(provider: AIProvider, maxTokens = 8192) {
    this.provider = provider;
    this.maxTokens = maxTokens;
  }

  createContext(userId: string, title = "New conversation"): ConversationContext {
    const ctx: ConversationContext = {
      id: uuid(),
      userId,
      title,
      entries: [],
      maxEntries: 100,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    stores.set(ctx.id, ctx);
    return ctx;
  }

  getContext(contextId: string): ConversationContext | undefined {
    return stores.get(contextId);
  }

  deleteContext(contextId: string): boolean {
    return stores.delete(contextId);
  }

  addEntry(
    contextId: string,
    role: ConversationEntry["role"],
    content: string,
  ): ConversationContext | null {
    const ctx = stores.get(contextId);
    if (!ctx) return null;

    ctx.entries.push({
      role,
      content,
      timestamp: new Date(),
      tokenCount: estimateTokens(content),
    });
    ctx.updatedAt = new Date();

    if (ctx.entries.length > ctx.maxEntries) {
      ctx.entries.splice(0, ctx.entries.length - ctx.maxEntries);
    }

    return ctx;
  }

  toMessages(contextId: string, system?: string): Message[] {
    const ctx = stores.get(contextId);
    if (!ctx) return [];

    const messages: Message[] = [];

    if (system) {
      messages.push({ role: "system", content: system });
    }

    let totalTokens = system ? estimateTokens(system) : 0;

    // Walk entries newest-first to fit within token budget
    const selected: ConversationEntry[] = [];
    for (let i = ctx.entries.length - 1; i >= 0; i--) {
      const entry = ctx.entries[i];
      const tokens = entry.tokenCount ?? estimateTokens(entry.content);
      if (totalTokens + tokens > this.maxTokens) break;
      totalTokens += tokens;
      selected.unshift(entry);
    }

    for (const entry of selected) {
      messages.push({ role: entry.role, content: entry.content });
    }

    return messages;
  }

  clearContext(contextId: string): boolean {
    const ctx = stores.get(contextId);
    if (!ctx) return false;
    ctx.entries = [];
    ctx.updatedAt = new Date();
    return true;
  }

  getContextsByUser(userId: string): ConversationContext[] {
    const results: ConversationContext[] = [];
    for (const ctx of stores.values()) {
      if (ctx.userId === userId) results.push(ctx);
    }
    return results.sort(
      (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime(),
    );
  }
}
