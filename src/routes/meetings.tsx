import { useState, useEffect, useCallback } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { io, type Socket } from "socket.io-client";
import {
  Video,
  Mic,
  MicOff,
  Camera,
  CameraOff,
  Monitor,
  MonitorOff,
  PhoneOff,
  Phone,
  Users,
  MessageCircle,
  Send,
  Copy,
  Check,
  Plus,
} from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Layout } from "@/components/layout/Layout";
import { useMeetingStore } from "@/store/useMeetingStore";
import * as meetingsService from "@/services/meetings";
import { cn } from "@/lib/utils";

const SOCKET_BASE = (import.meta.env.VITE_API_URL ?? "http://localhost:4000").replace("/api", "");

function MeetingsPage() {
  const {
    meeting, participants, chatMessages, isJoined,
    localMic, localCamera, localScreenSharing,
    setMeeting, setParticipants, addParticipant, removeParticipant,
    setParticipantMedia, addChatMessage, setJoined,
    setLocalMic, setLocalCamera, setLocalScreenSharing, reset,
  } = useMeetingStore();

  const [view, setView] = useState<"lobby" | "room">("lobby");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [meetingCode, setMeetingCode] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [copied, setCopied] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [error, setError] = useState<string | null>(null);

  const token = typeof window !== "undefined" ? localStorage.getItem("hellow_token") : null;

  // Connect socket
  useEffect(() => {
    if (!token || !meetingCode || !isJoined) return;
    const s = io(`${SOCKET_BASE}/meetings`, {
      auth: { token },
      transports: ["websocket", "polling"],
    });

    s.on("connect", () => {
      s.emit("meeting:join", { code: meetingCode }, (ack: any) => {
        if (ack?.error) setError(ack.error);
      });
    });

    s.on("meeting:participants", (ids: string[]) => {
      setParticipants(ids);
    });

    s.on("meeting:participant_joined", (userId: string) => {
      addParticipant(userId);
    });

    s.on("meeting:participant_left", (userId: string) => {
      removeParticipant(userId);
    });

    s.on("meeting:media-state", (data: { userId: string; mic: boolean; camera: boolean }) => {
      setParticipantMedia(data.userId, { mic: data.mic, camera: data.camera });
    });

    s.on("meeting:speaking", (data: { userId: string; speaking: boolean }) => {
      setParticipantMedia(data.userId, { speaking: data.speaking });
    });

    s.on("meeting:chat", (data: { userId: string; content: string; timestamp: string }) => {
      addChatMessage(data);
    });

    setSocket(s);
    return () => { s.disconnect(); };
  }, [token, meetingCode, isJoined]);

  function handleMediaChange(type: "mic" | "camera", value: boolean) {
    if (type === "mic") setLocalMic(value);
    else setLocalCamera(value);
    socket?.emit("meeting:media-state", {
      mic: type === "mic" ? value : localMic,
      camera: type === "camera" ? value : localCamera,
    });
  }

  function toggleScreenShare() {
    const next = !localScreenSharing;
    setLocalScreenSharing(next);
    socket?.emit("meeting:screen-share", { sharing: next });
  }

  function handleCreate() {
    setError(null);
    meetingsService.createMeeting(name || undefined).then((m) => {
      setMeeting(m);
      setMeetingCode(m.code);
      setJoined(true);
      setView("room");
    }).catch(() => setError("Failed to create meeting"));
  }

  function handleJoin() {
    setError(null);
    if (!code.trim()) { setError("Enter a meeting code"); return; }
    meetingsService.joinMeeting(code.trim().toUpperCase()).then((m) => {
      setMeeting(m);
      setMeetingCode(m.code);
      setJoined(true);
      setView("room");
    }).catch(() => setError("Meeting not found or has ended"));
  }

  function handleLeave() {
    if (meetingCode) meetingsService.leaveMeeting(meetingCode);
    socket?.disconnect();
    reset();
    setView("lobby");
    setMeetingCode(null);
  }

  function handleEnd() {
    if (meetingCode) meetingsService.endMeeting(meetingCode);
    socket?.disconnect();
    reset();
    setView("lobby");
    setMeetingCode(null);
  }

  function handleSendChat() {
    if (!chatInput.trim() || !socket || !meetingCode) return;
    socket.emit("meeting:chat", { content: chatInput.trim() });
    setChatInput("");
  }

  function handleMuteAll() {
    socket?.emit("meeting:mute-all");
  }

  function copyCode() {
    if (meetingCode) {
      navigator.clipboard.writeText(meetingCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  if (view === "room" && meetingCode) {
    return (
      <div className="h-full flex flex-col bg-background">
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 h-12 bg-surface border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground/80">{meeting?.name ?? "Meeting"}</span>
            <button
              onClick={copyCode}
              className="flex items-center gap-1 h-7 px-2 rounded-lg bg-accent text-muted-foreground text-xs hover:bg-accent/70 transition"
            >
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              {meetingCode}
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowChat(!showChat)}
              className={cn("h-8 w-8 grid place-items-center rounded-lg transition", showChat ? "bg-primary/10 text-primary" : "bg-accent text-muted-foreground hover:bg-accent/70")}
            >
              <MessageCircle className="h-4 w-4" />
            </button>
            <span className="text-xs text-muted-foreground">{participants.length} in room</span>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Grid */}
          <div className={cn("flex-1 p-3 grid gap-3 auto-rows-[1fr]", showChat ? "grid-cols-2" : "grid-cols-3")}>
            {participants.map((p) => (
              <div
                key={p.id}
                className={cn(
                  "relative rounded-2xl bg-muted flex items-center justify-center overflow-hidden",
                  p.speaking && "ring-2 ring-primary/30",
                )}
              >
                <div className="h-16 w-16 rounded-full bg-accent flex items-center justify-center">
                  <span className="text-2xl font-bold text-muted-foreground">
                    {p.id.slice(0, 2).toUpperCase()}
                  </span>
                </div>

                <div className="absolute bottom-2 left-2 right-2 flex items-center gap-1.5">
                  <span className="text-xs text-foreground/70 bg-background/80 px-2 py-0.5 rounded-full truncate shadow-soft">
                    {p.id === "you" ? "You" : `User ${p.id.slice(0, 4)}`}
                  </span>
                  <div className="flex gap-1 ml-auto">
                    {!p.mic && <MicOff className="h-3 w-3 text-destructive" />}
                    {!p.camera && <CameraOff className="h-3 w-3 text-destructive" />}
                    {p.screenSharing && <Monitor className="h-3 w-3 text-primary" />}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Chat sidebar */}
          {showChat && (
            <div className="w-72 shrink-0 border-l border-border bg-surface flex flex-col">
              <div className="p-3 border-b border-border">
                <span className="text-xs font-semibold text-muted-foreground">Meeting Chat</span>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {chatMessages.map((msg, i) => (
                  <div key={i} className="text-sm">
                    <span className="text-muted-foreground text-xs">{msg.userId.slice(0, 4)}: </span>
                    <span className="text-foreground/80">{msg.content}</span>
                  </div>
                ))}
              </div>
              <div className="p-3 border-t border-border flex gap-2">
                <input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendChat()}
                  placeholder="Type a message..."
                  className="flex-1 h-8 rounded-lg bg-background border border-border px-3 text-xs text-foreground outline-none placeholder:text-muted-foreground/50"
                />
                <button
                  onClick={handleSendChat}
                  className="h-8 w-8 grid place-items-center rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-3 h-16 bg-surface border-t border-border shrink-0">
          <button
            onClick={() => handleMediaChange("mic", !localMic)}
            className={cn(
              "h-10 w-10 grid place-items-center rounded-full transition",
              localMic ? "bg-accent text-foreground hover:bg-accent/70" : "bg-destructive text-destructive-foreground",
            )}
          >
            {localMic ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
          </button>
          <button
            onClick={() => handleMediaChange("camera", !localCamera)}
            className={cn(
              "h-10 w-10 grid place-items-center rounded-full transition",
              localCamera ? "bg-accent text-foreground hover:bg-accent/70" : "bg-destructive text-destructive-foreground",
            )}
          >
            {localCamera ? <Camera className="h-4 w-4" /> : <CameraOff className="h-4 w-4" />}
          </button>
          <button
            onClick={toggleScreenShare}
            className={cn(
              "h-10 w-10 grid place-items-center rounded-full transition",
              localScreenSharing ? "bg-primary text-primary-foreground" : "bg-accent text-foreground hover:bg-accent/70",
            )}
          >
            {localScreenSharing ? <MonitorOff className="h-4 w-4" /> : <Monitor className="h-4 w-4" />}
          </button>
          <button
            onClick={handleMuteAll}
            className="h-10 w-10 grid place-items-center rounded-full bg-accent text-foreground hover:bg-accent/70 transition"
            title="Mute all"
          >
            <MicOff className="h-4 w-4" />
          </button>
          <button
            onClick={handleEnd}
            className="h-10 px-4 rounded-full bg-destructive text-destructive-foreground text-sm font-medium hover:opacity-90 transition"
          >
            End
          </button>
          <button
            onClick={handleLeave}
            className="h-10 w-10 grid place-items-center rounded-full bg-destructive/80 text-destructive-foreground hover:bg-destructive transition"
          >
            <PhoneOff className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  // Lobby view
  return (
    <div className="max-w-lg mx-auto mt-16 space-y-8">
      <div className="text-center">
        <Video className="h-10 w-10 text-primary/40 mx-auto mb-3" />
        <h1 className="text-2xl font-semibold tracking-tight">Meetings</h1>
        <p className="text-sm text-foreground/50 mt-1">Start or join a video meeting</p>
      </div>

      {/* Create */}
      <div className="rounded-2xl bg-surface border border-border p-5 space-y-3">
        <h2 className="text-sm font-semibold">Create a Meeting</h2>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Meeting name (optional)"
          className="w-full h-9 rounded-xl border border-border bg-background px-4 text-sm outline-none focus:border-primary/40 transition"
        />
        <button
          onClick={handleCreate}
          className="flex items-center justify-center gap-2 w-full h-10 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition"
        >
          <Plus className="h-4 w-4" /> Create Meeting
        </button>
      </div>

      {/* Join */}
      <div className="rounded-2xl bg-surface border border-border p-5 space-y-3">
        <h2 className="text-sm font-semibold">Join a Meeting</h2>
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Enter meeting code"
          maxLength={6}
          className="w-full h-9 rounded-xl border border-border bg-background px-4 text-sm tracking-widest font-mono uppercase outline-none focus:border-primary/40 transition"
        />
        <button
          onClick={handleJoin}
          className="flex items-center justify-center gap-2 w-full h-10 rounded-xl border border-border text-sm font-medium hover:bg-accent transition"
        >
          <Phone className="h-4 w-4" /> Join Meeting
        </button>
      </div>

      {error && (
        <div className="text-center">
          <p className="text-xs text-red-500 bg-red-500/10 rounded-lg px-3 py-2 inline-block">{error}</p>
        </div>
      )}
    </div>
  );
}

export const Route = createFileRoute("/meetings")({
  component: () => (
    <ProtectedRoute>
      <Layout>
        <MeetingsPage />
      </Layout>
    </ProtectedRoute>
  ),
});
