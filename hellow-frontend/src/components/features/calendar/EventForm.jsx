import { useState } from 'react'
import { Button } from '../../ui/Button'
import { Input } from '../../ui/Input'

const COLORS = ['#1A1A1A', '#22C55E', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']

export function EventForm({ initialDate, onSave, onCancel }) {
  const [title, setTitle] = useState('')
  const [date, setDate] = useState(() => {
    if (initialDate) return initialDate
    return new Date().toISOString().split('T')[0]
  })
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('10:00')
  const [description, setDescription] = useState('')
  const [color, setColor] = useState('#1A1A1A')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!title.trim()) return

    const startAt = new Date(`${date}T${startTime}:00`).toISOString()
    const endAt = new Date(`${date}T${endTime}:00`).toISOString()

    onSave({
      title: title.trim(),
      startAt,
      endAt,
      description: description.trim(),
      color,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        placeholder="Event title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />

      <div className="flex gap-2">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="flex-1 px-4 py-2.5 bg-white border border-[#D9D9D9] rounded-full text-sm text-[--text-primary] outline-none focus:border-[--text-primary] transition-colors"
        />
        <input
          type="time"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          className="px-4 py-2.5 bg-white border border-[#D9D9D9] rounded-full text-sm text-[--text-primary] outline-none focus:border-[--text-primary] transition-colors"
        />
        <span className="flex items-center text-xs text-[--text-muted]">to</span>
        <input
          type="time"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          className="px-4 py-2.5 bg-white border border-[#D9D9D9] rounded-full text-sm text-[--text-primary] outline-none focus:border-[--text-primary] transition-colors"
        />
      </div>

      <textarea
        placeholder="Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={2}
        className="w-full px-4 py-2.5 bg-white border border-[#D9D9D9] rounded-xl text-sm text-[--text-primary] placeholder:text-[--text-muted] outline-none focus:border-[--text-primary] transition-colors resize-none"
      />

      <div>
        <p className="text-xs text-[--text-muted] mb-2">Color</p>
        <div className="flex gap-2">
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={`w-6 h-6 rounded-full border-2 transition-all cursor-pointer ${
                color === c ? 'border-[--text-primary] scale-110' : 'border-transparent'
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <Button type="submit" variant="primary" size="sm" disabled={!title.trim()}>
          Add Event
        </Button>
        {onCancel && (
          <Button type="button" variant="secondary" size="sm" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  )
}
