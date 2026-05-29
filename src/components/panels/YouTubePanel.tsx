import { useState, useEffect, useRef, useCallback } from "react";
import { X, Play, Users, Pause, Monitor, SkipBack, SkipForward } from "lucide-react";
import { io, type Socket } from "socket.io-client";
import { useUIStore } from "@/store/useUIStore";
import { useYouTubeStore } from "@/store/useYouTubeStore";
import { cn } from "@/lib/utils";
import { useMountTransition } from "@/hooks/useMountTransition";
import * as youtubeService from "@/services/youtube";

const SOCKET_BASE = (import.meta.env.VITE_API_URL ?? "http://localhost:4000").replace("/api", "");

export function YouTubePanel() {
  const open = useUIStore((s) => s.panels.youtube);
  const closePanel = useUIStore((s) => s.closePanel);
  const openPanel = useUIStore((s) => s.openPanel);
  const {
    videoId, isPlaying, currentTime, participants, roomCode, groupWatch, chatMessages,
    setVideo, setPlaying, setCurrentTime, setGroupWatch, setParticipants, addChatMessage, reset,
  } = useYouTubeStore();
  const [url, setUrl] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [powerToAll, setPowerToAll] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const playerRef = useRef<HTMLIFrameElement>(null);
  const syncTimerRef = useRef<number>(0);

  const { mounted, animatingIn } = useMountTransition(open, 300);

  const token = typeof window !== "undefined" ? localStorage.getItem("hellow_token") : null;

  // Connect to YouTube sync socket
  useEffect(() => {
    if (!token || !groupWatch || !roomCode) return;
    const s = io(`${SOCKET_BASE}/youtube`, {
      auth: { token },
      transports: ["websocket", "polling"],
    });

    s.on("connect", () => {
      s.emit("youtube:join", { roomCode });
    });

    s.on("youtube:state", (state: any) => {
      if (state.videoId && state.videoId !== videoId) {
        setVideo(state.videoId);
      }
      setPlaying(state.isPlaying);
      setCurrentTime(state.currentTime);
    });

    s.on("youtube:play", (data: any) => {
      if (data.videoId && data.videoId !== videoId) setVideo(data.videoId);
      setPlaying(true);
      if (data.currentTime !== undefined) setCurrentTime(data.currentTime);
    });

    s.on("youtube:pause", (data: any) => {
      setPlaying(false);
      if (data.currentTime !== undefined) setCurrentTime(data.currentTime);
    });

    s.on("youtube:seek", (data: any) => {
      setCurrentTime(data.currentTime);
    });

    s.on("youtube:rate", (data: any) => {
      // playback rate change
    });

    s.on("youtube:load-video", (data: any) => {
      setVideo(data.videoId);
      setPlaying(false);
      setCurrentTime(0);
    });

    s.on("youtube:participant_count", (count: number) => {
      setParticipants(count);
    });

    s.on("youtube:power-to-all", (data: any) => {
      setPowerToAll(data.enabled);
    });

    socketRef.current = s;
    return () => { s.disconnect(); };
  }, [token, groupWatch, roomCode]);

  // Periodic drift sync
  useEffect(() => {
    if (!isPlaying || !socketRef.current || !roomCode) return;
    const interval = setInterval(() => {
      socketRef.current?.emit("youtube:drift", { currentTime });
    }, 5000);
    return () => clearInterval(interval);
  }, [isPlaying, currentTime, roomCode]);

  const loadVideo = useCallback(() => {
    const match = url.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    );
    const id = match?.[1] ?? url.trim();
    if (id.length === 11) {
      setVideo(id);
      setPlaying(false);
      socketRef.current?.emit("youtube:load-video", { videoId: id });
    }
  }, [url, setVideo, setPlaying]);

  const togglePlay = useCallback(() => {
    if (!videoId) return;
    if (isPlaying) {
      setPlaying(false);
      socketRef.current?.emit("youtube:pause", { currentTime });
    } else {
      setPlaying(true);
      socketRef.current?.emit("youtube:play", { currentTime });
    }
  }, [videoId, isPlaying, currentTime, setPlaying]);

  const seekTo = useCallback((time: number) => {
    setCurrentTime(time);
    socketRef.current?.emit("youtube:seek", { currentTime: time });
  }, [setCurrentTime]);

  const toggleGroupWatch = async () => {
    if (groupWatch) {
      socketRef.current?.disconnect();
      setGroupWatch(null);
      setPowerToAll(false);
    } else {
      try {
        const room = await youtubeService.createYouTubeRoom();
        setGroupWatch(room.code);
      } catch {
        const code = Math.floor(1000 + Math.random() * 9000).toString();
        setGroupWatch(code);
      }
    }
  };

  // YouTube iframe URL with JS API
  const embedUrl = videoId
    ? `https://www.youtube.com/embed/${videoId}?enablejsapi=1&autoplay=${isPlaying ? 1 : 0}&origin=${window.location.origin}`
    : "";

  if (!mounted) return null;

  return (
    <div
      className={cn(
        "fixed top-[68px] bottom-0 right-[72px] z-40 w-[420px] bg-surface border-l border-border shadow-pop",
        "flex flex-col",
        animatingIn ? "animate-slide-in-right" : "animate-slide-out-right",
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-14 border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          <Play className="h-4 w-4 text-red-500 fill-red-500" />
          <span className="font-semibold text-sm">YouTube</span>
          {groupWatch && (
            <span className="flex items-center gap-1 text-[11px] text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
              <Users className="h-3 w-3" />
              {participants + 1}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowChat(!showChat)}
            className="h-8 w-8 grid place-items-center rounded-full text-foreground/60 hover:bg-accent hover:text-foreground transition"
          >
            <Users className="h-4 w-4" />
          </button>
          <button
            onClick={() => closePanel("youtube")}
            className="h-8 w-8 grid place-items-center rounded-full text-foreground/60 hover:bg-accent hover:text-foreground transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Player */}
        {videoId ? (
          <div className="aspect-video bg-black relative">
            <iframe
              ref={playerRef}
              src={embedUrl}
              className="w-full h-full"
              allow="autoplay; encrypted-media"
              allowFullScreen
              title="YouTube player"
            />
            {/* Sync overlay controls */}
            <div className="absolute bottom-2 left-2 right-2 flex items-center justify-center gap-2 opacity-0 hover:opacity-100 transition">
              <button onClick={togglePlay} className="h-8 w-8 rounded-full bg-black/60 text-white grid place-items-center hover:bg-black/80">
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </button>
            </div>
          </div>
        ) : (
          <div className="aspect-video bg-muted grid place-items-center">
            <Play className="h-10 w-10 text-muted-foreground/40" />
          </div>
        )}

        <div className="p-4 space-y-3">
          {/* URL input */}
          <div className="flex items-center gap-2">
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && loadVideo()}
              placeholder="Paste YouTube URL or video ID"
              className="flex-1 h-9 px-3 rounded-full bg-background border border-border text-sm outline-none transition-shadow focus:ring-2 focus:ring-ring/30 placeholder:text-muted-foreground/60"
            />
            <button
              onClick={loadVideo}
              className="h-9 px-4 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition shrink-0"
            >
              Load
            </button>
          </div>

          {/* Join room by code */}
          <div className="flex items-center gap-2">
            <input
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              placeholder="Enter room code to join"
              className="flex-1 h-9 px-3 rounded-full bg-background border border-border text-sm outline-none transition-shadow"
            />
            <button
              onClick={async () => {
                if (!joinCode.trim()) return;
                try {
                  const room = await youtubeService.fetchYouTubeRoom(joinCode.trim());
                  setGroupWatch(room.code);
                } catch {
                  // fallback: set group watch to raw code
                  setGroupWatch(joinCode.trim());
                }
                openPanel("youtube");
              }}
              className="h-9 px-4 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition shrink-0"
            >
              Join
            </button>
          </div>

          {/* Playback controls */}
          {videoId && (
            <div className="flex items-center justify-center gap-3">
              <button onClick={() => seekTo(Math.max(0, currentTime - 10))} className="h-8 w-8 grid place-items-center rounded-full hover:bg-accent transition">
                <SkipBack className="h-4 w-4" />
              </button>
              <button
                onClick={togglePlay}
                className="h-10 w-10 grid place-items-center rounded-full bg-primary text-primary-foreground hover:opacity-90 transition"
              >
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              </button>
              <button onClick={() => seekTo(Math.min(1e6, currentTime + 10))} className="h-8 w-8 grid place-items-center rounded-full hover:bg-accent transition">
                <SkipForward className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Group watch */}
          <div className="flex items-center justify-between">
            <button
              onClick={toggleGroupWatch}
              className={cn(
                "h-8 px-3 rounded-full text-xs font-medium transition active:scale-95",
                groupWatch
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-muted text-muted-foreground border border-border hover:bg-accent",
              )}
            >
              {groupWatch ? `Group watch ON · ${roomCode}` : "Group watch OFF"}
            </button>
            {groupWatch && (
              <button
                onClick={() => setPowerToAll(!powerToAll)}
                className={cn(
                  "h-7 px-2.5 rounded-full text-[10px] font-medium transition",
                  powerToAll ? "bg-amber-50 text-amber-700 border border-amber-200" : "bg-muted text-muted-foreground border border-border",
                )}
              >
                {powerToAll ? "Power To All ON" : "Host only"}
              </button>
            )}
          </div>

          {/* Chat */}
          {showChat && groupWatch && (
            <div className="rounded-xl bg-background border border-border p-3 space-y-2 max-h-48 overflow-y-auto">
              {chatMessages.length === 0 && (
                <p className="text-xs text-foreground/40 text-center py-4">No messages yet</p>
              )}
              {chatMessages.map((msg, i) => (
                <div key={i} className="text-sm">
                  <span className="text-xs text-foreground/40">{msg.username}: </span>
                  <span className="text-foreground/80">{msg.content}</span>
                </div>
              ))}
              <div className="flex gap-2 pt-1">
                <input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && chatInput.trim()) {
                      socketRef.current?.emit("youtube:chat", { content: chatInput.trim() });
                      setChatInput("");
                    }
                  }}
                  placeholder="Chat..."
                  className="flex-1 h-8 rounded-lg bg-surface border border-border px-3 text-xs outline-none"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
