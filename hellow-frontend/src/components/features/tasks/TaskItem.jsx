import { X, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '../../../utils/cn'

export function TaskItem({ task, onToggle, onDelete }) {
  return (
    <div className="group flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-[--bg-secondary] transition-colors">
      <button
        onClick={() => onToggle(task._id, !task.done)}
        className={cn(
          'w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors cursor-pointer',
          task.done
            ? 'bg-[--text-primary] border-[--text-primary]'
            : 'border-[#D9D9D9] hover:border-[--text-primary]'
        )}
      >
        {task.done && <span className="text-white text-[10px]">&#10003;</span>}
      </button>

      <div className="flex-1 min-w-0">
        <span
          className={cn(
            'text-sm',
            task.done && 'line-through text-[--text-muted]'
          )}
        >
          {task.content}
        </span>
        {task.dueAt && (
          <div className="flex items-center gap-1 mt-0.5">
            <Clock size={11} className="text-[--text-muted]" />
            <span className="text-[11px] text-[--text-muted]">
              {format(new Date(task.dueAt), 'MMM d, yyyy · h:mm a')}
            </span>
          </div>
        )}
      </div>

      <button
        onClick={() => onDelete(task._id)}
        className="opacity-0 group-hover:opacity-100 text-[--text-muted] hover:text-red-500 transition-all cursor-pointer flex-shrink-0"
      >
        <X size={14} />
      </button>
    </div>
  )
}
