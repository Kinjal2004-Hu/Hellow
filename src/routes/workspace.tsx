import { useState, useEffect, useCallback } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Globe, Users, Copy, Check, Plus, Share2, Link,
  ToggleLeft, ToggleRight, Hand, MapPin, Bookmark,
  PanelRight, PanelRightOpen, ArrowLeft, Loader2, X,
} from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Layout } from "@/components/layout/Layout";
import { WorkspaceSyncProvider } from "@/components/collab/WorkspaceSyncProvider";
import { PresenceOverlay, PresenceIndicator } from "@/components/collab/PresenceOverlay";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";
import { useUIStore } from "@/store/useUIStore";
import { cn } from "@/lib/utils";
import * as workspaceService from "@/services/workspace";

function WorkspacePage() {
  const navigate = useNavigate();
  const showToast = useUIStore((s) => s.showToast);

  const {
    session, members, sharedState, followMode, isJoined,
    setSession, setMembers, setFollowMode, setJoined, reset,
    addMember, removeMember, setSharedState,
  } = useWorkspaceStore();

  const [view, setView] = useState<"lobby" | "room">("lobby");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [sessionCode, setSessionCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showShare, setShowShare] = useState(false);

  async function handleCreate() {
    setError(null);
    try {
      const s = await workspaceService.createSession(name || undefined);
      setSession(s);
      setSessionCode(s.code);
      setJoined(true);
      setView("room");
    } catch {
      setError("Failed to create workspace");
    }
  }

  async function handleJoin() {
    setError(null);
    if (!code.trim()) { setError("Enter a session code"); return; }
    try {
      const s = await workspaceService.joinSession(code.trim().toUpperCase());
      setSession(s);
      setSessionCode(s.code);
      setJoined(true);
      setView("room");
    } catch {
      setError("Workspace not found or ended");
    }
  }

  async function handleLeave() {
    if (sessionCode) workspaceService.leaveSession(sessionCode);
    reset();
    setView("lobby");
    setSessionCode(null);
  }

  async function handleEnd() {
    if (sessionCode) workspaceService.endSession(sessionCode);
    reset();
    setView("lobby");
    setSessionCode(null);
    showToast("Workspace ended", "success");
  }

  function copyCode() {
    if (sessionCode) {
      navigator.clipboard.writeText(sessionCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      showToast("Code copied", "success");
    }
  }

  function copyShareLink() {
    if (sessionCode) {
      const link = `${window.location.origin}/workspace?join=${sessionCode}`;
      navigator.clipboard.writeText(link);
      showToast("Share link copied", "success");
      setShowShare(false);
    }
  }

  async function toggleFollow() {
    if (!sessionCode) return;
    const next = !followMode;
    try {
      await workspaceService.setFollowMode(sessionCode, next);
      setFollowMode(next);
    } catch {
      showToast("Failed to toggle follow mode", "error");
    }
  }

  // Import current route/URL state
  useEffect(() => {
    if (!isJoined || !sessionCode) return;
    const timer = setInterval(async () => {
      try {
        const s = await workspaceService.getSession(sessionCode);
        setSharedState(s.sharedState);
      } catch {}
    }, 10000);
    return () => clearInterval(timer);
  }, [isJoined, sessionCode]);

  if (view === "room" && sessionCode) {
    return (
      <WorkspaceSyncProvider
        sessionCode={sessionCode}
        onUrlChange={(url, route) => {
          if (followMode && route !== window.location.pathname) {
            navigate({ to: route as any });
          }
        }}
        onFollowMode={(enabled) => setFollowMode(enabled)}
      >
        <div className="h-full flex flex-col relative">
          {/* Top bar */}
          <div className="flex items-center justify-between px-4 h-12 bg-surface border-b border-border shrink-0">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">{session?.name ?? "Workspace"}</span>
              <button
                onClick={copyCode}
                className="flex items-center gap-1 h-7 px-2 rounded-lg bg-accent text-muted-foreground text-xs hover:bg-accent/70 transition"
              >
                {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                {sessionCode}
              </button>
            </div>
            <div className="flex items-center gap-2">
              <PresenceIndicator />
              <div className="h-4 w-px bg-border" />
              <button
                onClick={toggleFollow}
                className={cn(
                  "flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium border border-border transition",
                  followMode
                    ? "bg-primary/10 border-primary/30 text-primary"
                    : "hover:bg-accent text-muted-foreground",
                )}
                title={followMode ? "Following host" : "Free navigation"}
              >
                {followMode ? <ToggleRight className="h-3.5 w-3.5" /> : <ToggleLeft className="h-3.5 w-3.5" />}
                Follow
              </button>
              <button
                onClick={() => setShowShare(!showShare)}
                className="h-8 w-8 grid place-items-center rounded-lg border border-border hover:bg-accent transition"
                title="Share"
              >
                <Share2 className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={handleEnd}
                className="h-8 px-3 rounded-lg bg-red-500 text-white text-xs font-medium hover:bg-red-600 transition"
              >
                End
              </button>
              <button
                onClick={handleLeave}
                className="h-8 px-3 rounded-lg border border-border text-xs font-medium hover:bg-accent transition"
              >
                Leave
              </button>
            </div>
          </div>

          {/* Share popup */}
          {showShare && (
            <div className="absolute top-12 right-4 z-50 w-72 rounded-xl bg-popover border border-border shadow-pop p-4 space-y-3 animate-fade-slide-up">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold">Share Workspace</span>
                <button
                  onClick={() => setShowShare(false)}
                  className="h-6 w-6 grid place-items-center rounded-full hover:bg-accent transition"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
              <button
                onClick={copyShareLink}
                className="flex items-center gap-2 w-full h-9 px-3 rounded-lg bg-accent text-xs font-medium hover:bg-accent/70 transition"
              >
                <Link className="h-3.5 w-3.5" />
                Copy share link
              </button>
              <button
                onClick={copyCode}
                className="flex items-center gap-2 w-full h-9 px-3 rounded-lg bg-accent text-xs font-medium hover:bg-accent/70 transition"
              >
                <Copy className="h-3.5 w-3.5" />
                Copy session code
              </button>
              <p className="text-[10px] text-muted-foreground">
                Anyone with the code or link can join this workspace session.
              </p>
            </div>
          )}

          {/* Main workspace content */}
          <div className="flex-1 flex">
            {/* Members sidebar */}
            <div className="w-60 shrink-0 border-r border-border bg-surface/50 flex flex-col">
              <div className="p-3 border-b border-border">
                <span className="text-xs font-semibold text-foreground/60">
                  Members ({members.length})
                </span>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-1">
                {members.map((id) => (
                  <div
                    key={id}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-accent/50 transition"
                  >
                    <div className="h-7 w-7 rounded-full bg-primary/20 grid place-items-center text-[10px] font-semibold shrink-0">
                      {id.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">
                        {id === session?.hostId ? "Host" : `User ${id.slice(0, 6)}`}
                      </p>
                      {id === session?.hostId && (
                        <p className="text-[10px] text-muted-foreground">Session host</p>
                      )}
                    </div>
                    {id === session?.hostId && (
                      <span className="h-2 w-2 rounded-full bg-yellow-400" title="Host" />
                    )}
                  </div>
                ))}
              </div>

              {/* Shared state info */}
              {sharedState && (
                <div className="border-t border-border p-3 space-y-2">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Shared State
                  </p>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-[11px]">
                      <Globe className="h-3 w-3 text-muted-foreground" />
                      <span className="truncate text-muted-foreground">
                        {sharedState.currentRoute || "/"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px]">
                      <PanelRight className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {Object.keys(sharedState.panels).length} panels
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px]">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {sharedState.activeAnnotations.length} annotations
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px]">
                      <Bookmark className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {sharedState.activeBookmarks.length} bookmarks
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Main area */}
            <div className="flex-1 flex flex-col items-center justify-center p-8">
              <div className="max-w-md text-center">
                <Globe className="h-16 w-16 text-blue-500/20 mx-auto mb-4" />
                <h2 className="text-lg font-semibold mb-2">Collaborative Workspace Active</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Your workspace session is live. Navigate the app freely — your route, panels, and
                  state are shared with {members.length} participant{members.length !== 1 ? "s" : ""}.
                </p>
                {followMode && (
                  <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary text-xs font-medium">
                    <Hand className="h-3.5 w-3.5" />
                    Following host navigation
                  </div>
                )}
                <div className="mt-6 space-y-2">
                  <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-accent/50 text-left">
                    <PanelRight className="h-5 w-5 text-primary/60 shrink-0" />
                    <div>
                      <p className="text-xs font-medium">Panel State Synced</p>
                      <p className="text-[11px] text-muted-foreground">Open/close panels are shared in realtime</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-accent/50 text-left">
                    <Users className="h-5 w-5 text-primary/60 shrink-0" />
                    <div>
                      <p className="text-xs font-medium">Live Presence</p>
                      <p className="text-[11px] text-muted-foreground">See who's online and their activity status</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-accent/50 text-left">
                    <Bookmark className="h-5 w-5 text-primary/60 shrink-0" />
                    <div>
                      <p className="text-xs font-medium">Shared Bookmarks</p>
                      <p className="text-[11px] text-muted-foreground">Bookmarks are synchronized across the session</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <PresenceOverlay />
        </div>
      </WorkspaceSyncProvider>
    );
  }

  // Lobby
  return (
    <div className="max-w-lg mx-auto mt-16 space-y-8">
      <div className="text-center">
        <Globe className="h-10 w-10 text-blue-400 mx-auto mb-3" />
        <h1 className="text-2xl font-semibold tracking-tight">Workspace</h1>
        <p className="text-sm text-foreground/50 mt-1">
          Collaborative workspace sessions — share state, navigate together
        </p>
      </div>

      <div className="rounded-2xl bg-surface border border-border p-5 space-y-3">
        <h2 className="text-sm font-semibold">Create a Workspace</h2>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Workspace name (optional)"
          className="w-full h-9 rounded-xl border border-border bg-background px-4 text-sm outline-none focus:border-primary/40 transition"
        />
        <button
          onClick={handleCreate}
          className="flex items-center justify-center gap-2 w-full h-10 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition"
        >
          <Plus className="h-4 w-4" /> Create Workspace
        </button>
      </div>

      <div className="rounded-2xl bg-surface border border-border p-5 space-y-3">
        <h2 className="text-sm font-semibold">Join a Workspace</h2>
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Enter workspace code"
          maxLength={6}
          className="w-full h-9 rounded-xl border border-border bg-background px-4 text-sm tracking-widest font-mono uppercase outline-none focus:border-primary/40 transition"
        />
        <button
          onClick={handleJoin}
          className="flex items-center justify-center gap-2 w-full h-10 rounded-xl border border-border text-sm font-medium hover:bg-accent transition"
        >
          <Users className="h-4 w-4" /> Join Workspace
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

export const Route = createFileRoute("/workspace")({
  component: () => (
    <ProtectedRoute>
      <Layout>
        <WorkspacePage />
      </Layout>
    </ProtectedRoute>
  ),
});
