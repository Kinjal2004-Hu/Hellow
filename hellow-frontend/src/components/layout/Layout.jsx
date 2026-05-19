import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'
import { Sidebar } from './Sidebar'
import { RightPanel } from './RightPanel'
import { DriveFAB } from './DriveFAB'
import { YouTubePanel } from '../features/youtube/YouTubePanel'
import { GmailPanel } from '../features/gmail/GmailPanel'
import { NotesModal } from '../features/notes/NotesModal'
import { TasksModal } from '../features/tasks/TasksModal'
import { CalendarModal } from '../features/calendar/CalendarModal'
import { BookmarksModal } from '../features/bookmarks/BookmarksModal'
import { NewContactModal } from '../features/contacts/NewContactModal'
import { SearchOverlay } from '../features/search/SearchOverlay'
import { ChatRoom } from '../chat/ChatRoom'
import { useUIStore } from '../../store/useUIStore'
import { useChatStore } from '../../store/useChatStore'

export function Layout() {
  const modals = useUIStore((s) => s.modals)
  const panels = useUIStore((s) => s.panels)
  const activeRoomId = useChatStore((s) => s.activeRoomId)
  const chatPanelOpen = useUIStore((s) => s.chatPanelOpen)

  return (
    <div className="min-h-screen bg-[--bg-primary]">
      <Navbar />
      <div className="flex pt-16">
        <Sidebar />
        <main className="flex-1 ml-[280px] mr-[48px] min-h-[calc(100vh-64px)]">
          <Outlet />
        </main>
        <RightPanel />
      </div>
      <DriveFAB />

      {panels.youtube && <YouTubePanel />}
      {panels.gmail && <GmailPanel />}
      {chatPanelOpen && activeRoomId && <ChatRoom />}

      {modals.notes && <NotesModal />}
      {modals.tasks && <TasksModal />}
      {modals.calendar && <CalendarModal />}
      {modals.bookmarks && <BookmarksModal />}
      {modals.newContact && <NewContactModal />}
      {modals.search && <SearchOverlay />}
    </div>
  )
}
