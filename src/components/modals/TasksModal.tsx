import { useState } from "react";
import { CheckSquare, Plus, Trash2, Flag, Calendar as CalendarIcon, Circle, CheckCircle, Sparkles } from "lucide-react";
import { HellowModal } from "@/components/HellowModal";
import { useUIStore } from "@/store/useUIStore";
import { useTasksQuery, useCreateTaskMutation, useUpdateTaskMutation, useDeleteTaskMutation } from "@/hooks/useTasksMutations";
import { useExtractTasksMutation } from "@/hooks/useAIChatMutations";
import type { TaskDTO, TaskPriority } from "@/services/tasks";

const priorityColors: Record<TaskPriority, string> = {
  low: "text-blue-500",
  medium: "text-amber-500",
  high: "text-red-500",
};

export function TasksModal() {
  const open = useUIStore((s) => s.modals.tasks);
  const closeModal = useUIStore((s) => s.closeModal);
  const [filter, setFilter] = useState<"all" | "active" | "done">("active");
  const [newTitle, setNewTitle] = useState("");
  const [newPriority, setNewPriority] = useState<TaskPriority>("medium");
  const [showAiExtract, setShowAiExtract] = useState(false);
  const [extractText, setExtractText] = useState("");

  const { data: tasks = [], isLoading } = useTasksQuery({ archived: false });
  const createTask = useCreateTaskMutation();
  const updateTask = useUpdateTaskMutation();
  const deleteTask = useDeleteTaskMutation();
  const extractTasks = useExtractTasksMutation();

  const filtered = tasks.filter((t) => {
    if (filter === "active") return !t.done;
    if (filter === "done") return t.done;
    return true;
  });

  const overdue = tasks.filter((t) => !t.done && t.dueAt && new Date(t.dueAt) < new Date());

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    createTask.mutate({ title: newTitle.trim(), priority: newPriority });
    setNewTitle("");
  }

  function toggleDone(task: TaskDTO) {
    updateTask.mutate({ taskId: task._id, done: !task.done });
  }

  function handleAiExtract() {
    if (!extractText.trim()) return;
    extractTasks.mutate(
      { source: extractText.trim() },
      {
        onSuccess: (result) => {
          for (const t of result.tasks) {
            createTask.mutate({ title: t.title, content: t.content, priority: t.priority ?? "medium", dueAt: t.dueAt });
          }
          setExtractText("");
          setShowAiExtract(false);
        },
      },
    );
  }

  return (
    <HellowModal open={open} onClose={() => closeModal("tasks")} title="Tasks" maxWidth="max-w-[600px]">
      <div className="flex flex-col gap-4">
        {/* Create */}
        <form onSubmit={handleCreate} className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 rounded-lg bg-surface border border-border px-3 h-9">
            <Plus className="h-4 w-4 text-foreground/40 shrink-0" />
            <input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Add a new task..."
              className="flex-1 bg-transparent outline-none text-sm"
            />
          </div>
          <select
            value={newPriority}
            onChange={(e) => setNewPriority(e.target.value as TaskPriority)}
            className="h-9 rounded-lg border border-border bg-surface text-xs px-2 outline-none"
          >
            <option value="low">Low</option>
            <option value="medium">Med</option>
            <option value="high">High</option>
          </select>
          <button
            type="submit"
            className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition"
          >
            Add
          </button>
          <button
            type="button"
            onClick={() => setShowAiExtract(!showAiExtract)}
            className="h-9 px-3 rounded-lg border border-border text-xs font-medium text-foreground/60 hover:bg-accent transition flex items-center gap-1"
          >
            <Sparkles className="h-3.5 w-3.5" /> AI Extract
          </button>
        </form>

        {/* AI Extract */}
        {showAiExtract && (
          <div className="flex flex-col gap-2 p-3 rounded-xl bg-surface border border-border">
            <p className="text-xs text-foreground/50">Paste text below and AI will extract tasks from it</p>
            <textarea
              value={extractText}
              onChange={(e) => setExtractText(e.target.value)}
              placeholder="Paste meeting notes, email, or any text with actionable items..."
              rows={4}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none resize-none"
            />
            <button
              onClick={handleAiExtract}
              disabled={!extractText.trim() || extractTasks.isPending}
              className="self-end h-8 px-4 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition disabled:opacity-40"
            >
              {extractTasks.isPending ? "Extracting..." : "Extract Tasks"}
            </button>
          </div>
        )}

        {/* Filters */}
        <div className="flex items-center gap-4 text-xs text-foreground/50 border-b pb-2">
          {(["active", "all", "done"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`font-medium transition hover:text-foreground ${filter === f ? "text-foreground" : ""}`}
            >
              {f === "all" ? "All" : f === "active" ? "Active" : "Done"}
            </button>
          ))}
          {overdue.length > 0 && (
            <span className="ml-auto text-red-500">{overdue.length} overdue</span>
          )}
        </div>

        {/* List */}
        <div className="flex flex-col gap-1 max-h-[50vh] overflow-y-auto">
          {isLoading && <p className="text-xs text-foreground/40">Loading...</p>}
          {filtered.map((task) => (
            <div
              key={task._id}
              className="group flex items-start gap-2 px-2 py-1.5 rounded-lg hover:bg-accent/50 transition"
            >
              <button onClick={() => toggleDone(task)} className="mt-0.5 shrink-0">
                {task.done ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <Circle className="h-4 w-4 text-foreground/30 hover:text-foreground/60 transition" />
                )}
              </button>
              <div className="flex-1 min-w-0">
                <div className={`text-sm ${task.done ? "line-through text-foreground/40" : ""}`}>
                  {task.title}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <Flag className={`h-3 w-3 ${priorityColors[task.priority]}`} />
                  {task.dueAt && (
                    <span className="flex items-center gap-1 text-xs text-foreground/40">
                      <CalendarIcon className="h-3 w-3" />
                      {new Date(task.dueAt).toLocaleDateString()}
                    </span>
                  )}
                  {task.tags.map((t) => (
                    <span key={t} className="text-xs text-foreground/30">#{t}</span>
                  ))}
                  {task.dueAt && !task.done && new Date(task.dueAt) < new Date() && (
                    <span className="text-xs text-red-500 font-medium">Overdue</span>
                  )}
                </div>
              </div>
              <button
                onClick={() => deleteTask.mutate(task._id)}
                className="opacity-0 group-hover:opacity-100 h-6 w-6 grid place-items-center rounded hover:bg-accent transition shrink-0"
              >
                <Trash2 className="h-3.5 w-3.5 text-foreground/40" />
              </button>
            </div>
          ))}
          {!isLoading && filtered.length === 0 && (
            <p className="text-xs text-foreground/40 text-center py-8">
              {filter === "active" ? "No active tasks" : filter === "done" ? "No completed tasks" : "No tasks yet"}
            </p>
          )}
        </div>
      </div>
    </HellowModal>
  );
}
