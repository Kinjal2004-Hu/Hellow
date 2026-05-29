import { useRef, useCallback } from "react";
import { useAIChatStore } from "@/store/useAIChatStore";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";

export function useAIChatStream() {
  const abortRef = useRef<AbortController | null>(null);

  const {
    addMessage,
    appendStreamContent,
    commitStream,
    setStreaming,
    setError,
  } = useAIChatStore();

  const streamChat = useCallback(
    async (contextId: string | null, content: string) => {
      const token = localStorage.getItem("hellow_token");

      addMessage({ role: "user", content, id: crypto.randomUUID() });
      setStreaming(true);
      setError(null);

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        let url: string;
        let body: any;

        if (contextId) {
          url = `${API_BASE}/ai/conversations/${contextId}/messages`;
          body = { content };
        } else {
          url = `${API_BASE}/ai/complete/stream`;
          body = { messages: [{ role: "user", content }] };
        }

        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
          signal: controller.signal,
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => null);
          throw new Error(errData?.error ?? `HTTP ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error("No response body");

        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed === "data: [DONE]") continue;
            if (!trimmed.startsWith("data: ")) continue;

            try {
              const json = JSON.parse(trimmed.slice(6));
              if (json.type === "content" && json.content) {
                appendStreamContent(json.content);
              } else if (json.type === "done") {
                commitStream();
                return;
              } else if (json.type === "error") {
                setError(json.error);
                return;
              }
            } catch {}
          }
        }

        commitStream();
      } catch (err: any) {
        if (err.name === "AbortError") {
          commitStream();
          return;
        }
        setError(err.message ?? "Stream failed");
      }
    },
    [addMessage, appendStreamContent, commitStream, setStreaming, setError],
  );

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
  }, []);

  return { streamChat, cancel };
}
