import { env } from "./env.js";

function unique(values: Array<string | undefined>): string[] {
  return Array.from(new Set(values.filter((value): value is string => Boolean(value))));
}

export function getAllowedOrigins(): string[] {
  const localOrigins = ["http://localhost:5173", "http://localhost:8080"];
  return unique([env.FRONTEND_URL, ...localOrigins]);
}
