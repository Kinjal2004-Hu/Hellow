import { useEffect, useState } from "react";
import { X, Mail, Inbox, ChevronLeft, RefreshCw, ExternalLink, Trash2, Loader2 } from "lucide-react";
import { useUIStore } from "@/store/useUIStore";
import { useGmailStore } from "@/store/useGmailStore";
import { cn } from "@/lib/utils";
import { useMountTransition } from "@/hooks/useMountTransition";
import { format } from "date-fns";

export function GmailPanel() {
  const open = useUIStore((s) => s.panels.gmail);
  const closePanel = useUIStore((s) => s.closePanel);
  const { mounted, animatingIn } = useMountTransition(open, 300);

  const {
    status, messages, selectedMessage, loading, error,
    checkStatus, connect, fetchInbox, selectMessage, disconnect,
  } = useGmailStore();

  const [view, setView] = useState<"inbox" | "detail">("inbox");

  useEffect(() => {
    if (open) {
      checkStatus();
    }
  }, [open]);

  useEffect(() => {
    if (selectedMessage) setView("detail");
  }, [selectedMessage]);

  if (!mounted) return null;

  function handleOpenMessage(msg: any) {
    selectMessage(msg);
  }

  function handleBack() {
    selectMessage(null);
    setView("inbox");
  }

  function formatEmailDate(dateStr: string): string {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const now = new Date();
      const diff = now.getTime() - d.getTime();
      if (diff < 86400000) return format(d, "h:mm a");
      if (diff < 604800000) return format(d, "EEE");
      return format(d, "M/d");
    } catch {
      return dateStr;
    }
  }

  function extractSenderName(from: string): string {
    const match = from.match(/^"?([^"<]*)"?\s*</);
    return match ? match[1].trim() : from.split("@")[0];
  }

  return (
    <div
      className={cn(
        "fixed top-[68px] bottom-0 right-[72px] z-40 w-[480px] bg-surface border-l border-border shadow-pop",
        "flex flex-col",
        animatingIn
          ? "animate-slide-in-right"
          : "animate-slide-out-right",
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-14 border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          {view === "detail" ? (
            <button
              onClick={handleBack}
              className="h-8 w-8 grid place-items-center rounded-full text-foreground/60 hover:bg-accent hover:text-foreground transition active:scale-95"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          ) : (
            <Mail className="h-4 w-4 text-red-500" />
          )}
          <span className="font-semibold text-sm">
            {view === "detail" ? "Email" : "Gmail"}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {status.connected && (
            <button
              onClick={fetchInbox}
              className="h-8 w-8 grid place-items-center rounded-full text-foreground/60 hover:bg-accent hover:text-foreground transition active:scale-95"
              title="Refresh"
            >
              <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            </button>
          )}
          {status.connected && (
            <button
              onClick={disconnect}
              className="h-8 w-8 grid place-items-center rounded-full text-foreground/60 hover:bg-red-50 hover:text-red-500 transition active:scale-95"
              title="Disconnect"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={() => closePanel("gmail")}
            className="h-8 w-8 grid place-items-center rounded-full text-foreground/60 hover:bg-accent hover:text-foreground transition active:scale-95"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {!status.connected ? (
          <div className="flex flex-col items-center justify-center h-full p-6">
            <div className="text-center max-w-xs animate-fade-slide-up">
              <div className="h-16 w-16 rounded-2xl bg-red-50 grid place-items-center mx-auto mb-4">
                <Mail className="h-8 w-8 text-red-500" />
              </div>
              <h3 className="font-semibold text-sm mb-2">Continue with Google</h3>
              <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                Connect your Gmail to read your inbox right here — secure, read-only, and disconnectable anytime.
              </p>
              <button
                onClick={connect}
                className="inline-flex items-center gap-2 h-10 px-5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition active:scale-95"
              >
                <Mail className="h-4 w-4" />
                Connect Gmail
              </button>
              {error && (
                <p className="mt-3 text-xs text-red-500">{error}</p>
              )}
            </div>
          </div>
        ) : view === "detail" && selectedMessage ? (
          <div className="p-4 space-y-4">
            <div>
              <h2 className="text-sm font-semibold leading-snug">{selectedMessage.subject}</h2>
              <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                <div className="flex gap-2">
                  <span className="w-12 shrink-0 font-medium">From:</span>
                  <span>{selectedMessage.from}</span>
                </div>
                <div className="flex gap-2">
                  <span className="w-12 shrink-0 font-medium">To:</span>
                  <span>{selectedMessage.to}</span>
                </div>
                <div className="flex gap-2">
                  <span className="w-12 shrink-0 font-medium">Date:</span>
                  <span>{selectedMessage.date}</span>
                </div>
              </div>
            </div>
            <div className="border-t border-border pt-4">
              <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                {selectedMessage.body || selectedMessage.snippet}
              </div>
            </div>
          </div>
        ) : (
          <div>
            {/* Inbox header */}
            <div className="flex items-center justify-between px-4 h-10 border-b border-border">
              <div className="flex items-center gap-2">
                <Inbox className="h-4 w-4 text-foreground/60" />
                <span className="text-xs font-medium text-foreground/60">Inbox</span>
              </div>
              <span className="text-[11px] text-muted-foreground">{status.email}</span>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-12">
                <p className="text-xs text-red-500 mb-2">{error}</p>
                <button
                  onClick={fetchInbox}
                  className="text-xs text-primary hover:underline"
                >
                  Try again
                </button>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Mail className="h-8 w-8 text-muted-foreground/30 mb-2" />
                <p className="text-xs text-muted-foreground">No messages in inbox</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {messages.map((msg) => (
                  <button
                    key={msg.id}
                    onClick={() => handleOpenMessage(msg)}
                    className={cn(
                      "w-full text-left px-4 py-3 transition hover:bg-accent/50 active:bg-accent",
                      msg.isUnread && "bg-blue-50/50",
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className={cn(
                        "text-sm truncate",
                        msg.isUnread ? "font-semibold" : "font-medium text-foreground/80",
                      )}>
                        {extractSenderName(msg.from)}
                      </span>
                      <span className="text-[11px] text-muted-foreground shrink-0">
                        {formatEmailDate(msg.date)}
                      </span>
                    </div>
                    <p className={cn(
                      "text-xs mt-0.5 truncate",
                      msg.isUnread ? "font-medium text-foreground/80" : "text-muted-foreground",
                    )}>
                      {msg.subject}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                      {msg.snippet}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
