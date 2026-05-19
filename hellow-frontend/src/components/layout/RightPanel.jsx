import { useNavigate, useLocation } from 'react-router-dom'
import { useUIStore } from '../../store/useUIStore'
import { Users, MapPin, Video, FileText, Music, Play, Mail, HardDrive, UserCircle } from 'lucide-react'
import { cn } from '../../utils/cn'

const items = [
  { icon: Users, label: 'Contacts', action: 'navigate', path: '/contacts' },
  { icon: MapPin, label: 'SpotSync', action: 'navigate', path: '/spotsync' },
  { icon: Video, label: 'Meetings', action: 'navigate', path: '/meetings' },
  { icon: FileText, label: 'Notes', action: 'modal', modal: 'notes' },
  { icon: Music, label: 'Music', action: 'navigate', path: '/music' },
  { icon: Play, label: 'YouTube', action: 'panel', panel: 'youtube' },
  { icon: Mail, label: 'Gmail', action: 'panel', panel: 'gmail' },
  { icon: HardDrive, label: 'Drive', action: 'navigate', path: '/drive' },
  { icon: UserCircle, label: 'Profile', action: 'navigate', path: '/profile' },
]

export function RightPanel() {
  const navigate = useNavigate()
  const location = useLocation()
  const openModal = useUIStore((s) => s.openModal)
  const openPanel = useUIStore((s) => s.openPanel)

  const handleClick = (item) => {
    if (item.action === 'navigate') navigate(item.path)
    else if (item.action === 'modal') openModal(item.modal)
    else if (item.action === 'panel') openPanel(item.panel)
  }

  return (
    <div className="fixed right-0 top-16 w-[48px] h-[calc(100vh-64px)] bg-[--bg-primary] border-l border-[--border] flex flex-col items-center py-3 gap-1 z-10">
      {items.map((item) => {
        const Icon = item.icon
        const isActive = item.path && location.pathname === item.path
        return (
          <button
            key={item.label}
            onClick={() => handleClick(item)}
            title={item.label}
            className={cn(
              'w-9 h-9 flex items-center justify-center rounded-lg text-[--text-muted] hover:text-[--text-primary] hover:bg-[--bg-secondary] transition-all cursor-pointer relative group',
              isActive && 'text-[--text-primary] bg-[--bg-secondary]'
            )}
          >
            <Icon size={18} />
            <span className="absolute left-12 top-1/2 -translate-y-1/2 bg-[#1A1A1A] text-white text-[10px] px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
              {item.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
