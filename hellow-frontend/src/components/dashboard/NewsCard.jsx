import { format } from 'date-fns'

export function NewsCard({ article }) {
  const placeholderImg = 'https://images.unsplash.com/photo-1504711434969-e33886168d6c?w=400&h=250&fit=crop'

  return (
    <div className="bg-white border border-[--border] rounded-xl overflow-hidden hover:shadow-md transition-shadow">
      <div className="h-40 bg-[--bg-secondary] overflow-hidden">
        <img
          src={article.urlToImage || placeholderImg}
          alt={article.title}
          className="w-full h-full object-cover"
          onError={(e) => { e.target.src = placeholderImg }}
        />
      </div>
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] text-[--text-muted] font-medium">{article.source?.name || 'Source'}</span>
          <span className="text-[10px] text-[--text-muted]">·</span>
          <span className="text-[10px] text-[--text-muted]">{article.publishedAt ? format(new Date(article.publishedAt), 'MMM d, yyyy') : 'Recent'}</span>
        </div>
        <h3 className="text-sm font-semibold text-[--text-primary] line-clamp-2 mb-1 leading-snug">{article.title}</h3>
        <p className="text-xs text-[--text-secondary] line-clamp-2">{article.description}</p>
      </div>
    </div>
  )
}
