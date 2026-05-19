import { useState } from 'react'
import { useChatStore } from '../../store/useChatStore'
import { useUIStore } from '../../store/useUIStore'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../services/api'
import { QUERY_KEYS } from '../../utils/constants'
import { MessageSquare, Bookmark, Anchor, Trash2, Plus, X, Check } from 'lucide-react'
import { cn } from '../../utils/cn'

export function Sidebar() {
  const [showCreate, setShowCreate] = useState(false)
  const [roomName, setRoomName] = useState('')
  const [roomCategory, setRoomCategory] = useState('saved')

  const activeRoomId = useChatStore((s) => s.activeRoomId)
  const setActiveRoom = useChatStore((s) => s.setActiveRoom)
  const setChatPanelOpen = useUIStore((s) => s.setChatPanelOpen)
  const queryClient = useQueryClient()

  const { data: roomsData } = useQuery({
    queryKey: QUERY_KEYS.rooms,
    queryFn: () => api.get('/rooms'),
  })

  const createMutation = useMutation({
    mutationFn: (data) => api.post('/rooms', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.rooms })
      setShowCreate(false)
      setRoomName('')
    },
  })

  const rooms = roomsData?.data || []
  const savedRooms = rooms.filter(r => r.category === 'saved')
  const hookedRooms = rooms.filter(r => r.category === 'hooked')
  const trashRooms = rooms.filter(r => r.category === 'trash')

  const handleCreate = () => {
    if (roomName.trim()) {
      createMutation.mutate({ name: roomName.trim(), type: 'channel', category: roomCategory })
    }
  }

  const handleRoomClick = (room) => {
    setActiveRoom(room._id)
    setChatPanelOpen(true)
  }

  const RoomGroup = ({ label, icon: Icon, rooms, category }) => (
    <div className="mb-2">
      <div className="flex items-center gap-2 w-full px-4 py-2 text-xs font-semibold text-[--text-muted] uppercase tracking-wider">
        <Icon size={14} />
        {label}
        <span className="ml-auto text-[10px] bg-[--bg-secondary] px-1.5 py-0.5 rounded-full">{rooms.length}</span>
      </div>
      <div>
        {rooms.length === 0 ? (
          <p className="px-6 py-2 text-xs text-[--text-muted]">No rooms</p>
        ) : (
          rooms.map((room) => (
            <button
              key={room._id}
              onClick={() => handleRoomClick(room)}
              className={cn(
                'flex items-center gap-2 w-full px-6 py-2 text-sm transition-colors cursor-pointer',
                activeRoomId === room._id
                  ? 'bg-[#1A1A1A] text-white mx-2 rounded-lg px-4'
                  : 'text-[--text-secondary] hover:bg-[--bg-secondary] rounded-lg'
              )}
            >
              {room.type === 'dm' ? (
                <MessageSquare size={14} className="text-[--text-muted]" />
              ) : (
                <span className="text-xs font-bold text-[--text-muted]">#</span>
              )}
              <span className="truncate">{room.name}</span>
            </button>
          ))
        )}
      </div>
    </div>
  )

  return (
    <aside className="fixed left-0 top-16 w-[280px] h-[calc(100vh-64px)] bg-[--bg-primary] border-r border-[--border] overflow-y-auto">
      <div className="pt-6 pb-4">
        <div className="flex items-center justify-between px-4 mb-4">
          <h2 className="text-xs font-semibold text-[--text-muted] uppercase tracking-wider">Chat Rooms</h2>
          <span className="text-[10px] bg-[--bg-secondary] px-1.5 py-0.5 rounded-full text-[--text-muted]">{rooms.length}</span>
        </div>

        {!showCreate ? (
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 w-[calc(100%-16px)] mx-2 px-4 py-2.5 bg-[#1A1A1A] text-white text-sm font-medium rounded-full hover:bg-[#333] transition-colors cursor-pointer mb-4"
          >
            <Plus size={16} />
            Create New Room
          </button>
        ) : (
          <div className="mx-4 mb-4 p-3 bg-white border border-[--border] rounded-xl">
            <input
              type="text"
              placeholder="Room name"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              className="w-full px-3 py-2 bg-[--bg-secondary] border border-[--border] rounded-lg text-sm text-[--text-primary] placeholder:text-[--text-muted] outline-none focus:border-[--accent-black] mb-2"
              autoFocus
            />
            <div className="flex gap-1.5 mb-3">
              {['saved', 'hooked', 'trash'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setRoomCategory(cat)}
                  className={cn(
                    'px-2.5 py-1 text-xs font-medium rounded-full border transition-colors cursor-pointer',
                    roomCategory === cat
                      ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                      : 'bg-white text-[--text-secondary] border-[--border] hover:bg-[--bg-secondary]'
                  )}
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={handleCreate} className="flex items-center gap-1 px-3 py-1.5 bg-[#1A1A1A] text-white text-xs font-medium rounded-full hover:bg-[#333] transition-colors cursor-pointer">
                <Check size={12} /> Create
              </button>
              <button onClick={() => setShowCreate(false)} className="flex items-center gap-1 px-3 py-1.5 bg-white text-[--text-secondary] text-xs font-medium rounded-full border border-[--border] hover:bg-[--bg-secondary] transition-colors cursor-pointer">
                <X size={12} /> Cancel
              </button>
            </div>
          </div>
        )}

        <RoomGroup label="SAVED" icon={Bookmark} rooms={savedRooms} category="saved" />
        <RoomGroup label="HOOKED" icon={Anchor} rooms={hookedRooms} category="hooked" />
        <RoomGroup label="TRASH" icon={Trash2} rooms={trashRooms} category="trash" />
      </div>
    </aside>
  )
}
