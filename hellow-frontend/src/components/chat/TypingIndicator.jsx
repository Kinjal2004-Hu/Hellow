export function TypingIndicator({ users }) {
  if (!users?.length) return null
  const text = users.length === 1
    ? `${users[0]} is typing...`
    : `${users.length} people are typing...`
  return (
    <div className="flex items-center gap-1.5 px-1 py-1">
      <div className="flex gap-0.5">
        <span className="w-1.5 h-1.5 bg-[--text-muted] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-1.5 h-1.5 bg-[--text-muted] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-1.5 h-1.5 bg-[--text-muted] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
      <span className="text-xs text-[--text-muted] italic">{text}</span>
    </div>
  )
}
