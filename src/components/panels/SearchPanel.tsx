import { useState, useRef, useEffect, useCallback } from "react";
import { X, Search, RefreshCw, Bookmark, BookmarkPlus, ExternalLink, Loader2, Trash2, Globe } from "lucide-react";
import { useUIStore } from "@/store/useUIStore";
import { cn } from "@/lib/utils";
import { useMountTransition } from "@/hooks/useMountTransition";
import * as bookmarksService from "@/services/bookmarks";
import { format } from "date-fns";

export function SearchPanel() {
  const open = useUIStore((s) => s.panels.search);
  const closePanel = useUIStore((s) => s.closePanel);
  const showToast = useUIStore((s) => s.showToast);
  const { mounted, animatingIn } = useMountTransition(open, 300);

  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [currentUrl, setCurrentUrl] = useState<string | null>(null);
  const [showBookmarkForm, setShowBookmarkForm] = useState(false);
  const [bookmarkNotes, setBookmarkNotes] = useState("");
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [bookmarkCount, setBookmarkCount] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const loadBookmarks = useCallback(async () => {
    try {
      const res = await bookmarksService.fetchBookmarks();
      setBookmarks(res);
      setBookmarkCount(res.length);
    } catch {}
  }, []);

  useEffect(() => {
    if (open) loadBookmarks();
  }, [open, loadBookmarks]);

  function handleSearch() {
    if (!query.trim()) return;
    setSearching(true);
    const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    setCurrentUrl(searchUrl);
    setSearching(false);
  }

  function handleRefresh() {
    if (iframeRef.current && currentUrl) {
      iframeRef.current.src = currentUrl;
    }
  }

  async function handleBookmark() {
    if (!currentUrl || !query.trim()) return;
    try {
      await bookmarksService.createBookmark(query, currentUrl, bookmarkNotes);
      showToast("Bookmark saved", "success");
      setShowBookmarkForm(false);
      setBookmarkNotes("");
      loadBookmarks();
    } catch {
      showToast("Failed to save bookmark", "error");
    }
  }

  async function handleDeleteBookmark(id: string) {
    try {
      await bookmarksService.deleteBookmark(id);
      loadBookmarks();
      showToast("Bookmark deleted", "success");
    } catch {
      showToast("Failed to delete bookmark", "error");
    }
  }

  if (!mounted) return null;

  return (
    <div
      className={cn(
        "fixed top-0 right-0 bottom-0 z-50 w-[65%] bg-background shadow-pop flex flex-col",
        animatingIn ? "animate-slide-in-right" : "animate-slide-out-right",
      )}
    >
      {/* Top bar */}
      <div className="flex items-center gap-3 px-4 h-14 border-b border-border shrink-0">
        <button
          onClick={() => {
            setCurrentUrl(null);
            closePanel("search");
          }}
          className="h-8 w-8 grid place-items-center rounded-full text-foreground/60 hover:bg-accent hover:text-foreground transition active:scale-95 shrink-0"
          title="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <button
          onClick={handleRefresh}
          disabled={!currentUrl}
          className="h-8 w-8 grid place-items-center rounded-full text-foreground/60 hover:bg-accent hover:text-foreground transition active:scale-95 shrink-0 disabled:opacity-40"
          title="Refresh"
        >
          <RefreshCw className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#de5833]/10 text-[#de5833] shrink-0">
          <Globe className="h-4 w-4" />
          <span className="text-sm font-medium">DuckDuckGo</span>
        </div>

        <div className="flex-1 flex items-center gap-2 h-10 px-4 rounded-full border border-border bg-background">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Search the web..."
            className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground/60"
          />
        </div>

        <button
          onClick={() => setShowBookmarkForm(true)}
          className="h-10 px-4 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition inline-flex items-center gap-2 shrink-0"
        >
          <BookmarkPlus className="h-4 w-4" />
          Add Bookmark
        </button>

        <div className="h-10 px-3 rounded-full border border-border flex items-center gap-2 shrink-0">
          <Bookmark className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">{bookmarkCount}</span>
        </div>
      </div>

      {/* URL bar */}
      {currentUrl && (
        <div className="flex items-center gap-2 px-4 h-9 border-b border-border bg-muted/30 shrink-0">
          <Globe className="h-3 w-3 text-muted-foreground shrink-0" />
          <span className="text-xs text-muted-foreground truncate">{currentUrl}</span>
        </div>
      )}

      {/* Bookmark form */}
      {showBookmarkForm && (
        <div className="px-4 py-3 border-b border-border bg-accent/30 shrink-0">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium">Save Bookmark</span>
            <button
              onClick={() => setShowBookmarkForm(false)}
              className="h-6 w-6 grid place-items-center rounded-full hover:bg-accent transition"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
          <input
            value={query}
            readOnly
            placeholder="Title"
            className="w-full h-8 rounded-lg border border-border bg-background px-3 text-xs outline-none mb-2"
          />
          <textarea
            value={bookmarkNotes}
            onChange={(e) => setBookmarkNotes(e.target.value)}
            placeholder="Notes (optional)"
            rows={2}
            className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-xs outline-none resize-none"
          />
          <button
            onClick={handleBookmark}
            className="mt-2 h-7 px-3 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition"
          >
            Save
          </button>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {currentUrl ? (
          <iframe
            ref={iframeRef}
            src={currentUrl}
            className="w-full h-full border-0"
            sandbox="allow-scripts allow-same-origin allow-forms"
            title="Search results"
          />
        ) : searching ? (
          <div className="h-full flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground/40">
            <Globe className="h-16 w-16 mb-4" />
          </div>
        )}
      </div>
    </div>
  );
}
