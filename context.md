# HELLOW - Complete Architecture Context

## Project Overview
Hellow is a calm, matte, minimal all-in-one productivity super app — "One calm place for everything you do."

## Tech Stack
- **Frontend**: React 18 + Vite + Tailwind CSS + React Router v6 + Zustand + TanStack Query + Socket.io-client + Framer Motion + Lucide React + date-fns + react-leaflet + simple-peer
- **Backend**: Node.js + Express.js + Socket.io + MongoDB + Mongoose + JWT + bcrypt + multer + node-cron + googleapis + express-rate-limit
- **Real-time**: Socket.io (chat, sync, signaling), WebRTC (meetings), Geolocation API (SpotSync)

## Project Structure
```
/
├── hellow-frontend/       # React + Vite frontend (port 5173 dev)
│   └── src/
│       ├── components/
│       │   ├── layout/     Navbar, Sidebar, RightPanel, Layout, DriveFAB
│       │   ├── ui/         Button, Modal, Card, Input, Badge, Toast, Spinner, Skeleton, Avatar, Pill, EmptyState
│       │   ├── chat/       ChatSidebar, ChatRoom, MessageBubble, MessageInput, TypingIndicator, CreateRoomForm, RoomItem
│       │   ├── dashboard/  MicroLearningCard, NewsFeed, NewsCard
│       │   └── features/
│       │       ├── notes/      NotesModal, NoteItem
│       │       ├── tasks/      TasksModal, TaskItem
│       │       ├── calendar/   CalendarModal, MonthGrid, DayDetail, EventForm
│       │       ├── bookmarks/  BookmarksModal, BookmarkItem
│       │       ├── contacts/   NewContactModal
│       │       ├── search/     SearchOverlay
│       │       ├── youtube/    YouTubePanel
│       │       └── gmail/      GmailPanel
│       ├── pages/         Auth, Dashboard, Contacts, Meetings, MusicSync, SpotSync, SmartNews, Drive, Profile, OAuthCallback, NotFound
│       ├── store/         useAuthStore, useChatStore, useUIStore, useSocketStore, useSpotStore, useYouTubeStore, useMusicStore
│       ├── hooks/         useSocket, useGeolocation, useNotifications, useDebounce, useKeyPress
│       ├── services/      api.js, socket.js, auth.js, ai.js
│       ├── utils/         formatDate.js, generateCode.js, cn.js, constants.js
│       └── styles/        index.css
├── server/                # Node.js + Express backend (port 3001)
│   ├── index.js           Entry point: Express + Socket.io + MongoDB
│   ├── routes/            auth, rooms, messages, notes, tasks, events, bookmarks, contacts, drive, meetings, music, profile, news, micro-learning, spotsync, activityLog, ai, seed
│   ├── controllers/       (per route)
│   ├── models/            User, Room, Message, Note, Task, Event, Bookmark, Contact, CallLog, Meeting, MusicRoom, DriveFile, DriveFolder, SavedArticle, MicroLearning, SpotPin, SpotMessage, ActivityLog
│   ├── middleware/        auth (JWT), upload (multer), rateLimit (express-rate-limit), errorHandler
│   ├── sockets/           chat, meetings, music, youtube, spotsync
│   └── services/          newsService, aiService, gmailService, storageService, reminderService (node-cron)
├── Hellow.pdf             Design/UI screenshots reference
├── Hellow_PRD.docx        Product requirements document
└── Hellow_Technical_System_Blueprint.docx  Technical system blueprint
```

## Setup & Running

### Prerequisites
- Node.js 18+
- MongoDB running locally on port 27017 (or set MONGO_URI)

### Backend
```bash
cd server
npm install
# Create .env:
#   MONGO_URI=mongodb://localhost:27017/hellow
#   JWT_SECRET=hellow_secret_key_2026
#   PORT=3001
node index.js
```

### Frontend
```bash
cd hellow-frontend
npm install
npm run dev      # Dev server at http://localhost:5173
npm run build    # Production build to dist/
```

## Architecture Layers

### Global Layout (z-index stack)
- Base layout: 0 (Navbar, Sidebar, Center, RightPanel)
- Slide-in panels: 40 (YouTube, Gmail, ChatPanel)
- Search overlay: 50
- Modal backdrop: 60
- Modal content: 70
- Confirmation dialog: 80
- Toast notifications: 90

