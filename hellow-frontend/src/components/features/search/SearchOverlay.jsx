import { useCallback } from 'react'
import { useUIStore } from '../../../store/useUIStore'
import { X, RefreshCw, Globe, BookmarkPlus } from 'lucide-react'
import { useKeyPress } from '../../../hooks/useKeyPress'

export function SearchOverlay() {
  const searchQuery = useUIStore((s) => s.searchQuery)
  const closeModal = useUIStore((s) => s.closeModal)
  const openModal = useUIStore((s) => s.openModal)

  const encodedQuery = encodeURIComponent(searchQuery)
  const searchUrl = `https://html.duckduckgo.com/html/?q=${encodedQuery}`

  useKeyPress('Escape', useCallback(() => closeModal('search'), [closeModal]))

  const handleAddBookmark = () => {
    closeModal('search')
    setTimeout(() => openModal('bookmarks'), 300)
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={() => closeModal('search')} />
      <div className="w-[60%] bg-white h-full flex flex-col shadow-2xl">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-[--border]">
          <button onClick={() => closeModal('search')} className="p-1.5 text-[--text-muted] hover:text-[--text-primary] rounded-lg hover:bg-[--bg-secondary] transition-colors cursor-pointer">
            <X size={18} />
          </button>
          <button className="p-1.5 text-[--text-muted] hover:text-[--text-primary] rounded-lg hover:bg-[--bg-secondary] transition-colors cursor-pointer">
            <RefreshCw size={16} />
          </button>
          <Globe size={16} className="text-[--text-muted]" />
          <div className="flex-1 px-3 py-2 bg-[--bg-secondary] border border-[--border] rounded-lg text-sm text-[--text-primary] truncate">
            {searchUrl}
          </div>
          <button
            onClick={handleAddBookmark}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1A1A1A] text-white text-xs font-medium rounded-full hover:bg-[#333] transition-colors cursor-pointer"
          >
            <BookmarkPlus size={12} />
            Add Bookmark
          </button>
        </div>
        <div className="flex-1">
          <iframe
            id="ddg-iframe"
            src={searchUrl}
            className="w-full h-full border-none"
            title="DuckDuckGo Search"
            sandbox="allow-scripts allow-same-origin allow-forms"
          />
        </div>
      </div>
    </div>
  )
}
