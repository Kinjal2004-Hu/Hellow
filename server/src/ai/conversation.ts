import { getAIService } from "./service.js";

/**
 * Re-export the conversation manager from the AI service singleton.
 * Controllers import this directly instead of going through getAIService().
 */
export const conversation = getAIService().conversation;
