import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns'

export function formatDate(date) {
  const d = new Date(date)
  if (isToday(d)) return `Today at ${format(d, 'h:mm a')}`
  if (isYesterday(d)) return `Yesterday at ${format(d, 'h:mm a')}`
  return format(d, 'MMM d, yyyy · h:mm a')
}

export function formatShortDate(date) {
  return format(new Date(date), 'M/d/yyyy')
}

export function formatTime(date) {
  return format(new Date(date), 'h:mm a')
}

export function formatMonthYear(date) {
  return format(new Date(date), 'MMMM yyyy')
}

export function formatDayOfWeek(date) {
  return format(new Date(date), 'EEEE')
}

export function formatRelative(date) {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}
