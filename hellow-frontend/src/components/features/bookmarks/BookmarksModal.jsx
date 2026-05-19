import { useState } from 'react'
import { Bookmark, BookmarkPlus } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Modal } from '../../ui/Modal'
import { Button } from '../../ui/Button'
import { Input } from '../../ui/Input'
import { Skeleton } from '../../ui/Skeleton'
import { EmptyState } from '../../ui/EmptyState'
import { useUIStore } from '../../../store/useUIStore'
import { api } from '../../../services/api'
import { QUERY_KEYS } from '../../../utils/constants'
import { BookmarkItem } from './BookmarkItem'

export function BookmarksModal() {
  const open = useUIStore((s) => s.modals.bookmarks)
  const close = () => useUIStore.getState().closeModal('bookmarks')
  const showToast = useUIStore((s) => s.showToast)
  const queryClient = useQueryClient()

  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [notes, setNotes] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: QUERY_KEYS.bookmarks,
    queryFn: () => api.get('/bookmarks'),
    enabled: open,
  })

  const createMutation = useMutation({
    mutationFn: (body) => api.post('/bookmarks', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.bookmarks })
      setTitle('')
      setUrl('')
      setNotes('')
      showToast('Bookmark added', 'success')
    },
    onError: (err) => showToast(err.message, 'error'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/bookmarks/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.bookmarks })
      showToast('Bookmark deleted', 'success')
    },
    onError: (err) => showToast(err.message, 'error'),
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!title.trim() || !url.trim()) return
    createMutation.mutate({
      title: title.trim(),
      url: url.trim(),
      notes: notes.trim(),
    })
  }

  const bookmarks = data?.data || []

  return (
    <Modal open={open} onClose={close} title="Bookmarks">
      <form onSubmit={handleSubmit} className="space-y-3 mb-6">
        <Input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <Input
          placeholder="https://..."
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
        />
        <textarea
          placeholder="Notes (optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="w-full px-4 py-2.5 bg-white border border-[#D9D9D9] rounded-xl text-sm text-[--text-primary] placeholder:text-[--text-muted] outline-none focus:border-[--text-primary] transition-colors resize-none"
        />
        <Button
          type="submit"
          variant="primary"
          size="sm"
          disabled={!title.trim() || !url.trim()}
        >
          + Add
        </Button>
      </form>

      <div className="border-t border-[#D9D9D9] pt-6">
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : bookmarks.length === 0 ? (
          <EmptyState
            icon={<BookmarkPlus size={24} />}
            title="Nothing yet. Add your first one above."
          />
        ) : (
          <div className="space-y-2">
            {bookmarks.map((b) => (
              <BookmarkItem
                key={b._id}
                bookmark={b}
                onDelete={(id) => deleteMutation.mutate(id)}
              />
            ))}
          </div>
        )}
      </div>
    </Modal>
  )
}
