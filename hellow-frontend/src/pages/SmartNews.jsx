import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Newspaper, Search, Settings, Bookmark, BookOpen, Sparkles, ChevronRight } from 'lucide-react'
import { api } from '../services/api'
import { QUERY_KEYS } from '../utils/constants'
import { useUIStore } from '../store/useUIStore'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Skeleton } from '../components/ui/Skeleton'
import { EmptyState } from '../components/ui/EmptyState'
import { formatRelative } from '../utils/formatDate'

const tabs = ['For You', 'All News', 'Saved']
const categories = ['General', 'Technology', 'Business', 'Science', 'Health', 'Sports', 'Entertainment']

export function SmartNewsPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const showToast = useUIStore((s) => s.showToast)
  const [activeTab, setActiveTab] = useState('For You')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('General')

  const { data: newsData, isLoading } = useQuery({
    queryKey: QUERY_KEYS.news(selectedCategory.toLowerCase()),
    queryFn: () => api.get(`/news?category=${selectedCategory.toLowerCase()}`),
  })

  const { data: savedData } = useQuery({
    queryKey: ['saved-news'],
    queryFn: () => api.get('/news/saved'),
    enabled: activeTab === 'Saved',
  })

  const bookmarkMutation = useMutation({
    mutationFn: (articleId) => api.post(`/news/${articleId}/bookmark`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-news'] })
      showToast('Article bookmarked', 'success')
    },
  })

  const summarizeMutation = useMutation({
    mutationFn: (articleId) => api.post(`/news/${articleId}/summarize`),
    onSuccess: (data) => {
      showToast(data.summary ? 'Summary ready' : 'Summarization failed', data.summary ? 'success' : 'error')
    },
  })

  const headlines = newsData?.headlines || []
  const articles = newsData?.articles || []
  const savedArticles = savedData?.articles || []

  const headlinesText = headlines.length > 0
    ? headlines.map((h) => h.title).join('  ●  ')
    : 'Loading headlines...'

  const displayArticles = activeTab === 'Saved' ? savedArticles : articles
  const filteredArticles = searchQuery
    ? displayArticles.filter(
        (a) =>
          a.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.excerpt?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : displayArticles

  return (
    <div className="max-w-5xl mx-auto px-8 py-8">
      <div className="flex items-center gap-4 mb-4">
        <button onClick={() => navigate('/')} className="text-[#6B6B6B] hover:text-[#1A1A1A] cursor-pointer">
          <ArrowLeft size={20} />
        </button>
        <Newspaper size={22} className="text-[#1A1A1A]" />
        <h1 className="text-2xl font-semibold text-[#1A1A1A]">Smart News</h1>
        <div className="relative flex-1 max-w-md ml-8">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B6B6B]" />
          <Input
            placeholder="Search news..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <button className="ml-auto text-[#6B6B6B] hover:text-[#1A1A1A] cursor-pointer">
          <Settings size={20} />
        </button>
      </div>

      {headlines.length > 0 && (
        <div className="overflow-hidden mb-6 bg-white border border-[#D9D9D9] rounded-xl px-4 py-2.5">
          <div className="flex items-center gap-2 overflow-hidden">
            <Sparkles size={14} className="text-[#22C55E] shrink-0" />
            <div className="overflow-hidden whitespace-nowrap animate-[scroll_30s_linear_infinite]">
              <span className="text-sm text-[#4A4A4A]">{headlinesText}</span>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-3 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors cursor-pointer ${
              activeTab === tab
                ? 'bg-[#1A1A1A] text-white'
                : 'bg-white text-[#4A4A4A] border border-[#D9D9D9] hover:bg-[#EDEDE8]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab !== 'Saved' && (
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#1A1A1A] text-white'
                  : 'bg-white text-[#4A4A4A] border border-[#D9D9D9] hover:bg-[#EDEDE8]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white border border-[#D9D9D9] rounded-xl overflow-hidden">
              <Skeleton className="h-40 w-full rounded-none" />
              <div className="p-4 space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredArticles.length === 0 ? (
        <EmptyState
          icon={<Newspaper size={32} />}
          title={searchQuery ? 'No articles match your search' : activeTab === 'Saved' ? 'No saved articles' : 'No articles available'}
          description={searchQuery ? 'Try different keywords' : activeTab === 'Saved' ? 'Bookmark articles to read later' : 'Check back later for new articles'}
        />
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {filteredArticles.map((article) => (
            <div
              key={article._id}
              className="bg-white border border-[#D9D9D9] rounded-xl overflow-hidden hover:border-[#1A1A1A] transition-colors group"
            >
              <div className="h-40 bg-gradient-to-br from-amber-100 to-green-100 flex items-center justify-center">
                {article.imageUrl ? (
                  <img
                    src={article.imageUrl}
                    alt={article.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <Newspaper size={32} className="text-[#6B6B6B]" />
                )}
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[11px] font-medium text-[#6B6B6B] uppercase">
                    {article.source || 'Source'}
                  </span>
                  <span className="text-[11px] text-[#6B6B6B]">·</span>
                  <span className="text-[11px] text-[#6B6B6B]">
                    {formatRelative(article.publishedAt || article.createdAt)}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-[#1A1A1A] mb-1 line-clamp-2 leading-snug">
                  {article.title}
                </h3>
                {article.excerpt && (
                  <p className="text-xs text-[#6B6B6B] line-clamp-2 mb-3">{article.excerpt}</p>
                )}
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button size="sm" variant="ghost" onClick={() => window.open(article.url, '_blank')}>
                    <BookOpen size={14} /> Read
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => summarizeMutation.mutate(article._id)}
                    disabled={summarizeMutation.isPending}
                  >
                    <Sparkles size={14} /> Summarize
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => bookmarkMutation.mutate(article._id)}
                  >
                    <Bookmark size={14} />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
