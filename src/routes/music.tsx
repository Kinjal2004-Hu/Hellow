import { useState, useEffect, useRef } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { io, type Socket } from "socket.io-client";
import {
  Music,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Plus,
  Trash2,
  Users,
  Copy,
  Check,
  ListMusic,
  LogOut,
  Speaker,
} from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Layout } from "@/components/layout/Layout";
import { useMusicStore } from "@/store/useMusicStore";
import * as musicService from "@/services/music";
import type { MusicTrack } from "@/services/music";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/store/useUIStore";
import { useYouTubeStore } from "@/store/useYouTubeStore";
import * as youtubeService from "@/services/youtube";

function YouTubeAction() {
  const openPanel = useUIStore((s) => s.openPanel);
  const setGroupWatch = useYouTubeStore((s) => s.setGroupWatch);
  const [loading, setLoading] = useState(false);

  async function createAndOpen() {
    setLoading(true);
    try {
      const room = await youtubeService.createYouTubeRoom();
      setGroupWatch(room.code);
      openPanel("youtube");
    } catch {
      const code = Math.floor(1000 + Math.random() * 9000).toString();
      setGroupWatch(code);
      openPanel("youtube");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button onClick={() => openPanel("youtube")} className="h-9 px-3 rounded-full border border-border bg-background text-sm">YouTube</button>
      <button onClick={createAndOpen} disabled={loading} className="h-9 px-3 rounded-full bg-primary text-primary-foreground text-sm">{loading ? "Creating..." : "Create watch"}</button>
    </div>
  );
}

const SOCKET_BASE = (import.meta.env.VITE_API_URL ?? "http://localhost:4000").replace("/api", "");

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

const DEMO_TRACKS: MusicTrack[] = [
  { id: "1", title: "Blinding Lights", artist: "The Weeknd", albumArt: "", duration: 200 },
  { id: "2", title: "Shape of You", artist: "Ed Sheeran", albumArt: "", duration: 233 },
  { id: "3", title: "Bohemian Rhapsody", artist: "Queen", albumArt: "", duration: 354 },
  { id: "4", title: "Stairway to Heaven", artist: "Led Zeppelin", albumArt: "", duration: 482 },
  { id: "5", title: "Hotel California", artist: "Eagles", albumArt: "", duration: 391 },
];

function MusicPage() {
  const {
    room, isPlaying, position, powerToAll, isJoined,
    setRoom, setIsPlaying, setPosition, setPowerToAll, setJoined, updateQueue, reset,
  } = useMusicStore();

  const [view, setView] = useState<"lobby" | "room">("lobby");
  const [code, setCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const socketRef = useRef<Socket | null>(null);
  const token = typeof window !== "undefined" ? localStorage.getItem("hellow_token") : null;
  const progressInterval = useRef<number>(0);

  // Connect music socket
  useEffect(() => {
    if (!token || !room?.code || !isJoined) return;
    const s = io(`${SOCKET_BASE}/music`, {
      auth: { token },
      transports: ["websocket", "polling"],
    });

    s.on("connect", () => {
      s.emit("music:join", { roomCode: room.code }, (ack: any) => {
        if (ack?.error) setError(ack.error);
      });
    });

    s.on("music:play", () => setIsPlaying(true));
    s.on("music:pause", () => setIsPlaying(false));
    s.on("music:seek", (data: { position: number }) => setPosition(data.position));
    s.on("music:track-change", (data: { currentTrack: MusicTrack | null; queue: MusicTrack[]; position: number }) => {
      updateQueue(data.queue, data.currentTrack);
      setPosition(data.position);
    });
    s.on("music:queue-update", (data: { queue: MusicTrack[]; currentTrack: MusicTrack | null }) => {
      updateQueue(data.queue, data.currentTrack);
    });
    s.on("music:power-to-all", (data: { enabled: boolean }) => setPowerToAll(data.enabled));

    socketRef.current = s;
    return () => { s.disconnect(); };
  }, [token, room?.code, isJoined]);

  // Progress ticker
  useEffect(() => {
    if (!isPlaying) {
      clearInterval(progressInterval.current);
      return;
    }
    progressInterval.current = window.setInterval(() => {
      setPosition(position + 1);
    }, 1000);
    return () => clearInterval(progressInterval.current);
  }, [isPlaying, position]);

  function handleCreate() {
    setError(null);
    musicService.createMusicRoom().then((r) => {
      setRoom(r);
      setJoined(true);
      setView("room");
    }).catch(() => setError("Failed to create room"));
  }

  function handleJoin() {
    setError(null);
    if (!code.trim()) { setError("Enter a room code"); return; }
    musicService.joinMusicRoom(code.trim().toUpperCase()).then((r) => {
      setRoom(r);
      setJoined(true);
      setView("room");
    }).catch(() => setError("Room not found"));
  }

  function handleLeave() {
    if (room?.code) musicService.leaveMusicRoom(room.code);
    socketRef.current?.disconnect();
    reset();
    setView("lobby");
  }

  function togglePlay() {
    if (!socketRef.current) return;
    if (isPlaying) {
      socketRef.current.emit("music:pause");
    } else {
      socketRef.current.emit("music:play");
    }
  }

  function handleSkip() {
    if (room?.code) {
      musicService.skipTrack(room.code);
      socketRef.current?.emit("music:skip");
    }
  }

  function handleAddToQueue(track: MusicTrack) {
    if (room?.code) {
      musicService.addToQueue(room.code, track).then((r) => {
        setRoom(r);
        socketRef.current?.emit("music:queue-update");
      });
    }
  }

  function handleRemoveFromQueue(index: number) {
    if (room?.code) {
      musicService.removeFromQueue(room.code, index).then((r) => {
        setRoom(r);
        socketRef.current?.emit("music:queue-update");
      });
    }
  }

  function handleClearQueue() {
    if (room?.code) {
      musicService.clearQueue(room.code).then((r) => {
        setRoom(r);
        socketRef.current?.emit("music:queue-update");
      });
    }
  }

  function togglePowerToAll() {
    if (!socketRef.current) return;
    const next = !powerToAll;
    setPowerToAll(next);
    socketRef.current.emit("music:power-to-all", { enabled: next });
  }

  function copyCode() {
    if (room?.code) {
      navigator.clipboard.writeText(room.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  const filteredDemo = DEMO_TRACKS.filter(
    (t) =>
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.artist.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (view === "room" && room) {
    return (
      <div className="h-full flex flex-col">
        {/* Top: room code + copy link */}
        <div className="flex items-center justify-between px-6 py-4 shrink-0">
          <div>
            <div className="text-xs text-foreground/50">ROOM CODE</div>
            <div className="text-2xl font-bold tracking-wide">{room.code}</div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={copyCode} className="px-4 py-2 rounded-full border border-border bg-surface shadow-soft flex items-center gap-2"> 
              <Copy className="h-4 w-4" /> Copy link
            </button>
            <YouTubeAction />
          </div>
        </div>

        {/* PTA banner */}
        <div className="mx-6">
          <div className="rounded-xl p-4 bg-emerald-50 border border-emerald-100 flex items-center justify-between">
            <div>
              <div className="font-medium">Power to All — anyone can control playback</div>
              <div className="text-sm text-foreground/50">Everyone in the room can play, pause, change song, seek and set volume.</div>
            </div>
            <div>
              <button onClick={togglePowerToAll} className={cn("px-3 py-2 rounded-full text-sm font-medium", powerToAll ? "bg-emerald-600 text-white" : "bg-surface")}>{powerToAll ? "On" : "Off"}</button>
            </div>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden px-6 py-6 gap-6">
          {/* Main card */}
          <div className="flex-1 rounded-2xl bg-surface border border-border shadow-card p-6 flex flex-col gap-6">
            <div className="flex gap-6">
              <div className="w-48 h-48 rounded-xl bg-accent/40 shadow-soft flex-shrink-0" />
              <div className="flex-1">
                <div className="text-xs text-foreground/50">NOW PLAYING</div>
                <h2 className="text-3xl font-bold mt-2">{room.currentTrack?.title ?? "—"}</h2>
                <p className="text-sm text-foreground/50 mt-1">{room.currentTrack?.artist ?? ""}</p>

                <div className="mt-6">
                  <div className="h-1.5 bg-border rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${(position / (room.currentTrack?.duration || 1)) * 100}%` }} />
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="text-xs text-foreground/50">{formatDuration(position)}</div>
                    <div className="text-xs text-foreground/50">{formatDuration(room.currentTrack?.duration ?? 0)}</div>
                  </div>
                </div>

                <div className="flex items-center gap-4 mt-6">
                  <button onClick={() => socketRef.current?.emit("music:seek", { position: Math.max(0, position - 10) })} className="h-10 w-10 grid place-items-center rounded-full border border-border hover:bg-accent transition"><SkipBack className="h-5 w-5" /></button>
                  <button onClick={togglePlay} className="h-14 w-14 grid place-items-center rounded-full bg-foreground text-white"><Play className="h-6 w-6" /></button>
                  <button onClick={() => socketRef.current?.emit("music:seek", { position: position + 10 })} className="h-10 w-10 grid place-items-center rounded-full border border-border hover:bg-accent transition"><SkipForward className="h-5 w-5" /></button>
                  <div className="ml-6 flex items-center gap-3">
                    <Speaker className="h-5 w-5" />
                    <div className="h-2 w-24 bg-border rounded-full" />
                    <div className="text-xs text-foreground/50">85</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Queue list as cards */}
            <div>
              <div className="text-xs text-foreground/40 mb-2">QUEUE</div>
              <div className="grid grid-cols-2 gap-3">
                {room.queue.map((track) => (
                  <div key={track.id} className="queue-card flex items-center gap-3 p-3 rounded-xl border border-border bg-background">
                    <div className="h-12 w-12 rounded-md bg-accent/50" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{track.title}</p>
                      <p className="text-xs text-foreground/50">{track.artist}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Listeners panel */}
          <div className="w-80 shrink-0">
            <div className="rounded-2xl bg-surface border border-border p-4 shadow-soft">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-semibold">Listeners</div>
                <div className="text-xs text-foreground/50">{room.members.length}</div>
              </div>

              <div>
                {room.members.map((m, i) => (
                  <div key={m} className="p-3 rounded-lg bg-background mb-2 flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/20 grid place-items-center">{m[0].toUpperCase()}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{m}</div>
                      {i === 0 && <div className="text-xs text-amber-600">HOST</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Lobby
  return (
    <div className="max-w-lg mx-auto mt-16 space-y-8">
      <div className="text-center">
        <Music className="h-10 w-10 text-primary/40 mx-auto mb-3" />
        <h1 className="text-2xl font-semibold tracking-tight">Music Rooms</h1>
        <p className="text-sm text-foreground/50 mt-1">Listen together in sync</p>
      </div>

      <div className="rounded-2xl bg-surface border border-border p-5 space-y-3">
        <h2 className="text-sm font-semibold">Create a Room</h2>
        <button
          onClick={handleCreate}
          className="flex items-center justify-center gap-2 w-full h-10 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition"
        >
          <Plus className="h-4 w-4" /> Create Room
        </button>
      </div>

      <div className="rounded-2xl bg-surface border border-border p-5 space-y-3">
        <h2 className="text-sm font-semibold">Join a Room</h2>
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Enter room code"
          maxLength={6}
          className="w-full h-9 rounded-xl border border-border bg-background px-4 text-sm tracking-widest font-mono uppercase outline-none focus:border-primary/40 transition"
        />
        <button
          onClick={handleJoin}
          className="flex items-center justify-center gap-2 w-full h-10 rounded-xl border border-border text-sm font-medium hover:bg-accent transition"
        >
          <LogOut className="h-4 w-4" /> Join Room
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

export const Route = createFileRoute("/music")({
  component: () => (
    <ProtectedRoute>
      <Layout>
        <MusicPage />
      </Layout>
    </ProtectedRoute>
  ),
});
