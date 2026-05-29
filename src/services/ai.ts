import { api } from "./api";

// ─── Completion ───

export interface AIMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
}

export interface AICompletionResponse {
  id: string;
  model: string;
  content: string;
  finishReason: string | null;
  usage: { promptTokens: number; completionTokens: number; totalTokens: number };
}

export async function chatComplete(payload: {
  messages: AIMessage[];
  system?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}): Promise<AICompletionResponse> {
  const { data } = await api.post("/ai/complete", payload);
  return data;
}

// ─── Conversations ───

export interface ConversationSummary {
  id: string;
  userId: string;
  title: string;
  entries: { role: string; content: string; timestamp: string }[];
  createdAt: string;
  updatedAt: string;
}

export async function fetchConversations(): Promise<ConversationSummary[]> {
  const { data } = await api.get("/ai/conversations");
  return data;
}

export async function createConversation(title?: string): Promise<ConversationSummary> {
  const { data } = await api.post("/ai/conversations", { title });
  return data;
}

export async function fetchConversation(contextId: string): Promise<ConversationSummary> {
  const { data } = await api.get(`/ai/conversations/${contextId}`);
  return data;
}

export async function deleteConversation(contextId: string): Promise<void> {
  await api.delete(`/ai/conversations/${contextId}`);
}

export async function sendMessage(
  contextId: string,
  content: string,
): Promise<{ reply: string; usage: AICompletionResponse["usage"] }> {
  const { data } = await api.post(`/ai/conversations/${contextId}/messages`, { content });
  return data;
}

// ─── Features ───

export interface NoteGenerationRequest {
  title?: string;
  existingContent?: string;
  instruction?: "expand" | "rewrite" | "continue" | "summarize";
  tone?: "formal" | "casual" | "academic" | "creative";
}

export interface NoteGenerationResult {
  content: string;
  model: string;
  usage: { promptTokens: number; completionTokens: number; totalTokens: number };
}

export async function generateNoteContent(payload: NoteGenerationRequest): Promise<NoteGenerationResult> {
  const { data } = await api.post("/ai/features/note-generation", payload);
  return data;
}

export interface SummaryRequest {
  text: string;
  maxLength?: "short" | "medium" | "long";
  format?: "paragraph" | "bullets" | "tldr";
}

export async function summarize(payload: SummaryRequest): Promise<{ summary: string; model: string; usage: any }> {
  const { data } = await api.post("/ai/features/summarize", payload);
  return data;
}

export interface TaskExtractionResult {
  tasks: { title: string; content?: string; priority?: "low" | "medium" | "high"; dueAt?: string | null }[];
  model: string;
  usage: any;
}

export async function extractTasks(payload: { source: string; context?: string }): Promise<TaskExtractionResult> {
  const { data } = await api.post("/ai/features/extract-tasks", payload);
  return data;
}

export interface MicroLearningResult {
  title: string;
  content: string;
  keyTakeaways: string[];
  quizQuestions: { question: string; options: string[]; correctIndex: number; explanation: string }[];
  model: string;
  usage: any;
}

export async function generateMicroLearning(payload: {
  topic: string;
  difficulty?: "beginner" | "intermediate" | "advanced";
  format?: "explanation" | "guide" | "qa";
  length?: "short" | "medium" | "long";
}): Promise<MicroLearningResult> {
  const { data } = await api.post("/ai/features/micro-learning", payload);
  return data;
}

// ─── Token Usage ───

export interface TokenUsageResponse {
  records: any[];
  totals: { promptTokens: number; completionTokens: number; totalTokens: number };
}

export async function fetchTokenUsage(): Promise<TokenUsageResponse> {
  const { data } = await api.get("/ai/usage");
  return data;
}
