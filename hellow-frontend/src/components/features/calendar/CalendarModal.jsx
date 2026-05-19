import { useState } from 'react'
import { CalendarDays, ArrowUp, Plus } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import { Modal } from '../../ui/Modal'
import { Pill } from '../../ui/Pill'
import { Skeleton } from '../../ui/Skeleton'
import { EmptyState } from '../../ui/EmptyState'
import { useUIStore } from '../../../store/useUIStore'
import { api } from '../../../services/api'
import { QUERY_KEYS } from '../../../utils/constants'
import { MonthGrid } from './MonthGrid'
import { DayDetail } from './DayDetail'
import { EventForm } from './EventForm'

const TABS = [
  { key: 'calendar', label: 'Calendar', icon: <CalendarDays size={14} /> },
  { key: 'upcoming', label: 'Upcoming', icon: <ArrowUp size={14} /> },
  { key: 'add', label: 'Add', icon: <Plus size={14} /> },
]

export function CalendarModal() {
  const open = useUIStore((s) => s.modals.calendar)
  const close = () => useUIStore.getState().closeModal('calendar')
  const showToast = useUIStore((s) => s.showToast)
  const queryClient = useQueryClient()

  const [tab, setTab] = useState('calendar')
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [addFromDay, setAddFromDay] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: QUERY_KEYS.events(currentMonth.getMonth() + 1, currentMonth.getFullYear()),
    queryFn: () =>
      api.get(`/events?month=${currentMonth.getMonth() + 1}&year=${currentMonth.getFullYear()}`),
    enabled: open,
  })

  const createMutation = useMutation({
    mutationFn: (body) => api.post('/events', body),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.events(currentMonth.getMonth() + 1, currentMonth.getFullYear()),
      })
      setTab('calendar')
      setAddFromDay(null)
      showToast('Event created', 'success')
    },
    onError: (err) => showToast(err.message, 'error'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/events/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.events(currentMonth.getMonth() + 1, currentMonth.getFullYear()),
      })
      showToast('Event deleted', 'success')
    },
    onError: (err) => showToast(err.message, 'error'),
  })

  const events = data?.data || []

  const upcomingEvents = events
    .filter((e) => new Date(e.startAt) >= new Date())
    .slice(0, 20)

  return (
    <Modal open={open} onClose={close} title="Calendar" className="max-w-[800px]">
      <div className="flex gap-2 mb-6">
        {TABS.map((t) => (
          <Pill
            key={t.key}
            active={tab === t.key}
            onClick={() => {
              setTab(t.key)
              setAddFromDay(null)
            }}
            className="flex items-center gap-1.5"
          >
            {t.icon}
            {t.label}
          </Pill>
        ))}
      </div>

      {tab === 'calendar' && (
        <div className="flex gap-6">
          <div className="flex-1">
            <MonthGrid
              currentMonth={currentMonth}
              onMonthChange={setCurrentMonth}
              selectedDate={selectedDate}
              onDateSelect={(d) => {
                setSelectedDate(d)
                setAddFromDay(null)
              }}
              events={events}
            />
          </div>
          <div className="w-[260px] flex-shrink-0 border-l border-[#D9D9D9] -mr-8 pr-8">
            <DayDetail
              date={selectedDate}
              events={events}
              onAddEvent={(d) => {
                setAddFromDay(d)
                setTab('add')
              }}
            />
          </div>
        </div>
      )}

      {tab === 'upcoming' && (
        <div>
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : upcomingEvents.length === 0 ? (
            <EmptyState
              icon={<CalendarDays size={24} />}
              title="No upcoming events."
            />
          ) : (
            <div className="space-y-2">
              {upcomingEvents.map((event) => (
                <div
                  key={event._id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-[--bg-secondary]"
                >
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: event.color || '#1A1A1A' }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[--text-primary] truncate">
                      {event.title}
                    </p>
                    <p className="text-[11px] text-[--text-muted]">
                      {format(new Date(event.startAt), 'MMM d · h:mm a')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'add' && (
        <EventForm
          initialDate={addFromDay ? format(addFromDay, 'yyyy-MM-dd') : undefined}
          onSave={(eventData) => createMutation.mutate(eventData)}
          onCancel={() => {
            setTab('calendar')
            setAddFromDay(null)
          }}
        />
      )}
    </Modal>
  )
}
