import dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve(import.meta.dirname, "../../../.env") });

function req(key: string, fallback?: string): string {
  const value = process.env[key] ?? fallback;
  if (!value) throw new Error(`Missing required env var: ${key}`);
  return value;
}

function opt(key: string, fallback = ""): string {
  return process.env[key] ?? fallback;
}

export const env = {
  PORT: Number(req("PORT", "4000")),
  NODE_ENV: req("NODE_ENV", "development"),
  MONGODB_URI: req("MONGODB_URI"),
  JWT_SECRET: req("JWT_SECRET"),
  JWT_EXPIRES_IN: req("JWT_EXPIRES_IN", "7d"),
  GOOGLE_CLIENT_ID: req("GOOGLE_CLIENT_ID"),
  GOOGLE_CLIENT_SECRET: req("GOOGLE_CLIENT_SECRET"),
  GOOGLE_CALLBACK_URL: req("GOOGLE_CALLBACK_URL"),
  FRONTEND_URL: req("FRONTEND_URL", "http://localhost:5173"),
  OPENAI_API_KEY: opt("OPENAI_API_KEY"),
  NVIDIA_API_KEY: opt("NVIDIA_API_KEY"),
  NVIDIA_BASE_URL: req("NVIDIA_BASE_URL", "https://integrate.api.nvidia.com/v1"),
  AI_PRIMARY_PROVIDER: req("AI_PRIMARY_PROVIDER", "openai"),
  AI_FALLBACK_PROVIDER: opt("AI_FALLBACK_PROVIDER"),
} as const;
