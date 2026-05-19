import { useEffect, useRef, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useChatStore } from '../../store/useChatStore'
import { useUIStore } from '../../store/useUIStore'
import { useSocketStore } from '../../store/useSocketStore'
import { api } from '../../services/api'
import { QUERY_KEYS } from '../../utils/constants'
import { MessageBubble } from './MessageBubble'
import { MessageInput } from './MessageInput'
import { TypingIndicator } from './TypingIndicator'
import { X, MessageSquare } from 'lucide-react'
import { formatRelative } from '../../utils/formatDate'

export function ChatRoom() {
  const activeRoomId = useChatStore((s) => s.activeRoomId)
  const setActiveRoom = useChatStore((s) => s.setActiveRoom)
  const setChatPanelOpen = useUIStore((s) => s.setChatPanelOpen)
  const messages = useChatStore((s) => s.messages)
  const typingUsers = useChatStore((s) => s.typingUsers)
  const rooms = useChatStore((s) => s.rooms)
  const socketStore = useSocketStore()
  const messagesEndRef = useRef(null)

  const activeRoom = rooms.find(r => r._id === activeRoomId)

  const { data: messagesData, isLoading } = useQuery({
    queryKey: QUERY_KEYS.messages(activeRoomId),
    queryFn: () => api.get(`/messages/${activeRoomId}`),
    enabled: !!activeRoomId,
  })

  const roomMessages = messages[activeRoomId] || messagesData?.data || []
  const typingInRoom = typingUsers[activeRoomId] || []

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [roomMessages.length, scrollToBottom])

  const handleClose = () => {
    setActiveRoom(null)
    setChatPanelOpen(false)
  }

  if (!activeRoomId) return null

  return (
    <div className="fixed right-0 top-16 w-[420px] h-[calc(100vh-64px)] bg-white border-l border-[--border] z-40 animate-[slideInRight_300ms_ease] flex flex-col">
      <div className="flex items-center justify-between px-6 py-4 border-b border-[--border]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[--bg-secondary] rounded-lg flex items-center justify-center">
            <MessageSquare size={16} className="text-[--text-secondary]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[--text-primary]">{activeRoom?.name || 'Chat Room'}</p>
            <p className="text-[10px] text-[--text-muted] uppercase">{activeRoom?.category || 'saved'}</p>
          </div>
        </div>
        <button onClick={handleClose} className="p-1.5 text-[--text-muted] hover:text-[--text-primary] rounded-lg hover:bg-[--bg-secondary] transition-colors cursor-pointer">
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => (
              <div key={i} className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-[--bg-secondary] animate-pulse" />
                <div className="flex-1">
                  <div className="h-4 bg-[--bg-secondary] rounded w-24 mb-2 animate-pulse" />
                  <div className="h-8 bg-[--bg-secondary] rounded-lg w-48 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : roomMessages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-sm text-[--text-muted]">No messages yet. Say hi!</p>
          </div>
        ) : (
          roomMessages.map((msg, idx) => (
            <MessageBubble key={msg._id || idx} message={msg} />
          ))
        )}
        {typingInRoom.length > 0 && <TypingIndicator users={typingInRoom} />}
        <div ref={messagesEndRef} />
      </div>

      <MessageInput roomId={activeRoomId} />
    </div>
  )
}
