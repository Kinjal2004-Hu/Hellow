import { useState } from 'react'
import { useUIStore } from '../../../store/useUIStore'
import { useYouTubeStore } from '../../../store/useYouTubeStore'
import { useSocketStore } from '../../../store/useSocketStore'
import { useAuthStore } from '../../../store/useAuthStore'
import { X, Play, Users, Send } from 'lucide-react'
import { cn } from '../../../utils/cn'

const curatedVideos = [
  { id: 'dQw4w9WgXcQ', title: 'Rick Astley - Never Gonna Give You Up', channel: 'Rick Astley' },
  { id: 'jNQXAC9IVRw', title: 'Me at the zoo', channel: 'jawed' },
  { id: 'kXYiU_JCYtU', title: 'Nyan Cat [original]', channel: 'saraj00n' },
  { id: '9bZkp7q19f0', title: 'PSY - GANGNAM STYLE', channel: 'officialpsy' },
  { id: 'OPf0YbXqDm0', title: 'Uptown Funk', channel: 'Mark Ronson' },
]

export function YouTubePanel() {
  const [videoUrl, setVideoUrl] = useState('')
  const [currentVideo, setCurrentVideo] = useState(null)
  const [chatMsg, setChatMsg] = useState('')

  const closePanel = useUIStore((s) => s.closePanel)
  const groupWatchMode = useYouTubeStore((s) => s.groupWatchMode)
  const setGroupWatchMode = useYouTubeStore((s) => s.setGroupWatchMode)
  const participants = useYouTubeStore((s) => s.participants)
  const chatMessages = useYouTubeStore((s) => s.chatMessages)
  const addChatMessage = useYouTubeStore((s) => s.addChatMessage)
  const emit = useSocketStore((s) => s.emit)
  const user = useAuthStore((s) => s.user)

  const loadVideo = (videoId) => {
    setCurrentVideo(videoId)
    if (groupWatchMode) {
      emit('yt:load_video', { videoId })
    }
  }

  const handleLoadUrl = () => {
    const match = videoUrl.match(/(?:v=|youtu\.be\/)([\w-]+)/)
    if (match) loadVideo(match[1])
    else if (videoUrl.trim()) loadVideo(videoUrl.trim())
  }

  const handleSendChat = () => {
    if (!chatMsg.trim() || !groupWatchMode) return
    const msg = { senderId: user?._id || 'me', senderName: user?.username || 'User', content: chatMsg.trim(), timestamp: new Date().toISOString() }
    addChatMessage(msg)
    emit('yt:chat_message', msg)
    setChatMsg('')
  }

  return (
    <div className="fixed right-0 top-16 w-[420px] h-[calc(100vh-64px)] bg-white border-l border-[--border] z-40 animate-[slideInRight_300ms_ease] flex flex-col shadow-xl">
      <div className="flex items-center justify-between px-5 py-4 border-b border-[--border]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-red-600 rounded-lg flex items-center justify-center">
            <Play size={14} className="text-white ml-0.5" />
          </div>
          <span className="text-sm font-semibold text-[--text-primary]">YouTube</span>
        </div>
        <div className="flex items-center gap-3">
          {groupWatchMode && (
            <div className="flex items-center gap-1 text-[11px] text-[--text-muted]">
              <Users size={12} /> {participants}
            </div>
          )}
          <button onClick={() => closePanel('youtube')} className="p-1 text-[--text-muted] hover:text-[--text-primary] cursor-pointer">
            <X size={18} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          {currentVideo ? (
            <div className="aspect-video bg-black rounded-xl overflow-hidden mb-3 flex items-center justify-center text-white text-xs">
              <div className="text-center">
                <Play size={32} className="mx-auto mb-2 opacity-50" />
                <p>YouTube Player: {currentVideo}</p>
              </div>
            </div>
          ) : (
            <div className="aspect-video bg-[--bg-secondary] rounded-xl mb-3 flex items-center justify-center text-[--text-muted] text-xs">No video loaded</div>
          )}

          <div className="flex gap-2 mb-3">
            <input
              type="text"
              placeholder="Paste YouTube URL or video ID"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              className="flex-1 px-3 py-2 bg-[--bg-secondary] border border-[--border] rounded-full text-xs text-[--text-primary] placeholder:text-[--text-muted] outline-none focus:border-[#1A1A1A]"
            />
            <button onClick={handleLoadUrl} className="px-3 py-2 bg-[#1A1A1A] text-white text-xs font-medium rounded-full hover:bg-[#333] cursor-pointer">Load</button>
          </div>

          <button
            onClick={() => setGroupWatchMode(!groupWatchMode)}
            className={cn(
              'w-full px-3 py-2 text-xs font-medium rounded-full border transition-colors cursor-pointer mb-4',
              groupWatchMode ? 'bg-[#22C55E] text-white border-[#22C55E]' : 'bg-white text-[--text-secondary] border-[--border]'
            )}
          >
            {groupWatchMode ? `Group watch ON` : 'Group watch OFF'}
          </button>

          {groupWatchMode && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-semibold text-[--text-muted] uppercase tracking-wider">Watch Party Chat</span>
              </div>
              <div className="h-40 bg-[--bg-secondary] rounded-xl p-3 overflow-y-auto mb-2 space-y-2">
                {chatMessages.length === 0 ? (
                  <p className="text-xs text-[--text-muted] text-center pt-12">No messages yet</p>
                ) : (
                  chatMessages.map((msg, idx) => (
                    <div key={idx} className="text-xs">
                      <span className="font-semibold text-[--text-primary]">{msg.senderName}: </span>
                      <span className="text-[--text-secondary]">{msg.content}</span>
                    </div>
                  ))
                )}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={chatMsg}
                  onChange={(e) => setChatMsg(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                  className="flex-1 px-3 py-2 bg-white border border-[--border] rounded-full text-xs text-[--text-primary] placeholder:text-[--text-muted] outline-none"
                />
                <button onClick={handleSendChat} className="w-8 h-8 bg-[#1A1A1A] text-white rounded-full flex items-center justify-center cursor-pointer">
                  <Send size={12} />
                </button>
              </div>
            </div>
          )}

          <div>
            <h4 className="text-[10px] font-semibold text-[--text-muted] uppercase tracking-wider mb-3">Curated</h4>
            <div className="space-y-2">
              {curatedVideos.map((video) => (
                <button
                  key={video.id}
                  onClick={() => loadVideo(video.id)}
                  className={cn(
                    'flex items-center gap-3 w-full p-2 rounded-lg hover:bg-[--bg-secondary] transition-colors text-left cursor-pointer',
                    currentVideo === video.id && 'bg-[--bg-secondary]'
                  )}
                >
                  <div className="w-16 h-10 bg-[--bg-secondary] rounded-lg flex-shrink-0 flex items-center justify-center">
                    <Play size={12} className="text-[--text-muted]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-[--text-primary] truncate">{video.title}</p>
                    <p className="text-[10px] text-[--text-muted]">{video.channel}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
