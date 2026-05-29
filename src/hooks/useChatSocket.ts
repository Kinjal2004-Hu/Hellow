import { useEffect, useRef, useCallback } from "react";
import { useSocketStore } from "@/store/useSocketStore";
import { useChatStore } from "@/store/useChatStore";
import { useAuthStore } from "@/store/useAuthStore";

export function useChatSocket() {
  const chatSocket = useSocketStore((s) => s.chatSocket);
  const isChatConnected = useSocketStore((s) => s.isChatConnected);
  const user = useAuthStore((s) => s.user);
  const initialized = useRef(false);

  const addMessage = useChatStore((s) => s.addMessage);
  const setTyping = useChatStore((s) => s.setTyping);
  const setOnlineUsers = useChatStore((s) => s.setOnlineUsers);
  const activeRoomId = useChatStore((s) => s.activeRoomId);

  useEffect(() => {
    if (!chatSocket || !isChatConnected || initialized.current) return;
    initialized.current = true;

    chatSocket.on("chat:message", (msg: any) => {
      addMessage({
        _id: msg._id,
        roomId: msg.roomId,
        senderId: msg.senderId,
        senderName: msg.senderName,
        content: msg.content,
        tempId: msg.tempId,
        createdAt: msg.createdAt,
      });
    });

    chatSocket.on("chat:typing", (data: { roomId: string; userId: string; isTyping: boolean }) => {
      if (data.userId !== user?._id) {
        setTyping(data.roomId, data.userId, data.isTyping);
      }
    });

    chatSocket.on("chat:presence", (data: { roomId: string; userIds: string[] }) => {
      setOnlineUsers(data.roomId, data.userIds);
    });

    return () => {
      chatSocket.off("chat:message");
      chatSocket.off("chat:typing");
      chatSocket.off("chat:presence");
      initialized.current = false;
    };
  }, [chatSocket, isChatConnected, addMessage, setTyping, setOnlineUsers, user?._id]);

  useEffect(() => {
    if (chatSocket?.connected && activeRoomId) {
      chatSocket.emit("chat:join_room", { roomId: activeRoomId }, (ack: any) => {});
      chatSocket.emit("chat:read", { roomId: activeRoomId });

      return () => {
        chatSocket.emit("chat:leave_room", { roomId: activeRoomId });
      };
    }
  }, [chatSocket, activeRoomId]);

  const sendMessage = useCallback(
    (roomId: string, content: string, tempId: string) => {
      chatSocket?.emit("chat:send", { roomId, content, tempId }, (ack: any) => {});
    },
    [chatSocket],
  );

  const emitTyping = useCallback(
    (roomId: string, isTyping: boolean) => {
      chatSocket?.emit("chat:typing", { roomId, isTyping });
    },
    [chatSocket],
  );

  const markRead = useCallback(
    (roomId: string) => {
      chatSocket?.emit("chat:read", { roomId });
    },
    [chatSocket],
  );

  return { sendMessage, emitTyping, markRead, isChatConnected };
}