### Routing
| Path | Component | Auth |
|------|-----------|------|
| /login | AuthPage | No |
| /register | RegisterPage | No |
| / | Dashboard | Yes |
| /contacts | ContactsPage | Yes |
| /meetings | MeetingsPage | Yes |
| /music | MusicSyncPage | Yes |
| /spotsync | SpotSyncPage | Yes |
| /news | SmartNewsPage | Yes |
| /drive | DrivePage | Yes |
| /profile | ProfilePage | Yes |
| /oauth-callback | OAuthCallback | No |
| * | NotFoundPage | No |

### State Management
- **Server State**: TanStack Query (React Query) — staleTime 5min default, cacheTime 30min
- **Global UI State**: Zustand stores (auth, chat, UI, socket, spot, youtube, music)
- **Local State**: useState for forms, toggles, hover states

### Real-time Architecture
- Socket.io connects on login, disconnects on logout
- JWT in handshake auth
- Per-user personal room for targeted events
- Chat rooms map to Socket.io rooms
- WebRTC signaling via Socket.io (meeting:join, meeting:answer, meeting:ice)
- Music sync: play/pause/seek/volume events rebroadcast
- YouTube group watch: play/pause/seek/load_video + chat
- SpotSync: location:update broadcast to friends

### API Conventions
- All responses: `{ success: boolean, data: any, error?: string }`
- Auth via JWT Bearer token in Authorization header
- Protected routes use auth middleware
- Rate limiting applied globally via express-rate-limit
- File uploads via multer to `/uploads`

### Design System
- Colors: --bg-primary #F5F5F0, --bg-secondary #EDEDE8, --bg-modal #FAFAF8
- Text: --text-primary #1A1A1A, --text-secondary #4A4A4A, --text-muted #6B6B6B
- Border: #D9D9D9, Accent black: #1A1A1A, Accent green: #22C55E
- Radius: card 12px, pill 999px, modal 16px
- Navbar: 64px, Sidebar: 280px, RightPanel: 48px, DriveFAB: 56px
- Font: Inter, Monospace for codes
- Theme: `data-theme` attribute on `<html>`, persisted to localStorage (`hellow_theme`)

### Key Behaviors
- Only one modal open at a time (except confirm dialog)
- Panels slide in from right (420px width, 300ms transition)
- Modals render via portal to document.body
- Optimistic UI for chat messages (Zustand) and CRUD operations (React Query)
- Loading skeletons for all data-fetching views
- Empty states for all lists
- Error boundaries at route level
- Responsive: 3-column desktop, icon sidebar tablet, bottom nav mobile

### Seed Data
- `POST /api/seed` — creates demo notes, tasks, events, bookmarks, contacts, and a welcome chat room for the authenticated user
- Automatically called on first login after auth
- Skips if user already has data

## All Features (20 modules)
1. **Auth** — email/password + Google OAuth + JWT
2. **Dashboard** — Micro-Learning card + News Feed ticker
3. **Chat Rooms** — real-time messaging, Saved/Hooked/Trash status
4. **DuckDuckGo Search Overlay** — iframe-based search from sidebar
5. **Notes** — CRUD + AI generation (via AI panel)
6. **Tasks & Reminders** — with notifications via node-cron
7. **Calendar** — month grid view + day detail + event CRUD
8. **Bookmarks** — URL saving with tags
9. **Contacts** — CRUD + call logs + favorites + delete
10. **Meetings** — WebRTC peer-to-peer via meeting codes + Socket.io signaling
11. **Group Music Sync** — real-time synchronized playback with room codes
12. **SpotSync** — location sharing on Leaflet map + friend chat + pins
13. **Smart News** — category browsing + AI summarization + save
14. **YouTube Panel** — group watch with synchronized playback + chat
15. **Gmail Integration** — read-only email via OAuth + Gmail API
16. **Drive** — file upload/download + folder organization + storage tracking
17. **Profile** — settings, stats, activity log, password change, theme toggle
18. **Micro-Learning** — daily book/idea suggestions
19. **Activity Log** — tracked across all modules
20. **Notifications** — toast system + browser push notifications

## Build Output (frontend)
- `hellow-frontend/dist/` — production build output
- `index.html` — 0.71 kB (gzip 0.39 kB)
- `assets/index-*.css` — 52.25 kB (gzip 14.01 kB)
- `assets/index-*.js` — 591.52 kB (gzip 174.76 kB)
- 2256 modules transformed, build time ~590ms

## Backend Notes
- Mongoose v9 duplicate index warnings for `User.email`, `Meeting.code`, `MusicRoom.code` — non-critical
- All model filenames must use PascalCase (e.g. `User.js`, `Note.js`) matching require paths
- Case-insensitive on Windows, but `require()` cache is case-sensitive — mixed casing causes OverwriteModelError
