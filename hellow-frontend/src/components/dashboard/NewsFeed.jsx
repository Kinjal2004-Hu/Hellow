import { useQuery } from '@tanstack/react-query'
import { api } from '../../services/api'
import { QUERY_KEYS } from '../../utils/constants'
import { NewsCard } from './NewsCard'
import { Skeleton } from '../ui/Skeleton'
import { Newspaper } from 'lucide-react'

export function NewsFeed() {
  const { data, isLoading } = useQuery({
    queryKey: QUERY_KEYS.news('general'),
    queryFn: () => api.get('/news?category=general'),
  })

  const articles = data?.data?.articles || []

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-[--text-muted] uppercase tracking-wider">Latest</span>
        </div>
        <h2 className="text-lg font-semibold text-[--text-primary] flex items-center gap-2">
          <Newspaper size={18} /> News for you
        </h2>
        <div />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="bg-white border border-[--border] rounded-xl overflow-hidden">
              <Skeleton className="h-40 w-full" />
              <div className="p-4 space-y-2">
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {articles?.slice(0, 9).map((article, idx) => (
            <NewsCard key={idx} article={article} />
          ))}
        </div>
      )}
    </div>
  )
}
