import { useMutation } from "@tanstack/react-query";
import * as aiService from "@/services/ai";
import { useUIStore } from "@/store/useUIStore";
import { useCreateTaskMutation } from "./useTasksMutations";

export function useGenerateMicroLearningMutation() {
  const showToast = useUIStore((s) => s.showToast);

  return useMutation({
    mutationFn: (payload: Parameters<typeof aiService.generateMicroLearning>[0]) =>
      aiService.generateMicroLearning(payload),
    onError: () => showToast("Micro-learning generation failed", "error"),
  });
}

export function useSaveLessonAsNoteMutation() {
  const showToast = useUIStore((s) => s.showToast);

  return useMutation({
    mutationFn: async (lesson: { title: string; content: string }) => {
      const { createNote } = await import("@/services/notes");
      return createNote({ title: `Lesson: ${lesson.title}`, content: lesson.content, tags: ["ai", "lesson"] });
    },
    onSuccess: () => {
      showToast("Lesson saved as note", "success");
    },
    onError: () => showToast("Failed to save lesson", "error"),
  });
}

export function useGenerateQuizFromLessonMutation() {
  return useMutation({
    mutationFn: async (lessonContent: string) => {
      return aiService.generateMicroLearning({
        topic: "Quiz from lesson",
        format: "qa",
      });
    },
  });
}
