import { ChevronLeft, ChevronRight } from 'lucide-react'
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
} from 'date-fns'
import { Button } from '../../ui/Button'
import { cn } from '../../../utils/cn'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function MonthGrid({ currentMonth, onMonthChange, selectedDate, onDateSelect, events }) {
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(monthStart)
  const calStart = startOfWeek(monthStart)
  const calEnd = endOfWeek(monthEnd)

  const rows = []
  let days = []
  let day = calStart

  while (day <= calEnd) {
    for (let i = 0; i < 7; i++) {
      days.push(day)
      day = addDays(day, 1)
    }
    rows.push(days)
    days = []
  }

  const getEventsCount = (d) =>
    events.filter((e) => {
      const ed = new Date(e.startAt)
      return (
        ed.getFullYear() === d.getFullYear() &&
        ed.getMonth() === d.getMonth() &&
        ed.getDate() === d.getDate()
      )
    }).length

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => onMonthChange(subMonths(currentMonth, 1))}
          className="text-[--text-muted] hover:text-[--text-primary] transition-colors cursor-pointer"
        >
          <ChevronLeft size={18} />
        </button>
        <h3 className="text-sm font-semibold text-[--text-primary]">
          {format(currentMonth, 'MMMM yyyy')}
        </h3>
        <button
          onClick={() => onMonthChange(addMonths(currentMonth, 1))}
          className="text-[--text-muted] hover:text-[--text-primary] transition-colors cursor-pointer"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="flex justify-center mb-3">
        <Button variant="ghost" size="sm" onClick={() => onMonthChange(new Date())}>
          TODAY
        </Button>
      </div>

      <div className="grid grid-cols-7 mb-1">
        {DAYS.map((d) => (
          <div key={d} className="text-center text-[11px] text-[--text-muted] font-medium py-1">
            {d}
          </div>
        ))}
      </div>

      {rows.map((week, i) => (
        <div key={i} className="grid grid-cols-7">
          {week.map((d) => {
            const count = getEventsCount(d)
            const selected = selectedDate && isSameDay(d, selectedDate)
            const today = isToday(d)
            return (
              <button
                key={d.toISOString()}
                onClick={() => onDateSelect(d)}
                className={cn(
                  'relative py-2 text-sm rounded-lg transition-colors cursor-pointer flex flex-col items-center',
                  !isSameMonth(d, currentMonth) && 'text-[#D9D9D9]',
                  isSameMonth(d, currentMonth) && 'text-[--text-primary]',
                  selected && 'bg-[--text-primary] text-white',
                  today && !selected && 'bg-[#FFF8E7]'
                )}
              >
                <span>{format(d, 'd')}</span>
                {count > 0 && !selected && (
                  <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-[--text-primary]" />
                )}
              </button>
            )
          })}
        </div>
      ))}
    </div>
  )
}
