import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as tasksService from "@/services/tasks";
import { useUIStore } from "@/store/useUIStore";

export function useTasksQuery(params?: { done?: boolean; priority?: string; tag?: string; archived?: boolean }) {
  return useQuery({
    queryKey: ["tasks", params],
    queryFn: () => tasksService.fetchTasks(params),
    staleTime: 30_000,
  });
}

export function useTaskQuery(taskId: string | null) {
  return useQuery({
    queryKey: ["tasks", "detail", taskId],
    queryFn: () => tasksService.fetchTask(taskId!),
    enabled: !!taskId,
  });
}

export function useCreateTaskMutation() {
  const queryClient = useQueryClient();
  const showToast = useUIStore((s) => s.showToast);

  return useMutation({
    mutationFn: tasksService.createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      showToast("Task created", "success");
    },
    onError: () => showToast("Failed to create task", "error"),
  });
}

export function useUpdateTaskMutation() {
  const queryClient = useQueryClient();
  const showToast = useUIStore((s) => s.showToast);

  return useMutation({
    mutationFn: ({ taskId, ...payload }: { taskId: string } & Parameters<typeof tasksService.updateTask>[1]) =>
      tasksService.updateTask(taskId, payload),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["tasks", "detail", vars.taskId] });
    },
    onError: () => showToast("Failed to update task", "error"),
  });
}

export function useDeleteTaskMutation() {
  const queryClient = useQueryClient();
  const showToast = useUIStore((s) => s.showToast);

  return useMutation({
    mutationFn: tasksService.deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      showToast("Task deleted", "success");
    },
    onError: () => showToast("Failed to delete task", "error"),
  });
}
