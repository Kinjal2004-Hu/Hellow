import { Calendar, Plus } from 'lucide-react'
import { format } from 'date-fns'
import { Button } from '../../ui/Button'
import { EmptyState } from '../../ui/EmptyState'

export function DayDetail({ date, events, onAddEvent }) {
  if (!date) {
    return (
      <div className="p-4">
        <EmptyState
          icon={<Calendar size={20} />}
          title="Select a day to view events"
        />
      </div>
    )
  }

  const dayEvents = events.filter((e) => {
    const eventDate = new Date(e.startAt)
    return (
      eventDate.getFullYear() === date.getFullYear() &&
      eventDate.getMonth() === date.getMonth() &&
      eventDate.getDate() === date.getDate()
    )
  })

  return (
    <div className="p-4">
      <div className="mb-4">
        <p className="text-[11px] text-[--text-muted] uppercase tracking-wide">
          {format(date, 'EEEE').toUpperCase()}
        </p>
        <p className="text-lg font-semibold text-[--text-primary]">
          {format(date, 'MMMM d')}
        </p>
      </div>

      {dayEvents.length === 0 ? (
        <EmptyState
          icon={<Calendar size={20} />}
          title="Nothing on this day."
        />
      ) : (
        <div className="space-y-2 mb-4">
          {dayEvents.map((event) => (
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
                  {format(new Date(event.startAt), 'h:mm a')} &mdash;{' '}
                  {format(new Date(event.endAt), 'h:mm a')}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <Button
        variant="secondary"
        size="sm"
        className="gap-1.5"
        onClick={() => onAddEvent(date)}
      >
        <Plus size={14} />
        Add on this day
      </Button>
    </div>
  )
}
