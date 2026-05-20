import { useMemo, useState } from "react";
import { Plus, Hash, User } from "lucide-react";
import { useChatStore, type RoomCategory } from "@/store/useChatStore";

const CATEGORIES: { key: RoomCategory; label: string }[] = [
  { key: "saved", label: "SAVED" },
  { key: "hooked", label: "HOOKED" },
  { key: "trash", label: "TRASH" },
];

export function Sidebar() {
  const rooms = useChatStore((s) => s.rooms);
  const activeRoomId = useChatStore((s) => s.activeRoomId);
  const setActiveRoom = useChatStore((s) => s.setActiveRoom);
  const addRoom = useChatStore((s) => s.addRoom);

  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [cat, setCat] = useState<RoomCategory>("saved");

  const grouped = useMemo(() => {
    const map: Record<RoomCategory, typeof rooms> = { saved: [], hooked: [], trash: [] };
    rooms.forEach((r) => map[r.category].push(r));
    return map;
  }, [rooms]);

  const create = () => {
    if (!name.trim()) return;
    addRoom({
      _id: crypto.randomUUID(),
      name: name.trim(),
      category: cat,
      kind: name.trim().startsWith("@") ? "dm" : "channel",
    });
    setName("");
    setCat("saved");
    setCreating(false);
  };

  return (
    <aside className="fixed left-0 top-16 bottom-0 w-[280px] bg-sidebar border-r border-sidebar-border overflow-y-auto">
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-sm tracking-wide">Chat Rooms</h2>
          <span className="text-xs text-muted-foreground px-2 py-0.5 rounded-full bg-muted">
            {rooms.length}
          </span>
        </div>

        {!creating ? (
          <button
            onClick={() => setCreating(true)}
            className="w-full inline-flex items-center justify-center gap-2 h-10 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition"
          >
            <Plus className="h-4 w-4" /> Create New Room
          </button>
        ) : (
          <div className="space-y-2 rounded-xl bg-surface border border-border p-3 shadow-soft">
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Room name"
              className="w-full h-9 px-3 rounded-lg bg-background border border-border text-sm outline-none focus:ring-2 focus:ring-ring/30"
            />
            <div className="flex gap-1.5">
              {(["saved", "hooked", "trash"] as RoomCategory[]).map((c) => (
                <button
                  key={c}
                  onClick={() => setCat(c)}
                  className={`flex-1 h-7 text-xs rounded-full capitalize transition ${
                    cat === c
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground/70 hover:bg-accent"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
            <div className="flex gap-2 pt-1">
              <button
                onClick={create}
                className="flex-1 h-9 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90"
              >
                Create
              </button>
              <button
                onClick={() => {
                  setCreating(false);
                  setName("");
                }}
                className="flex-1 h-9 rounded-lg bg-muted text-foreground/80 text-sm hover:bg-accent"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="mt-5 space-y-5">
          {CATEGORIES.map(({ key, label }) => (
            <div key={key}>
              <div className="flex items-center justify-between px-1 mb-2">
                <span className="text-[11px] font-semibold tracking-widest text-muted-foreground">
                  {label}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  {grouped[key].length}
                </span>
              </div>
              {grouped[key].length === 0 ? (
                <p className="px-1 text-xs text-muted-foreground/80">No rooms</p>
              ) : (
                <ul className="space-y-0.5">
                  {grouped[key].map((r) => (
                    <li key={r._id}>
                      <button
                        onClick={() => setActiveRoom(r._id)}
                        className={`w-full flex items-center gap-2 px-2 h-8 rounded-lg text-sm transition ${
                          activeRoomId === r._id
                            ? "bg-accent text-accent-foreground"
                            : "hover:bg-accent/60 text-foreground/85"
                        }`}
                      >
                        {r.kind === "dm" ? (
                          <User className="h-3.5 w-3.5 text-muted-foreground" />
                        ) : (
                          <Hash className="h-3.5 w-3.5 text-muted-foreground" />
                        )}
                        <span className="truncate">{r.name}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
