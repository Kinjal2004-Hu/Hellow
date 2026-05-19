import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '../../services/api'
import { QUERY_KEYS } from '../../utils/constants'
import { Skeleton } from '../ui/Skeleton'
import { Sparkles, ChevronRight } from 'lucide-react'

export function MicroLearningCard() {
  const [currentIdea, setCurrentIdea] = useState(0)

  const { data, isLoading } = useQuery({
    queryKey: QUERY_KEYS.microLearning,
    queryFn: () => api.get('/micro-learning/today'),
  })

  if (isLoading) {
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-3 w-36" />
        </div>
        <div className="bg-white border border-[--border] rounded-xl overflow-hidden flex">
          <Skeleton className="w-56 h-44" />
          <div className="flex-1 p-6 space-y-3">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-6 w-64" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-8 w-28" />
          </div>
        </div>
      </div>
    )
  }

  const book = data?.data
  if (!book) return null

  const ideas = book.ideas || []
  const idea = ideas[currentIdea] || { title: 'Deep Work', body: 'Focus on what matters most.' }

  const nextIdea = () => {
    setCurrentIdea((prev) => (prev + 1) % Math.max(ideas.length, 1))
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[11px] font-semibold text-[--text-muted] uppercase tracking-wider">Micro-Learning</span>
        <span className="text-xs text-[--text-muted] flex items-center gap-1">
          <Sparkles size={12} /> Short reads, big ideas
        </span>
      </div>
      <div className="bg-white border border-[--border] rounded-xl overflow-hidden flex flex-col md:flex-row">
        <div className="relative w-full md:w-56 h-44 md:h-auto bg-gradient-to-br from-amber-100 to-orange-200 flex-shrink-0">
          <span className="absolute top-3 left-3 px-2.5 py-1 bg-white/90 text-[11px] font-medium rounded-full flex items-center gap-1">
            📚 {book.category || 'Productivity'}
          </span>
        </div>
        <div className="flex-1 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs text-[--text-muted]">{book.author || 'Author'}</span>
              <span className="text-[10px] text-[--text-muted] bg-[--bg-secondary] px-2 py-0.5 rounded-full">{book.readTime || '3 min read'}</span>
            </div>
            <h3 className="text-xl font-bold text-[--text-primary] mb-2">{book.bookTitle}</h3>
            <p className="text-sm text-[--text-secondary] leading-relaxed line-clamp-3">{idea.body}</p>
          </div>
          <div className="flex items-center justify-between mt-4">
            <button onClick={nextIdea} className="flex items-center gap-1 text-sm font-medium text-[--text-primary] hover:opacity-70 transition-opacity cursor-pointer">
              Next idea <ChevronRight size={16} />
            </button>
            <span className="text-xs text-[--text-muted]">{currentIdea + 1}/{Math.max(ideas.length, 1)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
