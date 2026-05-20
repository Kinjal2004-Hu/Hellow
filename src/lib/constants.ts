export const APP_NAME = "Hellow";
export const TAGLINE = "One calm place for everything you do.";

export const NAVBAR_HEIGHT = 64;
export const SIDEBAR_WIDTH = 280;
export const RAIL_WIDTH = 56;

export const QUERY_KEYS = {
  rooms: ["rooms"] as const,
  messages: (roomId: string) => ["messages", roomId] as const,
  notes: ["notes"] as const,
  tasks: ["tasks"] as const,
  events: (month: string) => ["events", month] as const,
  bookmarks: ["bookmarks"] as const,
  contacts: ["contacts"] as const,
  meetings: ["meetings"] as const,
  news: (cat: string) => ["news", cat] as const,
  files: ["files"] as const,
  profile: ["profile"] as const,
  microLearning: ["micro-learning", "today"] as const,
};
