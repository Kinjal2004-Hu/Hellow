import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/useAuthStore'
import { useUIStore } from '../../store/useUIStore'
import { FileText, CheckSquare, Calendar, Bookmark, UserPlus, Search, LogOut } from 'lucide-react'
import { format } from 'date-fns'
import { useState } from 'react'

export function Navbar() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const openModal = useUIStore((s) => s.openModal)
  const setSearchQuery = useUIStore((s) => s.setSearchQuery)
  const [query, setQuery] = useState('')

  const handleSearch = (e) => {
    e.preventDefault()
    if (query.trim()) {
      setSearchQuery(query.trim())
      openModal('search')
    }
  }

  const now = new Date()
  const formattedDate = format(now, 'EEE, MMM d · h:mm a')

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-[--bg-primary] border-b border-[--border] z-10 flex items-center justify-between px-6">
      <div className="flex items-center gap-6">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 cursor-pointer">
          <div className="w-8 h-8 bg-[#1A1A1A] rounded-xl flex items-center justify-center text-white font-bold text-sm">H</div>
          <span className="font-bold text-[--text-primary] text-lg">Hellow</span>
        </button>
        <div className="hidden lg:block">
          <p className="text-sm font-semibold text-[--text-primary]">Hello, {user?.username || 'User'}</p>
          <p className="text-xs text-[--text-muted]">{formattedDate}</p>
        </div>
      </div>

      <form onSubmit={handleSearch} className="flex items-center gap-2 flex-1 max-w-xl mx-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search the web with DuckDuckGo..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full px-4 py-2 bg-white border border-[--border] rounded-full text-sm text-[--text-primary] placeholder:text-[--text-muted] outline-none focus:border-[--accent-black] transition-colors"
          />
        </div>
        <button type="submit" className="px-4 py-2 bg-[#1A1A1A] text-white text-sm font-medium rounded-full hover:bg-[#333] transition-colors cursor-pointer flex items-center gap-1.5">
          <Search size={14} />
          Search
        </button>
      </form>

      <div className="flex items-center gap-3">
        <button onClick={() => openModal('notes')} className="p-2 text-[--text-muted] hover:text-[--text-primary] transition-colors cursor-pointer" title="Notes">
          <FileText size={18} />
        </button>
        <button onClick={() => openModal('tasks')} className="p-2 text-[--text-muted] hover:text-[--text-primary] transition-colors cursor-pointer" title="Tasks">
          <CheckSquare size={18} />
        </button>
        <button onClick={() => openModal('calendar')} className="p-2 text-[--text-muted] hover:text-[--text-primary] transition-colors cursor-pointer" title="Calendar">
          <Calendar size={18} />
        </button>
        <button onClick={() => openModal('bookmarks')} className="p-2 text-[--text-muted] hover:text-[--text-primary] transition-colors cursor-pointer" title="Bookmarks">
          <Bookmark size={18} />
        </button>
        <button onClick={() => openModal('newContact')} className="px-4 py-2 bg-[#1A1A1A] text-white text-sm font-medium rounded-full hover:bg-[#333] transition-colors cursor-pointer flex items-center gap-1.5">
          <UserPlus size={14} />
          Add contact
        </button>
        <button onClick={logout} className="p-2 text-[--text-muted] hover:text-[--text-primary] transition-colors cursor-pointer" title="Logout">
          <LogOut size={18} />
        </button>
      </div>
    </nav>
  )
}
