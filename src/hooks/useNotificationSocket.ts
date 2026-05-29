import { useEffect } from "react";
import { io } from "socket.io-client";
import { useNotificationStore } from "@/store/useNotificationStore";
import { useAuthStore } from "@/store/useAuthStore";

const SOCKET_BASE = (import.meta.env.VITE_API_URL ?? "http://localhost:4000").replace("/api", "");

export function useNotificationSocket() {
  const addNotification = useNotificationStore((s) => s.addNotification);
  const setUnreadCount = useNotificationStore((s) => s.setUnreadCount);
  const token = useAuthStore((s) => s.token);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated || !token) return;

    const socket = io(`${SOCKET_BASE}/notifications`, {
      auth: { token },
      transports: ["websocket", "polling"],
    });

    socket.on("notification:new", (notification: any) => {
      addNotification(notification);
    });

    socket.on("notification:unread", (data: { count: number }) => {
      setUnreadCount(data.count);
    });

    return () => {
      socket.disconnect();
    };
  }, [isAuthenticated, token, addNotification, setUnreadCount]);
}
