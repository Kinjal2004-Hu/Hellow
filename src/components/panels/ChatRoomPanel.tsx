import { useState, useRef, useEffect } from "react";
import { X, Hash, User, Send, Loader2, Trash2, Shield, ShieldOff, LogOut } from "lucide-react";
import { useChatStore } from "@/store/useChatStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useUIStore } from "@/store/useUIStore";
import { cn } from "@/lib/utils";
import { useMountTransition } from "@/hooks/useMountTransition";
import { useMessagesQuery, useMembersQuery, useKickMutation, usePromoteMutation } from "@/hooks/useChatMutations";
import { useChatSocket } from "@/hooks/useChatSocket";
import { checkResourcePermission } from "@/lib/permissions";

export function ChatRoomPanel() {
  const activeRoomId = useChatStore((s) => s.activeRoomId);
  const rooms = useChatStore((s) => s.rooms);
  const messages = useChatStore((s) => s.messages);
  const typingUsers = useChatStore((s) => s.typingUsers);
  const onlineUsers = useChatStore((s) => s.onlineUsers);
  const setActiveRoom = useChatStore((s) => s.setActiveRoom);
  const markRead = useChatStore((s) => s.markRead);
  const closePanel = useUIStore((s) => s.closePanel);
  const currentUser = useAuthStore((s) => s.user);

  const room = rooms.find((r) => r._id === activeRoomId);
  const { data: fetchedMessages, isLoading: loadingMsgs } = useMessagesQuery(activeRoomId);
  const { data: members } = useMembersQuery(room?.role === "owner" || room?.role === "admin" ? activeRoomId : null);
  const { sendMessage, emitTyping } = useChatSocket();

  const [input, setInput] = useState("");
  const typingTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showMembers, setShowMembers] = useState(false);

  const roomMessages = activeRoomId ? messages[activeRoomId] ?? [] : [];
  const typers = activeRoomId ? typingUsers[activeRoomId] ?? [] : [];
  const online = activeRoomId ? onlineUsers[activeRoomId] ?? [] : [];

  const canDelete = room && currentUser
    ? checkResourcePermission({ roles: { [currentUser._id]: room.role ?? "" } }, currentUser._id, "room:delete", "room")
    : false;
  const canKick = room && currentUser
    ? checkResourcePermission({ roles: { [currentUser._id]: room.role ?? "" } }, currentUser._id, "room:kick_member", "room")
    : false;
  const canPromote = room && currentUser
    ? checkResourcePermission({ roles: { [currentUser._id]: room.role ?? "" } }, currentUser._id, "room:promote_member", "room")
    : false;

  const { mutate: doKick } = useKickMutation();
  const { mutate: doPromote } = usePromoteMutation();
  const { mounted, animatingIn } = useMountTransition(!!(activeRoomId && room), 300);

  useEffect(() => {
    if (activeRoomId) markRead(activeRoomId);
  }, [activeRoomId, markRead]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [roomMessages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !activeRoomId) return;
    const tempId = `${Date.now()}-${crypto.randomUUID()}`;
    const optimistic = {
      _id: tempId,
      tempId,
      roomId: activeRoomId,
      senderId: currentUser?._id ?? "unknown",
      senderName: currentUser?.username ?? "You",
      content: input.trim(),
      createdAt: new Date().toISOString(),
    };
    useChatStore.getState().optimisticSend(optimistic);
    sendMessage(activeRoomId, input.trim(), tempId);
    setInput("");
  };

  const handleTyping = (val: string) => {
    setInput(val);
    if (!activeRoomId) return;
    emitTyping(activeRoomId, true);
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      emitTyping(activeRoomId, false);
    }, 2000);
  };

  if (!mounted || !room) return null;

  return (
    <div
      className={cn(
        "fixed top-[68px] bottom-0 right-14 z-40 w-[420px] bg-surface border-l border-border shadow-pop",
        "flex flex-col",
        animatingIn ? "animate-slide-in-right" : "animate-slide-out-right",
      )}
    >
      <div className="flex items-center justify-between px-4 h-14 border-b border-border shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          {room.kind === "dm" ? (
            <User className="h-4 w-4 text-muted-foreground shrink-0" />
          ) : (
            <Hash className="h-4 w-4 text-muted-foreground shrink-0" />
          )}
          <span className="font-semibold text-sm truncate">{room.name}</span>
          <span className="text-[11px] text-muted-foreground capitalize px-1.5 py-0.5 rounded-full bg-muted shrink-0">
            {room.category}
          </span>
          {room.role && (
            <span className="text-[11px] font-medium text-primary/70 capitalize shrink-0">
              {room.role}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {canDelete && (
            <button
              onClick={() => useChatStore.getState().removeRoom(room._id)}
              className="h-8 w-8 grid place-items-center rounded-full text-destructive/60 hover:text-destructive hover:bg-destructive/10 transition active:scale-95 shrink-0"
              title="Delete room"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={() => {
              setActiveRoom(null);
              closePanel("youtube");
            }}
            className="h-8 w-8 grid place-items-center rounded-full text-foreground/60 hover:bg-accent hover:text-foreground transition active:scale-95 shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4">
        {loadingMsgs ? (
          <div className="h-full flex items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : roomMessages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-sm text-muted-foreground animate-fade-in">
              No messages yet. Say hi!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {roomMessages.map((msg) => {
              const isMe = msg.senderId === currentUser?._id;
              return (
                <div
                  key={msg._id || msg.tempId}
                  className={cn(
                    "flex flex-col max-w-[85%] animate-fade-slide-up",
                    isMe ? "items-end self-end ml-auto" : "items-start",
                    msg.pending && "opacity-50",
                  )}
                >
                  {!isMe && msg.senderName && (
                    <span className="text-[11px] font-medium text-foreground/60 mb-0.5 px-1">
                      {msg.senderName}
                    </span>
                  )}
                  <div
                    className={cn(
                      "rounded-2xl px-3 py-2 text-sm",
                      isMe ? "bg-primary text-primary-foreground" : "bg-muted",
                    )}
                  >
                    {msg.content}
                  </div>
                  <span className="text-[11px] text-muted-foreground mt-1 px-1">
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    {msg.pending && " · sending..."}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {typers.length > 0 && (
          <div className="mt-2 text-[12px] text-muted-foreground italic animate-fade-in">
            {typers.length === 1 ? "Someone is typing..." : `${typers.length} people are typing...`}
          </div>
        )}
      </div>

      <div className="border-t border-border p-3 shrink-0">
        <form onSubmit={handleSend} className="flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => handleTyping(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 h-9 px-3 rounded-full bg-background border border-border text-sm outline-none transition-shadow duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] focus:ring-2 focus:ring-ring/30 placeholder:text-muted-foreground/60"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="h-9 w-9 grid place-items-center rounded-full bg-primary text-primary-foreground transition hover:opacity-90 active:scale-95 disabled:opacity-40 shrink-0"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
