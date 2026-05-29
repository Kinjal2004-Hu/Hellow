import type { TokenUsageRecord, AIProviderName, AIModelId, AIFeatureType } from "./types.js";
import { v4 as uuid } from "uuid";

/**
 * In-memory token usage tracker.
 * Future: persist to MongoDB and expose admin analytics endpoints.
 */
class TokenUsageTracker {
  private records: TokenUsageRecord[] = [];
  private maxRecords = 10_000;

  track(
    userId: string,
    provider: AIProviderName,
    model: AIModelId,
    feature: AIFeatureType,
    promptTokens: number,
    completionTokens: number,
  ): void {
    const record: TokenUsageRecord = {
      id: uuid(),
      userId,
      provider,
      model,
      feature,
      promptTokens,
      completionTokens,
      totalTokens: promptTokens + completionTokens,
      createdAt: new Date(),
    };

    this.records.push(record);

    if (this.records.length > this.maxRecords) {
      this.records.splice(0, this.records.length - this.maxRecords);
    }
  }

  getByUser(userId: string, limit = 100): TokenUsageRecord[] {
    return this.records
      .filter((r) => r.userId === userId)
      .slice(-limit)
      .reverse();
  }

  getUserTotals(userId: string): { promptTokens: number; completionTokens: number; totalTokens: number } {
    const userRecords = this.records.filter((r) => r.userId === userId);
    return {
      promptTokens: userRecords.reduce((s, r) => s + r.promptTokens, 0),
      completionTokens: userRecords.reduce((s, r) => s + r.completionTokens, 0),
      totalTokens: userRecords.reduce((s, r) => s + r.totalTokens, 0),
    };
  }

  getAllTotals(): { promptTokens: number; completionTokens: number; totalTokens: number } {
    return {
      promptTokens: this.records.reduce((s, r) => s + r.promptTokens, 0),
      completionTokens: this.records.reduce((s, r) => s + r.completionTokens, 0),
      totalTokens: this.records.reduce((s, r) => s + r.totalTokens, 0),
    };
  }
}

export const tokenTracker = new TokenUsageTracker();
