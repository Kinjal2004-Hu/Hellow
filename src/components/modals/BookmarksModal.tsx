import { useState, useEffect } from "react";
import { X, Bookmark, ExternalLink, Trash2, Search, Plus } from "lucide-react";
import { useUIStore } from "@/store/useUIStore";
import { cn } from "@/lib/utils";
import { useMountTransition } from "@/hooks/useMountTransition";
import * as bookmarksService from "@/services/bookmarks";
import { format } from "date-fns";

export function BookmarksModal() {
  const open = useUIStore((s) => s.modals.bookmarks);
  const closeModal = useUIStore((s) => s.closeModal);
  const showToast = useUIStore((s) => s.showToast);
  const { mounted, animatingIn } = useMountTransition(open, 300);

  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newNotes, setNewNotes] = useState("");

  async function load() {
    try {
      const res = await bookmarksService.fetchBookmarks(search || undefined);
      setBookmarks(res);
    } catch {}
  }

  useEffect(() => {
    if (open) load();
  }, [open, search]);

  async function handleCreate() {
    if (!newTitle.trim() || !newUrl.trim()) return;
    try {
      await bookmarksService.createBookmark(newTitle, newUrl, newNotes);
      showToast("Bookmark saved", "success");
      setShowForm(false);
      setNewTitle("");
      setNewUrl("");
      setNewNotes("");
      load();
    } catch {
      showToast("Failed to save bookmark", "error");
    }
  }

  async function handleDelete(id: string) {
    try {
      await bookmarksService.deleteBookmark(id);
      load();
      showToast("Bookmark deleted", "success");
    } catch {
      showToast("Failed to delete bookmark", "error");
    }
  }

  function openUrl(url: string) {
    window.open(url, "_blank");
  }

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center">
      <div
        className={cn(
          "absolute inset-0 bg-black/20 backdrop-blur-sm",
          animatingIn ? "animate-backdrop-in" : "animate-backdrop-out",
        )}
        onClick={() => closeModal("bookmarks")}
      />
      <div
        className={cn(
          "relative w-[520px] max-h-[80vh] bg-surface rounded-2xl shadow-pop border border-border flex flex-col",
          animatingIn ? "animate-modal-enter" : "animate-modal-exit",
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 h-14 border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            <Bookmark className="h-4 w-4 text-yellow-500" />
            <span className="font-semibold text-sm">Bookmarks</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowForm(!showForm)}
              className={cn(
                "h-8 w-8 grid place-items-center rounded-full transition",
                showForm ? "bg-accent text-foreground" : "text-foreground/60 hover:bg-accent hover:text-foreground",
              )}
            >
              <Plus className="h-4 w-4" />
            </button>
            <button
              onClick={() => closeModal("bookmarks")}
              className="h-8 w-8 grid place-items-center rounded-full text-foreground/60 hover:bg-accent hover:text-foreground transition"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="px-4 py-3 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search bookmarks..."
              className="w-full h-9 pl-9 pr-3 rounded-xl border border-border bg-background text-sm outline-none focus:border-primary/40 transition"
            />
          </div>
        </div>

        {/* New form */}
        {showForm && (
          <div className="px-4 py-3 border-b border-border bg-accent/30 space-y-2">
            <input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Title"
              className="w-full h-8 rounded-lg border border-border bg-background px-3 text-xs outline-none"
            />
            <input
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="URL"
              className="w-full h-8 rounded-lg border border-border bg-background px-3 text-xs outline-none"
            />
            <textarea
              value={newNotes}
              onChange={(e) => setNewNotes(e.target.value)}
              placeholder="Notes (optional)"
              rows={2}
              className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-xs outline-none resize-none"
            />
            <div className="flex gap-2">
              <button
                onClick={handleCreate}
                className="h-7 px-3 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition"
              >
                Save
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="h-7 px-3 rounded-lg border border-border text-xs hover:bg-accent transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {bookmarks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Bookmark className="h-8 w-8 text-muted-foreground/30 mb-2" />
              <p className="text-xs text-muted-foreground">No bookmarks yet</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {bookmarks.map((bm) => (
                <div key={bm._id} className="flex items-start gap-3 px-5 py-3 hover:bg-accent/30 transition group">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{bm.title}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{bm.url}</p>
                    {bm.notes && (
                      <p className="text-[11px] text-muted-foreground/70 mt-1 line-clamp-2">{bm.notes}</p>
                    )}
                    <p className="text-[10px] text-muted-foreground/50 mt-1">
                      {format(new Date(bm.createdAt), "MMM d, yyyy")}
                    </p>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                    <button
                      onClick={() => openUrl(bm.url)}
                      className="h-7 w-7 grid place-items-center rounded-lg hover:bg-accent transition"
                      title="Open"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => handleDelete(bm._id)}
                      className="h-7 w-7 grid place-items-center rounded-lg hover:bg-red-50 hover:text-red-500 transition"
                      title="Delete"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
