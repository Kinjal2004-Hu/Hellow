import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as aiService from "@/services/ai";
import { useAIChatStore } from "@/store/useAIChatStore";
import { useUIStore } from "@/store/useUIStore";

export function useConversationsQuery() {
  const setConversations = useAIChatStore((s) => s.setConversations);

  return useQuery({
    queryKey: ["ai", "conversations"],
    queryFn: async () => {
      const convs = await aiService.fetchConversations();
      setConversations(convs);
      return convs;
    },
    staleTime: 30_000,
  });
}

export function useConversationQuery(contextId: string | null) {
  const setMessages = useAIChatStore((s) => s.setMessages);

  return useQuery({
    queryKey: ["ai", "conversation", contextId],
    queryFn: async () => {
      const conv = await aiService.fetchConversation(contextId!);
      const messages = conv.entries
        .filter((e) => e.role === "user" || e.role === "assistant")
        .map((e) => ({ role: e.role as "user" | "assistant", content: e.content, id: crypto.randomUUID() }));
      setMessages(messages);
      return conv;
    },
    enabled: !!contextId,
    staleTime: 10_000,
  });
}

export function useCreateConversationMutation() {
  const queryClient = useQueryClient();
  const addConversation = useAIChatStore((s) => s.addConversation);
  const setActiveConversation = useAIChatStore((s) => s.setActiveConversation);

  return useMutation({
    mutationFn: (title?: string) => aiService.createConversation(title),
    onSuccess: (conv) => {
      addConversation(conv);
      setActiveConversation(conv.id);
      queryClient.invalidateQueries({ queryKey: ["ai", "conversations"] });
    },
  });
}

export function useDeleteConversationMutation() {
  const queryClient = useQueryClient();
  const removeConversation = useAIChatStore((s) => s.removeConversation);
  const setActiveConversation = useAIChatStore((s) => s.setActiveConversation);
  const activeId = useAIChatStore((s) => s.activeConversationId);

  return useMutation({
    mutationFn: (id: string) => aiService.deleteConversation(id),
    onSuccess: (_, id) => {
      removeConversation(id);
      if (activeId === id) setActiveConversation(null);
      queryClient.invalidateQueries({ queryKey: ["ai", "conversations"] });
    },
  });
}

// ─── Feature mutations ───

export function useGenerateNoteContentMutation() {
  const showToast = useUIStore((s) => s.showToast);

  return useMutation({
    mutationFn: (payload: aiService.NoteGenerationRequest) => aiService.generateNoteContent(payload),
    onError: () => showToast("AI note generation failed", "error"),
  });
}

export function useSummarizeMutation() {
  const showToast = useUIStore((s) => s.showToast);

  return useMutation({
    mutationFn: (payload: aiService.SummaryRequest) => aiService.summarize(payload),
    onError: () => showToast("AI summarization failed", "error"),
  });
}

export function useExtractTasksMutation() {
  const showToast = useUIStore((s) => s.showToast);

  return useMutation({
    mutationFn: (payload: { source: string; context?: string }) => aiService.extractTasks(payload),
    onError: () => showToast("AI task extraction failed", "error"),
  });
}
