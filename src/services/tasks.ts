import { api } from "./api";

export type TaskPriority = "low" | "medium" | "high";
export type RecurringRule = "daily" | "weekdays" | "weekly" | "monthly" | "yearly" | null;

export interface TaskDTO {
  _id: string;
  userId: string;
  title: string;
  content: string;
  dueAt: string | null;
  done: boolean;
  priority: TaskPriority;
  tags: string[];
  reminderAt: string | null;
  isRecurring: boolean;
  recurringRule: RecurringRule;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export async function fetchTasks(params?: { done?: boolean; priority?: string; tag?: string; archived?: boolean }): Promise<TaskDTO[]> {
  const { data } = await api.get("/tasks", { params });
  return data;
}

export async function fetchTask(taskId: string): Promise<TaskDTO> {
  const { data } = await api.get(`/tasks/${taskId}`);
  return data;
}

export async function createTask(payload: {
  title?: string;
  content?: string;
  dueAt?: string | null;
  priority?: TaskPriority;
  tags?: string[];
  reminderAt?: string | null;
  isRecurring?: boolean;
  recurringRule?: RecurringRule;
}): Promise<TaskDTO> {
  const { data } = await api.post("/tasks", payload);
  return data;
}

export async function updateTask(taskId: string, payload: Partial<Pick<TaskDTO, "title" | "content" | "dueAt" | "done" | "priority" | "tags" | "reminderAt" | "isRecurring" | "recurringRule" | "isArchived">>): Promise<TaskDTO> {
  const { data } = await api.put(`/tasks/${taskId}`, payload);
  return data;
}

export async function deleteTask(taskId: string): Promise<void> {
  await api.delete(`/tasks/${taskId}`);
}
