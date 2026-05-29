import { useState, useEffect, useRef } from "react";
import { MessageCircle, Plus, Trash2, Send, Bot, StopCircle, Sparkles, StickyNote, CheckSquare } from "lucide-react";
import { HellowModal } from "@/components/HellowModal";
import { MarkdownRenderer } from "@/components/ui/MarkdownRenderer";
import { useUIStore } from "@/store/useUIStore";
import { useAIChatStore } from "@/store/useAIChatStore";
import { useAIChatStream } from "@/hooks/useAIChatStream";
import { useConversationsQuery, useConversationQuery, useCreateConversationMutation, useDeleteConversationMutation } from "@/hooks/useAIChatMutations";
import { useCreateNoteMutation } from "@/hooks/useNotesMutations";
import { useCreateTaskMutation } from "@/hooks/useTasksMutations";
import { cn } from "@/lib/utils";

export function AIChatModal() {
  const open = useUIStore((s) => s.modals.aiChat);
  const closeModal = useUIStore((s) => s.closeModal);
  const showToast = useUIStore((s) => s.showToast);

  const {
    conversations,
    activeConversationId,
    messages,
    streamingContent,
    isStreaming,
    error,
    setActiveConversation,
    addMessage,
  } = useAIChatStore();

  const { streamChat, cancel } = useAIChatStream();
  const [input, setInput] = useState("");
  const [showSidebar, setShowSidebar] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useConversationsQuery();
  useConversationQuery(activeConversationId);

  const createConv = useCreateConversationMutation();
  const deleteConv = useDeleteConversationMutation();
  const createNote = useCreateNoteMutation();
  const createTask = useCreateTaskMutation();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  function handleSend() {
    if (!input.trim() || isStreaming) return;
    const text = input.trim();
    setInput("");

    if (!activeConversationId) {
      createConv.mutate(text.slice(0, 50) + (text.length > 50 ? "…" : ""), {
        onSuccess: (conv) => {
          streamChat(conv.id, text);
        },
      });
    } else {
      streamChat(activeConversationId, text);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleNewChat() {
    setActiveConversation(null);
  }

  function handleSaveAsNote(content: string) {
    createNote.mutate({ title: "AI Response", content, tags: ["ai"] });
    showToast("Saved as note", "success");
  }

  function handleSaveAsTask(content: string) {
    createTask.mutate({ title: content.slice(0, 100), content });
    showToast("Saved as task", "success");
  }

  const allMessages = [
    ...messages,
    ...(streamingContent ? [{ role: "assistant" as const, content: streamingContent, id: "streaming" }] : []),
  ];

  return (
    <HellowModal open={open} onClose={() => closeModal("aiChat")} title="AI Chat" maxWidth="max-w-[900px]">
      <div className="flex h-[70vh] gap-0 -mx-6 -mb-6">
        {/* Sidebar */}
        {showSidebar && (
          <div className="w-56 shrink-0 border-r border-border flex flex-col">
            <div className="p-3 border-b border-border">
              <button
                onClick={handleNewChat}
                className="flex items-center gap-2 w-full h-9 px-3 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition"
              >
                <Plus className="h-4 w-4" /> New Chat
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
              {conversations.map((conv) => (
                <div
                  key={conv.id}
                  className={cn(
                    "group flex items-center gap-2 px-2.5 py-2 rounded-lg text-sm cursor-pointer transition",
                    activeConversationId === conv.id
                      ? "bg-accent"
                      : "hover:bg-accent/50",
                  )}
                  onClick={() => setActiveConversation(conv.id)}
                >
                  <MessageCircle className="h-4 w-4 shrink-0 text-foreground/40" />
                  <span className="truncate flex-1">{conv.title}</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteConv.mutate(conv.id); }}
                    className="opacity-0 group-hover:opacity-100 h-6 w-6 grid place-items-center rounded hover:bg-accent transition shrink-0"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-foreground/40" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Chat area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            {allMessages.length === 0 && !isStreaming && (
              <div className="h-full grid place-items-center text-center">
                <div>
                  <Bot className="h-10 w-10 text-primary/30 mx-auto mb-3" />
                  <p className="text-sm text-foreground/50 max-w-xs">
                    Ask anything — write code, generate ideas, or explore topics.
                  </p>
                </div>
              </div>
            )}

            {allMessages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex gap-3",
                  msg.role === "user" ? "justify-end" : "justify-start",
                )}
              >
                <div
                  className={cn(
                    "max-w-[75%] rounded-2xl px-4 py-2.5 text-sm",
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-surface border border-border",
                  )}
                >
                  {msg.role === "assistant" ? (
                    <MarkdownRenderer content={msg.content} />
                  ) : (
                    <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  )}

                  {/* Streaming cursor */}
                  {msg.id === "streaming" && (
                    <span className="inline-block w-2 h-4 bg-foreground/60 ml-0.5 animate-pulse" />
                  )}

                  {/* Action buttons on assistant messages */}
                  {msg.role === "assistant" && msg.id !== "streaming" && (
                    <div className="flex items-center gap-1 mt-2 pt-2 border-t border-border/50">
                      <button
                        onClick={() => handleSaveAsNote(msg.content)}
                        className="flex items-center gap-1 h-7 px-2 rounded-md text-xs text-foreground/50 hover:text-foreground hover:bg-accent/50 transition"
                      >
                        <StickyNote className="h-3.5 w-3.5" /> Note
                      </button>
                      <button
                        onClick={() => handleSaveAsTask(msg.content)}
                        className="flex items-center gap-1 h-7 px-2 rounded-md text-xs text-foreground/50 hover:text-foreground hover:bg-accent/50 transition"
                      >
                        <CheckSquare className="h-3.5 w-3.5" /> Task
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {error && (
              <div className="text-center">
                <p className="text-xs text-red-500 bg-red-500/10 rounded-lg px-3 py-2 inline-block">{error}</p>
                <button
                  onClick={() => useAIChatStore.getState().setError(null)}
                  className="text-xs text-foreground/40 ml-2 hover:text-foreground"
                >
                  Dismiss
                </button>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-border p-3">
            <div className="flex items-end gap-2 rounded-2xl border border-border bg-surface px-4 py-2.5 focus-within:border-primary/40 transition">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything..."
                rows={1}
                className="flex-1 bg-transparent outline-none text-sm resize-none max-h-32 leading-relaxed"
                style={{ minHeight: "1.5rem" }}
              />
              {isStreaming ? (
                <button
                  onClick={cancel}
                  className="h-8 w-8 grid place-items-center rounded-full hover:bg-accent transition text-foreground/60"
                >
                  <StopCircle className="h-5 w-5" />
                </button>
              ) : (
                <button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="h-8 w-8 grid place-items-center rounded-full bg-primary text-primary-foreground hover:opacity-90 transition disabled:opacity-30"
                >
                  <Send className="h-4 w-4" />
                </button>
              )}
            </div>
            <p className="text-[11px] text-foreground/30 mt-1.5 px-1">
              Powered by AI · Responses may not be accurate
            </p>
          </div>
        </div>
      </div>
    </HellowModal>
  );
}
