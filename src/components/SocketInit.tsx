import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useSocketStore } from "@/store/useSocketStore";
import { useChatStore } from "@/store/useChatStore";
import { useRoomsQuery } from "@/hooks/useChatMutations";
import { useChatSocket } from "@/hooks/useChatSocket";
import { useNotificationSocket } from "@/hooks/useNotificationSocket";

export function SocketInit() {
  const token = useAuthStore((s) => s.token);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const connect = useSocketStore((s) => s.connect);
  const setRooms = useChatStore((s) => s.setRooms);
  const markReconnected = useChatStore((s) => s.markReconnected);

  const { data: rooms } = useRoomsQuery();

  useEffect(() => {
    if (isAuthenticated && token) {
      markReconnected();
      connect(token);
    }
  }, [isAuthenticated, token, connect, markReconnected]);

  useEffect(() => {
    if (rooms) setRooms(rooms);
  }, [rooms, setRooms]);

  useChatSocket();
  useNotificationSocket();

  return null;
}
