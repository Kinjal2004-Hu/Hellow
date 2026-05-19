import { X, ExternalLink } from 'lucide-react'

export function BookmarkItem({ bookmark, onDelete }) {
  const domain = (() => {
    try {
      return new URL(bookmark.url).hostname
    } catch {
      return bookmark.url
    }
  })()

  return (
    <div className="group bg-[--bg-secondary] rounded-lg p-3 flex items-start justify-between gap-3">
      <div className="flex-1 min-w-0">
        <a
          href={bookmark.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-[--text-primary] hover:underline flex items-center gap-1"
        >
          {bookmark.title}
          <ExternalLink size={12} className="text-[--text-muted] flex-shrink-0" />
        </a>
        <p className="text-xs text-[--text-muted] mt-0.5 truncate">{domain}</p>
        {bookmark.notes && (
          <p className="text-xs text-[--text-muted] mt-1 truncate">{bookmark.notes}</p>
        )}
      </div>
      <button
        onClick={() => onDelete(bookmark._id)}
        className="opacity-0 group-hover:opacity-100 text-[--text-muted] hover:text-red-500 transition-all cursor-pointer flex-shrink-0"
      >
        <X size={14} />
      </button>
    </div>
  )
}
