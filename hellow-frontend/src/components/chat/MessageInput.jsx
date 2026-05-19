import { useState, useRef, useCallback } from 'react'
import { useChatStore } from '../../store/useChatStore'
import { useSocketStore } from '../../store/useSocketStore'
import { useAuthStore } from '../../store/useAuthStore'
import { Send } from 'lucide-react'

export function MessageInput({ roomId }) {
  const [content, setContent] = useState('')
  const typingTimer = useRef(null)
  const isTyping = useRef(false)
  const optimisticSend = useChatStore((s) => s.optimisticSend)
  const emit = useSocketStore((s) => s.emit)
  const user = useAuthStore((s) => s.user)

  const emitTyping = useCallback((start) => {
    if (roomId) {
      emit(start ? 'typing:start' : 'typing:stop', { roomId, userId: user?._id || 'me' })
    }
  }, [roomId, emit, user])

  const handleChange = (e) => {
    setContent(e.target.value)
    if (!isTyping.current) {
      isTyping.current = true
      emitTyping(true)
    }
    clearTimeout(typingTimer.current)
    typingTimer.current = setTimeout(() => {
      isTyping.current = false
      emitTyping(false)
    }, 1000)
  }

  const handleSend = () => {
    if (!content.trim() || !roomId) return
    const tempId = optimisticSend(roomId, content.trim())
    emit('message:send', {
      roomId,
      content: content.trim(),
      senderId: user?._id || 'me',
      senderName: user?.username || 'User',
      tempId,
    })
    setContent('')
    if (isTyping.current) {
      isTyping.current = false
      emitTyping(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex items-center gap-2 px-6 py-4 border-t border-[--border] bg-white">
      <input
        type="text"
        placeholder="Type a message..."
        value={content}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        className="flex-1 px-4 py-2.5 bg-[--bg-secondary] border border-[--border] rounded-full text-sm text-[--text-primary] placeholder:text-[--text-muted] outline-none focus:border-[#1A1A1A] transition-colors"
      />
      <button
        onClick={handleSend}
        disabled={!content.trim()}
        className="w-9 h-9 bg-[#1A1A1A] text-white rounded-full flex items-center justify-center hover:bg-[#333] disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
      >
        <Send size={14} />
      </button>
    </div>
  )
}
