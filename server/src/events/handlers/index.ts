import type { Server } from "socket.io";
import { registerActivityLogger } from "./activityLogger.js";
import { registerNotificationCreator } from "./notificationCreator.js";

export function registerAllHandlers(io: Server): void {
  registerActivityLogger();
  registerNotificationCreator(io);
}
