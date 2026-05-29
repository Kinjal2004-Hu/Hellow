import { useState, useEffect, useRef } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { io, type Socket } from "socket.io-client";
import {
  MapPin, Users, Plus, Send, Navigation, Image,
  Copy, Check, Loader2, ArrowLeft, Search, Camera, Share2, ChevronLeft, ChevronRight,
} from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Layout } from "@/components/layout/Layout";
import { useSpotSyncStore } from "@/store/useSpotSyncStore";
import { useUIStore } from "@/store/useUIStore";
import { useAuthStore } from "@/store/useAuthStore";
import { cn } from "@/lib/utils";
import * as spotSyncService from "@/services/spotSync";
import { useYouTubeStore } from "@/store/useYouTubeStore";
import * as youtubeService from "@/services/youtube";

const SOCKET_BASE = (import.meta.env.VITE_API_URL ?? "http://localhost:4000").replace("/api", "");

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

function SpotSyncPage() {
  const navigate = useNavigate();
  const showToast = useUIStore((s) => s.showToast);
  const currentUser = useAuthStore((s) => s.user);
  const {
    session, members, memberLocations, pins, messages, isJoined,
    setSession, setMembers, addMember, removeMember,
    updateMemberLocation, addPin, removePin, setMessages, addMessage, setJoined, reset,
  } = useSpotSyncStore();

  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const socketRef = useRef<Socket | null>(null);

  const [view, setView] = useState<"lobby" | "room">("lobby");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [sessionCode, setSessionCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPinForm, setShowPinForm] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [pinLat, setPinLat] = useState("");
  const [pinLng, setPinLng] = useState("");
  const [pinLabel, setPinLabel] = useState("");
  const [pinDescription, setPinDescription] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [copied, setCopied] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationWatchId, setLocationWatchId] = useState<number | null>(null);
  const [mapReady, setMapReady] = useState(false);

  const token = typeof window !== "undefined" ? localStorage.getItem("hellow_token") : null;

  // Initialize map
  useEffect(() => {
    if (view !== "room" || !mapRef.current || mapInstanceRef.current) return;

    async function initMap() {
      const L = await import("leaflet");
      await import("leaflet/dist/leaflet.css");

      const map = L.map(mapRef.current!).setView([20, 0], 2);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;
      mapInstanceRef.current = map;
      setMapReady(true);

      // After the map is initialized, allow the layout to settle then
      // tell Leaflet to recalculate size and re-center so it fills
      // the available flex space (fixes initial top-left clipping).
      setTimeout(() => {
        try { map.invalidateSize(); } catch {}
      }, 200);

      return () => {
        map.remove();
        mapInstanceRef.current = null;
      };
    }

    initMap();
  }, [view]);

  // Socket connection
  useEffect(() => {
    if (!token || !sessionCode || !isJoined) return;

    const s = io(`${SOCKET_BASE}/spotsync`, {
      auth: { token },
      transports: ["websocket", "polling"],
    });

    s.on("connect", () => {
      s.emit("spotsync:join", { code: sessionCode }, (ack: any) => {
        if (ack?.error) setError(ack.error);
        if (ack?.pins) {
          ack.pins.forEach((p: any) => addPin(p));
        }
        if (ack?.messages) {
          setMessages(ack.messages);
        }
      });
    });

    s.on("spotsync:members", (ids: string[]) => setMembers(ids));
    s.on("spotsync:member_joined", (userId: string) => addMember(userId));
    s.on("spotsync:member_left", (userId: string) => removeMember(userId));

    s.on("spotsync:location", (data: { userId: string; lat: number; lng: number; timestamp: string }) => {
      updateMemberLocation(data);
    });

    s.on("spotsync:pin", (pin: any) => {
      addPin(pin);
    });

    s.on("spotsync:chat", (message: any) => {
      addMessage(message);
    });

    socketRef.current = s;
    return () => { s.disconnect(); };
  }, [token, sessionCode, isJoined]);

  // Load persisted messages so chat survives reloads even before socket events arrive
  useEffect(() => {
    if (!sessionCode || !isJoined) return;

    let cancelled = false;
    spotSyncService.getMessages(sessionCode)
      .then((items) => {
        if (!cancelled) setMessages(items);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [sessionCode, isJoined]);

  // Track user's location
  useEffect(() => {
    if (!isJoined || !navigator.geolocation) return;

    const id = navigator.geolocation.watchPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(loc);
        socketRef.current?.emit("spotsync:location", loc);
      },
      () => {},
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 },
    );

    setLocationWatchId(id);
    return () => navigator.geolocation.clearWatch(id);
  }, [isJoined]);

  // Update markers on the map
  useEffect(() => {
    if (!mapInstanceRef.current || !mapReady) return;

    async function updateMarkers() {
      const L = await import("leaflet");

      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      const map = mapInstanceRef.current;

      // Self marker
      if (userLocation) {
        const icon = L.divIcon({
          html: `<div style="width:16px;height:16px;border-radius:50%;background:#3b82f6;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3)"></div>`,
          className: "",
          iconSize: [16, 16],
        });
        const m = L.marker([userLocation.lat, userLocation.lng], { icon }).addTo(map);
        m.bindPopup("<b>You</b>");
        markersRef.current.push(m);
      }

      // Member markers
      memberLocations.forEach((loc) => {
        const icon = L.divIcon({
          html: `<div style="width:14px;height:14px;border-radius:50%;background:#22c55e;border:2px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3)"></div>`,
          className: "",
          iconSize: [14, 14],
        });
        const m = L.marker([loc.lat, loc.lng], { icon }).addTo(map);
        m.bindPopup(`<b>${loc.userId.slice(0, 6)}</b>`);
        markersRef.current.push(m);
      });

      // Pin markers
      pins.forEach((pin) => {
        const icon = L.divIcon({
          html: `<div style="width:20px;height:20px;border-radius:50%;background:#ef4444;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;color:white;font-size:12px;font-weight:bold">!</div>`,
          className: "",
          iconSize: [20, 20],
        });
        const m = L.marker([pin.lat, pin.lng], { icon }).addTo(map);
        const popupContent = `
          <b>${pin.label || "Pin"}</b>
          ${pin.description ? `<br/><small>${pin.description}</small>` : ""}
          ${pin.imageUrl ? `<br/><img src="${pin.imageUrl}" width="150" style="border-radius:8px;margin-top:4px"/>` : ""}
        `;
        m.bindPopup(popupContent);
        markersRef.current.push(m);
      });

      // Fit bounds if we have markers
      if (markersRef.current.length > 0) {
        const group = L.featureGroup(markersRef.current);
        map.fitBounds(group.getBounds().pad(0.1));
      }
    }

    updateMarkers();
  }, [userLocation, memberLocations, pins, mapReady]);

  // Ensure Leaflet recalculates size when layout changes (sidebar toggle, ready state)
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    // Run after a short delay so the browser has applied the new layout
    // (useful when toggling the sidebar) — prevents clipped map tiles.
    const t = setTimeout(() => { try { mapInstanceRef.current.invalidateSize(); } catch {} }, 150);
    return () => clearTimeout(t);
  }, [mapReady, showSidebar]);

  // Invalidate on window resize as well
  useEffect(() => {
    let t: any = null;

    const doInvalidate = () => {
      if (!mapInstanceRef.current) return;
      try { mapInstanceRef.current.invalidateSize(); } catch {}

      // If we have markers, re-fit bounds so the map recenters into the new area
      if (markersRef.current && markersRef.current.length > 0) {
        try {
          const L = (window as any).L;
          if (L && mapInstanceRef.current) {
            const group = L.featureGroup(markersRef.current);
            mapInstanceRef.current.fitBounds(group.getBounds().pad(0.1));
          }
        } catch {}
      }
    };

    const debounced = () => {
      clearTimeout(t);
      t = setTimeout(doInvalidate, 120);
    };

    // ResizeObserver for more reliable layout-change detection
    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined" && mapRef.current) {
      ro = new ResizeObserver(debounced);
      try { ro.observe(mapRef.current); } catch {}
    }

    // window resize fallback
    window.addEventListener("resize", debounced);

    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", debounced);
      if (ro) try { ro.disconnect(); } catch {}
    };
  }, []);

  async function handleCreate() {
    setError(null);
    try {
      const s = await spotSyncService.createSession(name || undefined);
      setSession(s);
      setSessionCode(s.code);
      setJoined(true);
      setView("room");
    } catch {
      setError("Failed to create session");
    }
  }

  async function handleJoin() {
    setError(null);
    if (!code.trim()) { setError("Enter a session code"); return; }
    try {
      const s = await spotSyncService.joinSession(code.trim().toUpperCase());
      setSession(s);
      setSessionCode(s.code);
      setJoined(true);
      setView("room");
    } catch {
      setError("Session not found or ended");
    }
  }

  async function handleLeave() {
    if (sessionCode) spotSyncService.leaveSession(sessionCode);
    socketRef.current?.disconnect();
    reset();
    setView("lobby");
    setSessionCode(null);
  }

  async function handleAddPin() {
    const lat = parseFloat(pinLat);
    const lng = parseFloat(pinLng);
    if (isNaN(lat) || isNaN(lng)) { showToast("Invalid coordinates", "error"); return; }

    try {
      const pin = await spotSyncService.addPin(sessionCode!, {
        lat, lng,
        label: pinLabel,
        description: pinDescription,
      });
      addPin(pin as any);
      socketRef.current?.emit("spotsync:pin", pin);
      setShowPinForm(false);
      setPinLat("");
      setPinLng("");
      setPinLabel("");
      setPinDescription("");
      showToast("Pin added", "success");
    } catch {
      showToast("Failed to add pin", "error");
    }
  }

  function useMyLocation() {
    if (userLocation) {
      setPinLat(userLocation.lat.toString());
      setPinLng(userLocation.lng.toString());
    }
  }

  function copyCode() {
    if (sessionCode) {
      navigator.clipboard.writeText(sessionCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  function sendChatMessage() {
    const content = chatInput.trim();
    if (!content) return;
    socketRef.current?.emit("spotsync:chat", { content });
    setChatInput("");
  }

  if (view === "room" && sessionCode) {
    return (
      <div className="h-full flex flex-col pr-[72px] bg-surface">
        <div className="flex items-center gap-3 h-14 px-5 border-b border-border bg-surface shrink-0">
          <button
            onClick={() => navigate({ to: "/" })}
            className="h-8 w-8 grid place-items-center rounded-full hover:bg-accent/50 transition"
            title="Go to home"
            aria-label="Go to home"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-2 min-w-[160px]">
            <div className="h-8 w-8 rounded-full bg-orange-400 text-white grid place-items-center">
              <MapPin className="h-4 w-4" />
            </div>
            <span className="text-[28px] leading-none font-semibold tracking-tight">SpotSync</span>
            <button
              onClick={() => setShowSidebar((v) => !v)}
              className="h-8 w-8 grid place-items-center rounded-md hover:bg-accent/50 transition"
              title={showSidebar ? "Collapse sidebar" : "Expand sidebar"}
              aria-label={showSidebar ? "Collapse sidebar" : "Expand sidebar"}
            >
              {showSidebar ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
          </div>

          <div className="flex-1 max-w-xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <input
              placeholder="Search a place, address, café..."
              className="w-full h-10 rounded-full border border-border bg-background px-11 text-sm outline-none"
            />
          </div>

          <button className="h-10 px-5 rounded-full bg-primary text-primary-foreground text-sm font-medium">
            Go Live
          </button>
        </div>

        <div className="flex-1 min-h-0 flex overflow-hidden relative">
          {showSidebar && (
            <aside className="w-[340px] min-w-[340px] border-r border-border bg-sidebar flex flex-col">
              <div className="h-11 px-4 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  Friends
                </div>
                <span className="text-xs text-muted-foreground">{members.length}</span>
              </div>

              <div className="h-[190px] overflow-y-auto">
                {members.length === 0 ? (
                  <div className="h-full grid place-items-center text-xs text-muted-foreground">No friends in room</div>
                ) : (
                  members.map((memberId) => {
                    const loc = memberLocations.find((item) => item.userId === memberId);
                    return (
                      <div key={memberId} className="px-3 py-2 border-b border-border/70 bg-[#f3f0e6]">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground grid place-items-center text-xs font-semibold">
                            {memberId.slice(0, 1).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold truncate">{memberId}</p>
                            <p className="text-[11px] text-muted-foreground truncate">
                              {loc ? `${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)}` : "Offline"}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="flex-1 min-h-0 border-t border-border bg-surface p-3 flex flex-col">
                {showPinForm && (
                  <div className="mb-3 rounded-xl border border-border bg-background p-3 space-y-2">
                    <div className="flex gap-2">
                      <input value={pinLat} onChange={(e) => setPinLat(e.target.value)} placeholder="Latitude" type="number" step="any" className="flex-1 h-8 rounded-lg border border-border bg-background px-3 text-xs outline-none" />
                      <input value={pinLng} onChange={(e) => setPinLng(e.target.value)} placeholder="Longitude" type="number" step="any" className="flex-1 h-8 rounded-lg border border-border bg-background px-3 text-xs outline-none" />
                    </div>
                    <input value={pinLabel} onChange={(e) => setPinLabel(e.target.value)} placeholder="Label" className="w-full h-8 rounded-lg border border-border bg-background px-3 text-xs outline-none" />
                    <div className="flex gap-2">
                      <button onClick={useMyLocation} className="h-8 px-3 rounded-lg border border-border text-xs">Use my location</button>
                      <button onClick={handleAddPin} className="h-8 px-3 rounded-lg bg-primary text-primary-foreground text-xs">Add pin</button>
                      <button onClick={() => setShowPinForm(false)} className="h-8 px-3 rounded-lg border border-border text-xs">Close</button>
                    </div>
                  </div>
                )}

                <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                  {messages.length === 0 ? (
                    <div className="text-xs text-muted-foreground/70">No messages yet</div>
                  ) : (
                    messages.map((msg, idx) => {
                      const mine = msg.senderId === currentUser?._id;
                      return (
                        <div key={`${msg.createdAt}-${idx}`} className={mine ? "flex justify-end" : "flex justify-start"}>
                          <div className={mine ? "bg-primary text-primary-foreground rounded-2xl px-3 py-2 text-xs max-w-[75%]" : "bg-[#f3f0e6] text-foreground rounded-2xl px-3 py-2 text-xs max-w-[75%]"}>
                            {!mine && <p className="text-[10px] font-semibold mb-0.5">{msg.senderName}</p>}
                            <p>{msg.content}</p>
                            <p className={mine ? "text-[10px] mt-1 text-primary-foreground/80" : "text-[10px] mt-1 text-muted-foreground"}>
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <button className="h-7 px-3 rounded-full bg-[#efe8c8] text-xs">Yaha aa</button>
                  <button className="h-7 px-3 rounded-full bg-[#efe8c8] text-xs">Left le</button>
                  <button className="h-7 px-3 rounded-full bg-[#efe8c8] text-xs">Near cafe</button>
                  <button className="h-7 px-3 rounded-full bg-[#efe8c8] text-xs">5 min</button>
                </div>

                <div className="mt-3 flex items-center gap-2 rounded-2xl border border-border bg-background p-2">
                  <button
                    title="Add pin"
                    aria-label="Add pin"
                    onClick={() => setShowPinForm((value) => !value)}
                    className="h-8 w-8 grid place-items-center rounded-full hover:bg-accent/50 transition"
                  >
                    <MapPin className="h-4 w-4" />
                  </button>
                  <button title="Attach image" aria-label="Attach image" className="h-8 w-8 grid place-items-center rounded-full hover:bg-accent/50 transition">
                    <Image className="h-4 w-4" />
                  </button>
                  <input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") sendChatMessage(); }}
                    placeholder="Type a quick message..."
                    className="flex-1 bg-transparent outline-none text-sm px-1"
                  />
                  <button onClick={sendChatMessage} title="Send message" aria-label="Send message" className="h-8 w-8 grid place-items-center rounded-full bg-primary text-primary-foreground">
                    <Send className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground px-1">
                  <span>Session code</span>
                  <button onClick={copyCode} className="flex items-center gap-1 px-2 py-1 rounded-md hover:bg-accent/50 transition">
                    {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    {sessionCode}
                  </button>
                </div>
              </div>
            </aside>
          )}

          <div className="flex-1 min-h-0 h-full relative overflow-hidden spotsync-map" ref={mapRef} />

          <div className="absolute right-5 bottom-6 flex flex-col items-center gap-3 z-30">
            <button title="Open camera" aria-label="Open camera" className="h-12 w-12 rounded-full bg-background border border-border shadow-card grid place-items-center hover:bg-accent transition">
              <Camera className="h-5 w-5" />
            </button>
            <button
              title="Center on my location"
              aria-label="Center on my location"
              onClick={() => { if (userLocation) mapInstanceRef.current?.setView([userLocation.lat, userLocation.lng], 15); }}
              className="h-12 w-12 rounded-full bg-background border border-border shadow-card grid place-items-center hover:bg-accent transition"
            >
              <Navigation className="h-5 w-5" />
            </button>
            <button title="Share" aria-label="Share" className="h-12 w-12 rounded-full bg-primary text-primary-foreground shadow-card grid place-items-center hover:opacity-90 transition">
              <Share2 className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Lobby view
  return (
    <div className="max-w-lg mx-auto mt-16 space-y-8">
      <div className="text-center">
        <MapPin className="h-10 w-10 text-red-400 mx-auto mb-3" />
        <h1 className="text-2xl font-semibold tracking-tight">SpotSync</h1>
        <p className="text-sm text-foreground/50 mt-1">Collaborative maps & location sharing</p>
      </div>

      {/* Create */}
      <div className="rounded-2xl bg-surface border border-border p-5 space-y-3">
        <h2 className="text-sm font-semibold">Create a Map Session</h2>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Session name (optional)"
          className="w-full h-9 rounded-xl border border-border bg-background px-4 text-sm outline-none focus:border-primary/40 transition"
        />
        <button
          onClick={handleCreate}
          className="flex items-center justify-center gap-2 w-full h-10 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition"
        >
          <Plus className="h-4 w-4" /> Create Session
        </button>
      </div>

      {/* Join */}
      <div className="rounded-2xl bg-surface border border-border p-5 space-y-3">
        <h2 className="text-sm font-semibold">Join a Session</h2>
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Enter session code"
          maxLength={6}
          className="w-full h-9 rounded-xl border border-border bg-background px-4 text-sm tracking-widest font-mono uppercase outline-none focus:border-primary/40 transition"
        />
        <button
          onClick={handleJoin}
          className="flex items-center justify-center gap-2 w-full h-10 rounded-xl border border-border text-sm font-medium hover:bg-accent transition"
        >
          <MapPin className="h-4 w-4" /> Join Session
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

export const Route = createFileRoute("/spotsync")({
  component: () => (
    <ProtectedRoute>
      <Layout>
        <SpotSyncPage />
      </Layout>
    </ProtectedRoute>
  ),
});
