import { useState } from 'react'
import { Sparkles, FileText } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Modal } from '../../ui/Modal'
import { Button } from '../../ui/Button'
import { Input } from '../../ui/Input'
import { Skeleton } from '../../ui/Skeleton'
import { EmptyState } from '../../ui/EmptyState'
import { useUIStore } from '../../../store/useUIStore'
import { api } from '../../../services/api'
import { generateNote } from '../../../services/ai'
import { QUERY_KEYS } from '../../../utils/constants'
import { NoteItem } from './NoteItem'

export function NotesModal() {
  const open = useUIStore((s) => s.modals.notes)
  const close = () => useUIStore.getState().closeModal('notes')
  const showToast = useUIStore((s) => s.showToast)
  const queryClient = useQueryClient()

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [aiLoading, setAiLoading] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: QUERY_KEYS.notes,
    queryFn: () => api.get('/notes'),
    enabled: open,
  })

  const createMutation = useMutation({
    mutationFn: (body) => api.post('/notes', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.notes })
      setTitle('')
      setContent('')
      showToast('Note created', 'success')
    },
    onError: (err) => showToast(err.message, 'error'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/notes/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.notes })
      showToast('Note deleted', 'success')
    },
    onError: (err) => showToast(err.message, 'error'),
  })

  const handleGenerateAI = async () => {
    setAiLoading(true)
    try {
      const res = await generateNote('productivity')
      if (res?.data) {
        setTitle(res.data.title)
        setContent(res.data.content)
        showToast('AI note generated!', 'success')
      }
    } catch {
      showToast('Failed to generate. Try again.', 'error')
    } finally {
      setAiLoading(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!title.trim()) return
    createMutation.mutate({ title: title.trim(), content: content.trim() })
  }

  const notes = data?.data || []

  return (
    <Modal open={open} onClose={close} title="Notes">
      <div className="flex items-center justify-between mb-6">
        <p className="text-xs text-[--text-muted]">
          {notes.length} {notes.length === 1 ? 'note' : 'notes'}
        </p>
        <Button variant="primary" size="sm" className="gap-1.5" onClick={handleGenerateAI} disabled={aiLoading}>
          <Sparkles size={14} />
          {aiLoading ? 'Generating...' : 'Generate with AI'}
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3 mb-6">
        <Input
          placeholder="Note title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          placeholder="Write something... (optional)"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          className="w-full px-4 py-2.5 bg-white border border-[#D9D9D9] rounded-xl text-sm text-[--text-primary] placeholder:text-[--text-muted] outline-none focus:border-[--text-primary] transition-colors resize-none"
        />
        <Button type="submit" variant="primary" size="sm" disabled={!title.trim()}>
          + Add
        </Button>
      </form>

      <div className="border-t border-[#D9D9D9] pt-6">
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : notes.length === 0 ? (
          <EmptyState
            icon={<FileText size={24} />}
            title="No notes yet. Write one — or let AI draft one for you."
          />
        ) : (
          <div className="space-y-2">
            {notes.map((note) => (
              <NoteItem
                key={note._id}
                note={note}
                onDelete={(id) => deleteMutation.mutate(id)}
              />
            ))}
          </div>
        )}
      </div>
    </Modal>
  )
}
