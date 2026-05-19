import { cn } from '../../utils/cn'
import { formatTime } from '../../utils/formatDate'
import { useAuthStore } from '../../store/useAuthStore'
import { Loader2 } from 'lucide-react'

export function MessageBubble({ message }) {
  const user = useAuthStore((s) => s.user)
  const isOwn = message.senderId === user?._id || message.senderId === 'me'
  const isPending = message.pending

  return (
    <div className={cn('flex gap-2', isOwn && 'flex-row-reverse')}>
      {!isOwn && (
        <div className="w-7 h-7 bg-[#1A1A1A] rounded-lg flex items-center justify-center text-white text-[10px] font-semibold flex-shrink-0">
          {(message.senderName || '?')[0].toUpperCase()}
        </div>
      )}
      <div className={cn('max-w-[75%]', isPending && 'opacity-50')}>
        {!isOwn && (
          <p className="text-[11px] text-[--text-muted] mb-0.5 px-1">{message.senderName || 'User'}</p>
        )}
        <div className={cn(
          'px-3.5 py-2 rounded-xl text-sm',
          isOwn ? 'bg-[#1A1A1A] text-white' : 'bg-[--bg-secondary] text-[--text-primary]'
        )}>
          <p>{message.content}</p>
        </div>
        <div className={cn('flex items-center gap-1 mt-0.5 px-1', isOwn && 'justify-end')}>
          <p className="text-[10px] text-[--text-muted]">{message.timestamp ? formatTime(message.timestamp) : ''}</p>
          {isPending && <Loader2 size={10} className="animate-spin text-[--text-muted]" />}
        </div>
      </div>
    </div>
  )
}
