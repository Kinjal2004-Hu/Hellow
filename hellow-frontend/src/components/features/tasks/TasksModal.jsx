import { useState } from 'react'
import { CheckSquare, ListChecks } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Modal } from '../../ui/Modal'
import { Button } from '../../ui/Button'
import { Input } from '../../ui/Input'
import { Pill } from '../../ui/Pill'
import { Skeleton } from '../../ui/Skeleton'
import { EmptyState } from '../../ui/EmptyState'
import { useUIStore } from '../../../store/useUIStore'
import { api } from '../../../services/api'
import { QUERY_KEYS } from '../../../utils/constants'
import { TaskItem } from './TaskItem'

const FILTERS = ['All', 'Open', 'Done', 'Reminders']

export function TasksModal() {
  const open = useUIStore((s) => s.modals.tasks)
  const close = () => useUIStore.getState().closeModal('tasks')
  const showToast = useUIStore((s) => s.showToast)
  const queryClient = useQueryClient()

  const [filter, setFilter] = useState('All')
  const [content, setContent] = useState('')
  const [dueAt, setDueAt] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: QUERY_KEYS.tasks,
    queryFn: () => api.get('/tasks'),
    enabled: open,
  })

  const createMutation = useMutation({
    mutationFn: (body) => api.post('/tasks', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tasks })
      setContent('')
      setDueAt('')
      showToast('Task added', 'success')
    },
    onError: (err) => showToast(err.message, 'error'),
  })

  const toggleMutation = useMutation({
    mutationFn: ({ id, done }) => api.patch(`/tasks/${id}`, { done }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tasks })
    },
    onError: (err) => showToast(err.message, 'error'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/tasks/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tasks })
      showToast('Task deleted', 'success')
    },
    onError: (err) => showToast(err.message, 'error'),
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!content.trim()) return
    createMutation.mutate({
      content: content.trim(),
      dueAt: dueAt ? new Date(dueAt).toISOString() : null,
    })
  }

  let tasks = data?.data || []

  if (filter === 'Open') tasks = tasks.filter((t) => !t.done)
  else if (filter === 'Done') tasks = tasks.filter((t) => t.done)
  else if (filter === 'Reminders') tasks = tasks.filter((t) => t.dueAt)

  return (
    <Modal open={open} onClose={close} title={<span className="flex items-center gap-2"><CheckSquare size={20} />Tasks</span>}>
      <p className="text-xs text-[--text-muted] mb-6">
        One place for to-dos and reminders. Add a date+time to turn a task into a timed reminder.
      </p>

      <form onSubmit={handleSubmit} className="flex items-center gap-2 mb-6">
        <Input
          placeholder="What needs doing?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="flex-1"
          required
        />
        <input
          type="datetime-local"
          value={dueAt}
          onChange={(e) => setDueAt(e.target.value)}
          className="px-3 py-2.5 bg-white border border-[#D9D9D9] rounded-full text-sm text-[--text-primary] outline-none focus:border-[--text-primary] transition-colors"
        />
        <Button type="submit" variant="primary" size="sm" disabled={!content.trim()}>
          + Add
        </Button>
      </form>

      <div className="flex items-center gap-2 mb-4">
        {FILTERS.map((f) => (
          <Pill key={f} active={filter === f} onClick={() => setFilter(f)}>
            {f}
          </Pill>
        ))}
        <span className="ml-auto text-xs text-[--text-muted]">
          {tasks.length} {tasks.length === 1 ? 'item' : 'items'}
        </span>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : tasks.length === 0 ? (
        <EmptyState
          icon={<ListChecks size={24} />}
          title="Nothing here. Add your first task above."
        />
      ) : (
        <div>
          {tasks.map((task) => (
            <TaskItem
              key={task._id}
              task={task}
              onToggle={(id, done) => toggleMutation.mutate({ id, done })}
              onDelete={(id) => deleteMutation.mutate(id)}
            />
          ))}
        </div>
      )}
    </Modal>
  )
}
