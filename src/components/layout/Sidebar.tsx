import { useMemo, useState } from "react";
import { Plus, Hash, User, Bookmark, Anchor, Trash2, MoreHorizontal, Trash, ChevronLeft, ChevronRight } from "lucide-react";
import { useChatStore, type RoomCategory } from "@/store/useChatStore";
import { useCreateRoomMutation, useDeleteRoomMutation } from "@/hooks/useChatMutations";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/store/useUIStore";

const CATEGORIES: { key: RoomCategory; label: string; Icon: typeof Bookmark }[] = [
  { key: "saved", label: "SAVED", Icon: Bookmark },
  { key: "hooked", label: "HOOKED", Icon: Anchor },
  { key: "trash", label: "TRASH", Icon: Trash2 },
];

const btn = "transition duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.98]";
const roomBtn =
  "w-full flex items-center gap-2.5 px-3 h-8 rounded-lg text-sm transition-all duration-150 ease-[cubic-bezier(0.16,1,0.3,1)]";

export function LeftSidebar() {
  const rooms = useChatStore((s) => s.rooms);
  const activeRoomId = useChatStore((s) => s.activeRoomId);
  const setActiveRoom = useChatStore((s) => s.setActiveRoom);

  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [cat, setCat] = useState<RoomCategory>("saved");
  const [menuRoomId, setMenuRoomId] = useState<string | null>(null);
  const collapsed = useUIStore((s) => s.leftSidebarCollapsed);
  const toggleLeftSidebar = useUIStore((s) => s.toggleLeftSidebar);

  const { mutate: doCreate, isPending: creatingRoom } = useCreateRoomMutation();
  const { mutate: doDelete } = useDeleteRoomMutation();

  const grouped = useMemo(() => {
    const map: Record<RoomCategory, typeof rooms> = { saved: [], hooked: [], trash: [] };
    rooms.forEach((r) => map[r.category].push(r));
    return map;
  }, [rooms]);

  const create = () => {
    if (!name.trim() || creatingRoom) return;
    doCreate({ name: name.trim(), category: cat });
    setName("");
    setCat("saved");
    setCreating(false);
  };

  const handleRoomClick = (id: string) => {
    setActiveRoom(activeRoomId === id ? null : id);
    setMenuRoomId(null);
  };

  const totalUnread = useMemo(() => rooms.reduce((s, r) => s + r.unread, 0), [rooms]);

  return (
    <aside
      className={cn(
        "fixed left-0 top-[96px] bottom-0 w-[280px] bg-sidebar border-r border-sidebar-border overflow-hidden z-30 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
        collapsed && "-translate-x-[252px]",
      )}
    >
      <button
        onClick={toggleLeftSidebar}
        className="absolute right-0 top-4 translate-x-full h-9 w-7 rounded-r-lg border border-l-0 border-sidebar-border bg-sidebar text-muted-foreground hover:text-foreground hover:bg-accent/40 transition grid place-items-center"
        title={collapsed ? "Open sidebar" : "Collapse sidebar"}
        aria-label={collapsed ? "Open sidebar" : "Collapse sidebar"}
      >
        {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>
      <div className="flex flex-col h-full">
        <div className="p-5 pb-3">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-[17px] tracking-tight">Chat Rooms</h2>
            <div className="flex items-center gap-2">
              {totalUnread > 0 && (
                <span className="text-[11px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                  {totalUnread}
                </span>
              )}
              <span className="text-[12px] text-muted-foreground px-2 py-0.5 rounded-full bg-transparent">
                {rooms.length}
              </span>
            </div>
          </div>

          {!creating ? (
            <button
              onClick={() => setCreating(true)}
              className={`w-full inline-flex items-center justify-center gap-2 h-10 rounded-xl bg-primary text-primary-foreground text-[14px] font-medium ${btn} hover:opacity-90 shadow-sm`}
            >
              <Plus className="h-[16px] w-[16px]" />
              Create New Room
            </button>
          ) : (
            <div className="space-y-2 rounded-xl bg-surface border border-border p-3 shadow-soft animate-fade-slide-up">
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Room name"
                className="w-full h-10 px-3 rounded-xl bg-background border border-border text-sm outline-none transition-shadow duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] focus:ring-2 focus:ring-ring/30 placeholder:text-muted-foreground/60"
                onKeyDown={(e) => e.key === "Enter" && create()}
              />
              <div className="flex gap-2">
                {(["saved", "hooked", "trash"] as RoomCategory[]).map((c) => (
                  <button
                    key={c}
                    onClick={() => setCat(c)}
                    className={`flex-1 h-7 text-[11px] rounded-lg capitalize font-medium transition-all duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.97] ${
                      cat === c
                        ? "bg-primary text-primary-foreground"
                        : "bg-background border border-border text-foreground/70 hover:bg-accent"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={create}
                  disabled={creatingRoom}
                  className={`flex-1 h-9 rounded-xl bg-primary text-primary-foreground text-[13px] font-medium ${btn} hover:opacity-90 disabled:opacity-50`}
                >
                  {creatingRoom ? "Creating..." : "Create"}
                </button>
                <button
                  onClick={() => { setCreating(false); setName(""); }}
                  className={`flex-1 h-9 rounded-xl bg-background border border-border text-foreground/80 text-[13px] ${btn} hover:bg-accent`}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-4">
          {CATEGORIES.map(({ key, label, Icon }) => (
            <div key={key}>
              <div className="flex items-center justify-between mb-2 px-2">
                <div className="flex items-center gap-1.5">
                  <Icon className="h-3 w-3 text-muted-foreground" />
                  <span className="text-[10px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                    {label}
                  </span>
                </div>
                <span className="text-[10px] text-muted-foreground">
                  {grouped[key].length}
                </span>
              </div>
              {grouped[key].length === 0 ? (
                <p className="px-2 text-[12px] text-muted-foreground/40 italic">No rooms</p>
              ) : (
                <ul className="space-y-0.5">
                  {grouped[key].map((r) => (
                    <li key={r._id} className="relative group">
                      <button
                        onClick={() => handleRoomClick(r._id)}
                        className={`${roomBtn} ${
                          activeRoomId === r._id
                            ? "bg-primary text-primary-foreground font-medium"
                            : "text-foreground/75 hover:bg-accent/60 hover:text-foreground"
                        }`}
                      >
                        {r.kind === "dm" ? (
                          <User className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        ) : (
                          <Hash className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        )}
                        <span className="truncate text-[13px]">{r.name}</span>
                        {r.unread > 0 && activeRoomId !== r._id && (
                          <span className="ml-auto text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full shrink-0">
                            {r.unread}
                          </span>
                        )}
                      </button>
                      {r.role === "owner" && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setMenuRoomId(menuRoomId === r._id ? null : r._id);
                          }}
                            title={`${r.name} options`}
                          className="absolute right-1 top-1/2 -translate-y-1/2 h-5 w-5 grid place-items-center rounded text-foreground/40 hover:text-foreground hover:bg-accent opacity-0 group-hover:opacity-100 transition"
                        >
                          <MoreHorizontal className="h-3 w-3" />
                        </button>
                      )}
                      {menuRoomId === r._id && r.role === "owner" && (
                        <div className="absolute right-0 top-6 z-50 w-36 rounded-xl bg-popover border border-border shadow-pop p-1 animate-fade-slide-up">
                          <button
                            onClick={() => {
                              doDelete(r._id);
                              setMenuRoomId(null);
                            }}
                            className="w-full flex items-center gap-2 px-2.5 h-8 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition"
                          >
                            <Trash className="h-3.5 w-3.5" />
                            Delete room
                          </button>
                        </div>
                      )}
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
