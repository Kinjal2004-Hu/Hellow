import { X } from 'lucide-react'
import { formatRelative } from '../../../utils/formatDate'

export function NoteItem({ note, onDelete }) {
  return (
    <div className="group bg-[--bg-secondary] rounded-lg p-3 flex items-start justify-between gap-3">
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm text-[--text-primary] truncate">{note.title}</p>
        {note.content && (
          <p className="text-xs text-[--text-muted] mt-0.5 truncate">{note.content}</p>
        )}
        <p className="text-[11px] text-[--text-muted] mt-1">
          {formatRelative(note.createdAt)}
        </p>
      </div>
      <button
        onClick={() => onDelete(note._id)}
        className="opacity-0 group-hover:opacity-100 text-[--text-muted] hover:text-red-500 transition-all cursor-pointer flex-shrink-0"
      >
        <X size={14} />
      </button>
    </div>
  )
}
