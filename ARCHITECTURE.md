# HELLOW — Architecture Plan

> Generated from PRD v1.0 (May 2026), Technical System Blueprint v1.0, and Screenshot PDF (primary UI/UX source).

---

## 1. Frontend Folder Structure

```
src/
├── components/
│   ├── layout/
│   │   ├── Navbar.jsx
│   │   ├── Sidebar.jsx
│   │   ├── RightPanel.jsx
│   │   ├── Layout.jsx
│   │   └── DriveFAB.jsx
│   ├── ui/
│   │   ├── Button.jsx
│   │   ├── Modal.jsx
│   │   ├── Card.jsx
│   │   ├── Input.jsx
│   │   ├── Badge.jsx
│   │   ├── Toast.jsx
│   │   ├── Spinner.jsx
│   │   ├── Skeleton.jsx
│   │   ├── Avatar.jsx
│   │   ├── Pill.jsx
│   │   └── EmptyState.jsx
│   ├── chat/
│   │   ├── ChatSidebar.jsx
│   │   ├── ChatRoom.jsx
│   │   ├── MessageBubble.jsx
│   │   ├── MessageInput.jsx
│   │   ├── TypingIndicator.jsx
│   │   ├── CreateRoomForm.jsx
│   │   └── RoomItem.jsx
│   ├── dashboard/
│   │   ├── MicroLearningCard.jsx
│   │   ├── NewsFeed.jsx
│   │   └── NewsCard.jsx
│   └── features/
│       ├── notes/
│       │   ├── NotesModal.jsx
│       │   ├── NoteItem.jsx
│       │   └── NoteEditor.jsx
│       ├── tasks/
│       │   ├── TasksModal.jsx
│       │   └── TaskItem.jsx
│       ├── calendar/
│       │   ├── CalendarModal.jsx
│       │   ├── MonthGrid.jsx
│       │   ├── DayDetail.jsx
│       │   └── EventForm.jsx
│       ├── bookmarks/
│       │   ├── BookmarksModal.jsx
│       │   └── BookmarkItem.jsx
│       ├── contacts/
│       │   ├── ContactsPage.jsx
│       │   ├── ContactList.jsx
│       │   ├── ContactSearch.jsx
│       │   └── NewContactForm.jsx
│       ├── search/
│       │   └── SearchOverlay.jsx
│       ├── meetings/
│       │   ├── MeetingsPage.jsx
│       │   ├── StartMeetingCard.jsx
│       │   ├── JoinMeetingCard.jsx
│       │   ├── RecentMeetingsList.jsx
│       │   └── MeetingRoom.jsx
│       ├── music/
│       │   ├── MusicSyncPage.jsx
│       │   ├── MusicLanding.jsx
│       │   ├── MusicRoom.jsx
│       │   ├── MusicPlayer.jsx
│       │   ├── Queue.jsx
│       │   └── ListenersPanel.jsx
│       ├── spotsync/
│       │   ├── SpotSyncPage.jsx
│       │   ├── FriendsSidebar.jsx
│       │   ├── MapView.jsx
│       │   └── SpotChat.jsx
│       ├── news/
│       │   ├── SmartNewsPage.jsx
│       │   ├── NewsTickerBanner.jsx
│       │   ├── NewsTabs.jsx
│       │   ├── CategorySection.jsx
│       │   └── NewsArticleCard.jsx
│       ├── drive/
│       │   ├── DrivePage.jsx
│       │   ├── DriveSidebar.jsx
│       │   └── FileGrid.jsx
│       ├── profile/
│       │   ├── ProfilePage.jsx
│       │   ├── ProfileHero.jsx
│       │   ├── QuickStats.jsx
│       │   ├── Preferences.jsx
│       │   ├── ConnectedModules.jsx
│       │   └── ActivityLog.jsx
│       ├── youtube/
│       │   ├── YouTubePanel.jsx
│       │   └── YouTubePlayer.jsx
│       └── gmail/
│           └── GmailPanel.jsx
├── pages/
│   ├── Auth.jsx          # /login, /register
│   ├── Dashboard.jsx     # /
│   ├── Contacts.jsx      # /contacts
│   ├── Meetings.jsx      # /meetings
│   ├── MusicSync.jsx     # /music
│   ├── SpotSync.jsx      # /spotsync
│   ├── SmartNews.jsx     # /news
│   ├── Drive.jsx         # /drive
│   ├── Profile.jsx       # /profile
│   ├── OAuthCallback.jsx # /oauth-callback
│   └── NotFound.jsx      # *
├── store/
│   ├── useAuthStore.js
│   ├── useChatStore.js
│   ├── useUIStore.js
│   ├── useSocketStore.js
│   ├── useSpotStore.js
│   ├── useYouTubeStore.js
│   └── useMusicStore.js
├── hooks/
│   ├── useSocket.js
│   ├── useGeolocation.js
│   ├── useNotifications.js
│   ├── useDebounce.js
│   └── useKeyPress.js
├── services/
│   ├── api.js
│   ├── socket.js
│   ├── auth.js
│   └── ai.js
├── utils/
│   ├── formatDate.js
│   ├── generateCode.js
│   ├── cn.js
│   └── constants.js
└── styles/
    └── index.css
```

---

## 2. Backend Folder Structure

```
server/
├── index.js
├── routes/
│   ├── auth.js
│   ├── rooms.js
│   ├── messages.js
│   ├── notes.js
│   ├── tasks.js
│   ├── events.js
│   ├── bookmarks.js
│   ├── contacts.js
│   ├── drive.js
│   ├── meetings.js
│   ├── music.js
│   ├── profile.js
│   ├── news.js
│   ├── microLearning.js
│   ├── spotsync.js
│   ├── gmail.js
│   └── ai.js
├── controllers/
│   ├── authController.js
│   ├── roomController.js
│   ├── messageController.js
│   ├── noteController.js
│   ├── taskController.js
│   ├── eventController.js
│   ├── bookmarkController.js
│   ├── contactController.js
│   ├── driveController.js
│   ├── meetingController.js
│   ├── musicController.js
│   ├── profileController.js
│   ├── newsController.js
│   ├── microLearningController.js
│   ├── spotsyncController.js
│   ├── gmailController.js
│   └── aiController.js
├── models/
│   ├── User.js
│   ├── Room.js
│   ├── Message.js
│   ├── Note.js
│   ├── Task.js
│   ├── Event.js
│   ├── Bookmark.js
│   ├── Contact.js
│   ├── Meeting.js
│   ├── MusicRoom.js
│   ├── DriveFile.js
│   ├── DriveFolder.js
│   ├── SavedArticle.js
│   ├── MicroLearning.js
│   ├── SpotSyncPin.js
│   ├── SpotSyncMessage.js
│   └── ActivityLog.js
├── middleware/
│   ├── auth.js
│   ├── upload.js
│   ├── rateLimit.js
│   └── errorHandler.js
├── sockets/
│   ├── chat.js
│   ├── meetings.js
│   ├── music.js
│   ├── youtube.js
│   └── spotsync.js
└── services/
    ├── newsService.js
    ├── aiService.js
    ├── gmailService.js
    ├── storageService.js
    └── reminderService.js
```

---

## 3. Route Map

| Path | Component | Layout | Auth | Modal/Panel Overlay |
|---|---|---|---|---|
| `/login` | AuthPage | None | No | — |
| `/register` | AuthPage | None | No | — |
| `/` | Dashboard | Layout | Yes | Notes, Tasks, Calendar, Bookmarks, NewContact modals; YouTube, Gmail panels; Search overlay |
| `/contacts` | ContactsPage | Layout | Yes | NewContactForm inline |
| `/meetings` | MeetingsPage | Layout | Yes | MeetingRoom (separate layout) |
| `/music` | MusicSyncPage | Layout | Yes | MusicRoom (replaces center) |
| `/spotsync` | SpotSyncPage | Layout | Yes | — |
| `/news` | SmartNewsPage | Layout | Yes | AI summarize inline |
| `/drive` | DrivePage | Layout | Yes | — |
| `/profile` | ProfilePage | Layout | Yes | — |
| `/oauth-callback` | OAuthCallback | None | No | — |
| `*` | NotFound | None | No | — |

**Route guard:** `ProtectedRoute` wrapper reads `useAuthStore.isAuthenticated`, shows `GlobalSpinner` during hydration, redirects to `/login` if unauthenticated.

---

## 4. Zustand Store Architecture

### 4.1 `useAuthStore`

| Field | Type | Purpose |
|---|---|---|
| `user` | Object \| null | `{ _id, email, username, avatarUrl, preferences }` |
| `token` | String \| null | JWT (synced to localStorage) |
| `isAuthenticated` | Boolean | Derived: `!!token` |
| `isHydrating` | Boolean | True during mount token validation |
| `login(token, user)` | Action | Set token+user, persist, connect socket |
| `logout()` | Action | Clear, disconnect socket, navigate `/login` |
| `setUser(user)` | Action | Partial update after profile edit |

### 4.2 `useChatStore`

| Field | Type | Purpose |
|---|---|---|
| `rooms` | Array | Room list |
| `activeRoomId` | String \| null | Currently open chat |
| `messages` | Map<roomId, Message[]> | Per-room message cache |
| `typingUsers` | Map<roomId, userId[]> | Typing indicators |
| `setActiveRoom(id)` | Action | Triggers message fetch |
| `addMessage(msg)` | Action | Append to messages cache |
| `setTyping(roomId, userId, bool)` | Action | Toggle typing state |
| `optimisticSend(msg)` | Action | Insert temp pending message |
| `confirmMessage(tempId, serverMsg)` | Action | Replace optimistic with real |

### 4.3 `useUIStore`

| Field | Type | Purpose |
|---|---|---|
| `modals` | `{ notes, tasks, calendar, bookmarks, newContact, search }` | Boolean flags |
| `panels` | `{ youtube, gmail }` | Slide-in panel visibility |
| `searchQuery` | String | DuckDuckGo query |
| `toast` | `{ message, type, id }` \| null | Active toast |
| `openModal(name)` | Action | Close all modals first, set one true |
| `closeModal(name)` | Action | Set false |
| `closeAllModals()` | Action | Reset all |
| `openPanel(name)` | Action | Close other panel, set true |
| `closePanel(name)` | Action | Set false |
| `showToast(msg, type)` | Action | Set toast, auto-clear 3s |

### 4.4 `useSocketStore`

| Field | Type | Purpose |
|---|---|---|
| `socket` | Socket.io instance \| null | Active socket |
| `isConnected` | Boolean | Connection status |
| `connect(token)` | Action | Create socket, attach global listeners |
| `disconnect()` | Action | Clean disconnect |
| `emit(event, payload)` | Action | Safe emit (no-op if null) |

### 4.5 `useSpotStore`

| Field | Type | Purpose |
|---|---|---|
| `peerLocations` | Map<userId, {lat,lng}> | Friend positions |
| `isLive` | Boolean | Am I broadcasting? |
| `updatePeerLocation(userId, lat, lng)` | Action | Socket callback |
| `removePeer(userId)` | Action | On location:stop |
| `setLive(bool)` | Action | Toggle Go Live |

### 4.6 `useYouTubeStore`

| Field | Type | Purpose |
|---|---|---|
| `videoId` | String \| null | Current loaded video |
| `isPlaying` | Boolean | Playback state |
| `currentTime` | Number | Sync reference |
| `chatMessages` | Array | Group watch chat |
| `participants` | Number | Active viewers |
| `setCurrentVideo(videoId)` | Action | Load new video |
| `addChatMessage(msg)` | Action | Append |

### 4.7 `useMusicStore`

| Field | Type | Purpose |
|---|---|---|
| `currentTrack` | Object \| null | `{ title, artist, albumArt, duration }` |
| `queue` | Array | Track list |
| `isPlaying` | Boolean | Player state |
| `volume` | Number | 0-100 |
| `position` | Number | Current seconds |
| `powerToAll` | Boolean | Anyone-can-control |
| `listeners` | Array | Connected users |
| `setStateFromServer(data)` | Action | Full state sync on join |

---

## 5. React Query Architecture

### 5.1 Query Key Conventions

| Query Key | API Endpoint | staleTime |
|---|---|---|
| `['rooms']` | GET /rooms | 5 min |
| `['messages', roomId]` | GET /rooms/:id/messages | 0 (fresh on open) |
| `['contacts']` | GET /contacts | 10 min |
| `['tasks']` | GET /tasks | 3 min |
| `['notes']` | GET /notes | 3 min |
| `['events', month, year]` | GET /events?month=&year= | 3 min |
| `['news', category]` | GET /news?category= | 10 min |
| `['micro-learning', 'today']` | GET /micro-learning/today | 1 hour |
| `['drive', folderId]` | GET /drive/files?folderId= | 2 min |
| `['profile']` | GET /profile | 5 min |

### 5.2 Default Config

```js
{
  staleTime: 1000 * 60 * 5,
  cacheTime: 1000 * 60 * 30,
  retry: 2,
  refetchOnWindowFocus: true,
}
```

### 5.3 Optimistic Updates

- **Pattern:** `onMutate` → cancel queries → snapshot previous → set optimistic data → `onError` rollback → `onSettled` invalidate
- **Applied to:** Tasks, Notes, Contacts, Bookmarks, Chat messages (via Zustand for instant feel)

### 5.4 Mutations (key ones)

| Mutation | API Call | Invalidation |
|---|---|---|
| `createRoom` | POST /rooms | `['rooms']` |
| `sendMessage` | emit `message:send` | `['messages', roomId]` |
| `createNote` | POST /notes | `['notes']` |
| `createTask` | POST /tasks | `['tasks']` |
| `createEvent` | POST /events | `['events']` |
| `addBookmark` | POST /bookmarks | `['bookmarks']` |
| `uploadFile` | POST /drive/upload | `['drive', folderId]` |
| `updateProfile` | PATCH /profile | `['profile']` |

---

## 6. Socket.io Architecture

### 6.1 Connection Lifecycle

```
User logs in
  → useSocketStore.connect(token)
    → io(WS_URL, { auth: { token } })
      → server middleware verifies JWT
        → socket joins personal room (userId)
          → global listeners registered

User logs out / tab closes
  → socket.disconnect()
    → server emits location:stop if active

Network drops
  → exponential backoff (1s, 2s, 4s, 8s, max 30s)
    → on reconnect: re-join active rooms, REST catchup for missed messages
```

### 6.2 Global Socket Event Listeners

| Event | Handler |
|---|---|
| `message:receive` | `useChatStore.addMessage(msg)` |
| `typing:start` | `useChatStore.setTyping(roomId, userId, true)` |
| `typing:stop` | `useChatStore.setTyping(roomId, userId, false)` |
| `location:update` | `useSpotStore.updatePeerLocation(userId, lat, lng)` |
| `location:stop` | `useSpotStore.removePeer(userId)` |
| `spot:message` | `useSpotStore.addMessage(msg)` |
| `yt:play / pause / seek` | `useYouTubeStore → playerRef methods` |
| `yt:load_video` | `useYouTubeStore.setCurrentVideo(videoId)` |
| `yt:chat_message` | `useYouTubeStore.addChatMessage(msg)` |

### 6.3 Namespace Events

**Chat:** `message:send`, `message:receive`, `room:join`, `typing:start`, `typing:stop`

**Meetings (WebRTC signaling):** `meeting:join` (code, userId, sdpOffer), `meeting:answer` (code, sdpAnswer), `meeting:ice` (code, candidate), `meeting:leave` (code, userId)

**Music Sync:** `room:play`, `room:pause`, `room:seek`, `room:next`, `room:prev`, `room:volume`, `room:power_toggle`

**YouTube:** `yt:play`, `yt:pause`, `yt:seek`, `yt:load_video`, `yt:chat_message`

**SpotSync:** `location:update`, `location:stop`, `spot:message`

---

## 7. API Endpoint Structure

### Auth
```
POST   /auth/login                    # { email, password } → { token, user }
POST   /auth/register                 # { email, password, username } → { token, user }
GET    /auth/google                   # initiates OAuth redirect
GET    /auth/google/callback          # handles redirect → { token, user }
POST   /auth/logout                   # invalidate session
GET    /auth/me                       # validate token → user profile
```

### Chat Rooms
```
GET    /rooms                         # list user's rooms
POST   /rooms                         # { name, type, category } → room
PATCH  /rooms/:id                     # update (name, category)
DELETE /rooms/:id                     # soft delete / move to trash
GET    /rooms/:id/messages            # paginated by cursor
POST   /rooms/:id/messages            # { content } → message
```

### Notes
```
GET    /notes                         # list user notes
POST   /notes                         # { title, content } → note
PATCH  /notes/:id                     # update
DELETE /notes/:id
```

### Tasks
```
GET    /tasks                         # optional ?filter=open|done|reminders
POST   /tasks                         # { content, dueAt? }
PATCH  /tasks/:id                     # { content?, done?, dueAt? }
DELETE /tasks/:id
```

### Events
```
GET    /events?month=5&year=2026      # month-scoped events
POST   /events                        # { title, description, startAt, endAt, color? }
PATCH  /events/:id
DELETE /events/:id
```

### Bookmarks
```
GET    /bookmarks
POST   /bookmarks                     # { title, url, notes? }
DELETE /bookmarks/:id
```

### Contacts
```
GET    /contacts                      # optional ?search=
POST   /contacts                      # { name, phone?, email?, notes? }
PATCH  /contacts/:id
DELETE /contacts/:id
```

### Meetings
```
POST   /meetings                      # { name? } → { code, meeting }
GET    /meetings/:code                # validate code
GET    /meetings/recent               # user's recent meetings
```

### Music
```
POST   /music/rooms                   # → { code, room }
GET    /music/rooms/:code             # validate code, get room state
```

### Drive
```
GET    /drive/files?folderId=         # list files
POST   /drive/upload                  # multipart, 25MB max
PATCH  /drive/files/:id               # star, trash, rename
DELETE /drive/files/:id
GET    /drive/folders                 # list folders
POST   /drive/folders                 # { name, parentId? }
DELETE /drive/folders/:id
```

### Profile
```
GET    /profile
PATCH  /profile                       # { username?, preferences? }
PATCH  /profile/password              # { currentPassword, newPassword }
POST   /profile/avatar                # multipart upload
```

### News
```
GET    /news?category=technology&page=1  # proxied from NewsAPI
```

### Micro-Learning
```
GET    /micro-learning/today          # → today's book + 5 ideas
```

### SpotSync
```
GET    /spotsync/friends              # active friend locations
```

### Gmail
```
GET    /gmail/inbox                   # proxied via googleapis, read-only
```

### AI
```
POST   /ai/generate-note              # { topic? } → { title, content }
POST   /ai/summarize                  # { url } → { summary }
```

---

## 8. MongoDB Schema Plan

### Users
```js
{
  _id, email, passwordHash, username, avatarUrl, googleId,
  preferences: { theme: 'light'|'dark'|'system', notifications: Boolean },
  createdAt
}
```

### Rooms
```js
{
  _id, name, type: 'dm'|'channel', category: 'saved'|'hooked'|'trash',
  ownerId, members: [userId], createdAt
}
```

### Messages
```js
{
  _id, roomId, senderId, content, type: 'text'|'image'|'location',
  timestamp, tempId
}
```

### Notes
```js
{
  _id, userId, title, content, createdAt, updatedAt
}
```

### Tasks
```js
{
  _id, userId, content, dueAt: Date|null, done: Boolean, createdAt
}
```

### Events
```js
{
  _id, userId, title, description, startAt, endAt, color, createdAt
}
```

### Bookmarks
```js
{
  _id, userId, title, url, notes, createdAt
}
```

### Contacts
```js
{
  _id, userId, name, phone, email, notes, isFavorite: Boolean, createdAt
}
```

### Meetings
```js
{
  _id, code, name, hostId, participants: [userId], createdAt, endedAt
}
```

### MusicRooms
```js
{
  _id, code, hostId, members: [userId], currentTrack, queue: [],
  isPlaying: Boolean, position: Number, powerToAll: Boolean, createdAt
}
```

### DriveFiles
```js
{
  _id, userId, name, mimeType, size, url, folderId, isStarred: Boolean,
  isTrashed: Boolean, source: 'user'|'app', createdAt
}
```

### DriveFolders
```js
{
  _id, userId, name, parentId, createdAt
}
```

### SavedArticles
```js
{
  _id, userId, articleUrl, title, source, savedAt
}
```

### MicroLearning
```js
{
  _id, bookTitle, author, category, coverImage, readTime,
  ideas: [{ title, body }], date
}
```

### SpotSyncPins
```js
{
  _id, userId, lat, lng, label, sharedWith: [userId], createdAt
}
```

### SpotSyncMessages
```js
{
  _id, senderId, receiverId, content, pinId, timestamp
}
```

### ActivityLog
```js
{
  _id, userId, module, event, metadata: {}, timestamp
}
```

---

## 9. Reusable Component Hierarchy

```
<App>
  <BrowserRouter>
    <Routes>
      <Route path="/login" element={<AuthPage />} />
      <Route path="/register" element={<AuthPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          {/* Layout children: Navbar, Sidebar, RightPanel, main outlet */}
          <Route index element={<Dashboard />} />
          <Route path="contacts" element={<ContactsPage />} />
          <Route path="meetings" element={<MeetingsPage />} />
          <Route path="music" element={<MusicSyncPage />} />
          <Route path="spotsync" element={<SpotSyncPage />} />
          <Route path="news" element={<SmartNewsPage />} />
          <Route path="drive" element={<DrivePage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>

    {/* Portaled overlays (always mounted when active) */}
    <NotesModal />
    <TasksModal />
    <CalendarModal />
    <BookmarksModal />
    <NewContactModal />
    <SearchOverlay />
    <YouTubePanel />
    <GmailPanel />
    <ToastContainer />
  </BrowserRouter>
</App>
```

### Shared UI Components (used across all modules)

| Component | Props | Used In |
|---|---|---|
| `Button` | `variant, size, loading, icon, children` | Everywhere |
| `Modal` | `open, onClose, title, children, maxWidth` | Notes, Tasks, Calendar, Bookmarks, NewContact |
| `Card` | `className, children, hoverable` | Dashboard, News, Drive, Meetings |
| `Input` | `label, error, icon, ...inputProps` | Every form |
| `Badge` | `count, variant` | Sidebar, Tab bars |
| `Toast` | `message, type` | Global |
| `Spinner` | `size, className` | Everywhere |
| `Skeleton` | `variant, width, height` | Loading states |
| `Avatar` | `name, src, size` | Chat, Contacts, Profile, Music |
| `Pill` | `active, onClick, children` | Filters, categories |
| `EmptyState` | `icon, title, description, action` | All list components |
| `LoadingShimmer` | `className` | Content loading skeleton |

---

## 10. Tailwind Design System Structure

### 10.1 Color Palette

```css
/* Already defined as CSS custom properties in src/styles/index.css */

Token              Hex         Usage
--bg-primary       #F5F5F0     Main background (off-white/beige)
--bg-secondary     #EDEDE8     Cards, sidebar background
--bg-modal         #FAFAF8     Modal backgrounds
--text-primary     #1A1A1A     Headings, important text
--text-secondary   #4A4A4A     Body text
--text-muted       #6B6B6B     Labels, captions, empty states
--border           #D9D9D9     Card borders, input borders
--accent-black     #1A1A1A     Primary buttons, active states
--accent-green     #22C55E     Group watch ON, Power to All
--today-highlight  #FFF8E7     Calendar today cell
```

### 10.2 Typography

```css
Font: Inter (system-ui fallback)
Monospace: JetBrains Mono (for meeting/music codes)

Element              Size         Weight
Auth hero heading    48-56px      800 (Black)
Page heading H1      28-32px      700 (Bold)
Section heading H2   20-24px      600 (SemiBold)
Sub-heading H3       16-18px      600 (SemiBold)
Body text            14-15px      400 (Regular)
Caption/label        11-12px      500 (Medium, muted)
Button text          13-14px      500 (Medium)
```

### 10.3 Spacing & Geometry

```css
Base unit: 4px
Navbar height: 64px
Left sidebar width: 280px
Right utility panel width: 48px
Drive FAB: 56px
Modal max-width: 700px
Card border-radius: 12-16px
Button border-radius: 9999px (full pill)
Input border-radius: 9999px (full pill)
Shadow: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)
```

### 10.4 Component Patterns (Tailwind classes)

**Primary button:** `bg-[#1A1A1A] text-white rounded-full px-5 py-2.5 text-sm font-medium hover:bg-[#333] transition-colors`

**Secondary button:** `bg-white border border-[#D9D9D9] text-[#1A1A1A] rounded-full px-5 py-2.5 text-sm font-medium hover:bg-[#F5F5F0]`

**Card:** `bg-white border border-[#D9D9D9] rounded-xl p-4 shadow-sm`

**Modal:** `bg-[#FAFAF8] rounded-2xl shadow-lg max-w-[700px] w-full pt-12 px-6 pb-6 relative`

**Sidebar room item:** `flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-[#EDEDE8] cursor-pointer`

**Active room:** `bg-[#1A1A1A] text-white`

**Empty state:** `flex flex-col items-center justify-center py-16 text-[#6B6B6B] text-sm`

---

## 11. Modal Hierarchy

### 11.1 Z-Index Stack

| Layer | z-index | Component |
|---|---|---|
| Base layout | 0 | Navbar, Sidebar, Center, RightPanel |
| Slide-in panels | 40 | YouTubePanel, GmailPanel, ChatPanel |
| Search overlay | 50 | SearchOverlay (DuckDuckGo iframe) |
| Modal backdrop | 60 | Semi-opaque dark overlay |
| Modal content | 70 | Notes, Tasks, Calendar, Bookmarks, NewContact |
| Confirmation dialog | 80 | Confirm delete/discard |
| Toast notifications | 90 | ToastContainer |

### 11.2 Open/Close Rules

- Only one primary modal open at a time — `openModal()` calls `closeAllModals()` first
- **Exception:** Confirmation dialog (z-80) stacks above an open modal
- **Close triggers:** X button, backdrop click (configurable per modal), Escape key
- **Render:** `React.createPortal(modal, document.body)`

### 11.3 Backdrop

`fixed inset-0 bg-black/40 backdrop-blur-sm` — rendered only when a modal is open.

### 11.4 Modal State in useUIStore

```js
modals: {
  notes: false,
  tasks: false,
  calendar: false,
  bookmarks: false,
  newContact: false,
  search: false,
}
```

---

## 12. Overlay/Panel Behavior

### 12.1 Slide-in Panels (YouTube, Gmail)

| Property | Value |
|---|---|
| Position | Fixed right |
| Width | 420px |
| Transition | `translateX(100%) → translateX(0)` |
| Duration | 300ms |
| Easing | `cubic-bezier(0.4, 0, 0.2, 1)` |
| Backdrop | None (overlays content) |
| Close | X button + click outside |
| Concurrency | Only one panel open at a time |

### 12.2 Search Overlay

| Property | Value |
|---|---|
| Position | Right-anchored, ~60% viewport width |
| Left portion | Blurred layout visible |
| Content | Close(X), Refresh, Query input, "Add Bookmark" pill, Badge count, Iframe |
| Iframe src | `https://html.duckduckgo.com/html/?q={encoded}` |
| Add Bookmark | Opens Bookmarks modal pre-filled with URL |

### 12.3 Drive FAB

| Property | Value |
|---|---|
| Position | Fixed bottom-right, 24px from edge |
| Size | 56px diameter |
| Visible | Always on Dashboard |
| Action | Navigate to /drive |

### 12.4 Chat Panel (Center Content)

- Chat opens in center content area replacing dashboard feed
- Header: room icon + name + category + X to close (returns to dashboard)
- Footer: fixed message input bar
- Empty state: "No messages yet. Say hi!"

---

## 13. Real-Time Synchronization Plan

### 13.1 Chat Messages

```
User types → optimisticSend (tempId, content) → UI renders immediately
  → emit message:send { roomId, content, senderId }
    → server broadcasts to socket room
      → message:receive arrives → confirmMessage replaces temp
        → if timeout (10s): mark error, show Retry
```

### 13.2 SpotSync Location

```
User clicks Go Live → navigator.geolocation.watchPosition (3s throttle)
  → emit location:update { userId, lat, lng, timestamp }
    → server broadcasts to friends
      → useSpotStore.updatePeerLocation → Leaflet marker CSS transition
User clicks Stop / page unmount → clearWatch() + emit location:stop
```

### 13.3 Music Playback Sync

```
Host action (play/pause/seek/next/prev/volume)
  → emit event { code, timestamp, payload }
    → server rebroadcasts to room members
      → clients apply with ~100ms tolerance
New joiner → server sends full state on room:join ack
Power to All OFF → only host events accepted
Power to All ON → all members emit accepted
```

### 13.4 YouTube Group Watch

```
Any member loads video → yt:load_video { roomId, videoId }
Play/pause/seek → yt:play/pause/seek { roomId, currentTime }
Server rebroadcasts → client calls playerRef methods
Desync recovery: periodic (30s) sync check, correct if >2s drift
```

### 13.5 WebRTC (Meetings)

```
Socket.io as signaling channel only — media flows peer-to-peer
1. meeting:join (SDP offer)
2. meeting:answer (SDP answer)
3. meeting:ice (ICE candidates exchange)
4. meeting:leave (remove peer)
STUN: stun.l.google.com:19302
TURN: coturn or Twilio (fallback)
```

---

## 14. Authentication Flow

### 14.1 Email+Password

```
1. User submits form → POST /auth/login { email, password }
2. Server validates → returns { token, user }
3. Client: useAuthStore.login(token, user)
   - stores token in localStorage (hellow_token)
   - sets isAuthenticated = true
   - connects socket via useSocketStore.connect(token)
4. Navigation: redirect to /
```

### 14.2 Google OAuth

```
1. User clicks "Continue with Google" → navigate GET /auth/google
2. Server initiates Google OAuth redirect
3. User consents → Google redirects to /auth/google/callback
4. Server finds/creates user, generates JWT
5. Server redirects to /oauth-callback?token={jwt}
6. OAuthCallback page reads token → calls login(token)
7. Navigate to /
```

### 14.3 Session Persistence & Validation

```
App mount:
  → read token from localStorage
  → isHydrating = true
  → GET /auth/me (validate token server-side)
    → 200: setUser(user), isHydrating = false
    → 401: clear storage, isHydrating = false, show /login
```

### 14.4 Session Expiry (mid-session)

```
Axios response interceptor catches 401
  → useAuthStore.logout()
  → navigate /login
  → showToast("Session expired")
```

### 14.5 Token Details

- Storage: localStorage key `hellow_token`
- Expiry: 7 days (set in JWT `exp` claim)
- Axios interceptor injects `Authorization: Bearer <token>` on all requests

---

## 15. Feature Interaction Matrix

| Feature A | Feature B | Interaction |
|---|---|---|
| Navbar Search | Bookmarks | "Add Bookmark" from search overlay opens Bookmarks modal pre-filled with URL |
| Chat Rooms | Contacts | Contact → "Message" creates/opens a DM room |
| Notes | AI Assistant | "Generate with AI" button → POST /ai/generate-note |
| Smart News | AI Assistant | "Summarize" button → POST /ai/summarize |
| Smart News | Bookmarks | "Bookmark" icon → POST /bookmarks with article URL |
| Meetings | Contacts | Contacts page "Start Meeting" → /meetings with contact pre-invited |
| SpotSync | Chat | SpotSync has its own built-in chat (separate from Chat Rooms) |
| YouTube | Chat | YouTube group watch has its own in-panel chat (separate from Chat Rooms) |
| Calendar | Tasks | Tasks with `dueAt` appear as markers on Calendar day view |
| Profile | All Modules | Activity log in Profile reads from activity_log collection written by all modules |
| Drive | Profile | Drive FAB visible on Dashboard; Profile "Connected Modules" links to Drive |
| Music Sync | Contacts | Invite contacts by sharing room code (manual) |
| Auth | Gmail | Gmail requires separate Google OAuth scope (gmail.readonly) granted post-login |
| Drive | Chat Rooms | App Content section in Drive shows chat rooms; "Save to Drive" exports message history |
| Calendar | Tasks | Tasks with due dates shown on calendar — not vice versa |
| AI | Notes / News | AI service (Claude/OpenAI) called server-side only for note gen + summarization |

---

## 16. Responsive Behavior Plan

| Breakpoint | Layout | Behavior |
|---|---|---|
| ≥1280px (xl) | Desktop full | 3-column: sidebar 280px + center flex + right panel 48px. Navbar full |
| 1024-1279px (lg) | Large tablet | Sidebar → icon-only (64px). Center expands. Navbar search shrinks |
| 768-1023px (md) | Tablet | Sidebar hidden (hamburger drawer). Right panel hidden → icons moved to bottom nav bar |
| <768px (sm/xs) | Mobile | Single column. Navbar: logo + hamburger only. Bottom tab bar: Home, Chat, Modules, Profile. Modals → full-screen. Panels → full-screen |

### Implementation Notes

- **Tailwind responsive prefixes** (`md:`, `lg:`, `xl:`) in JSX classNames — no JS breakpoint detection in v1
- **Mobile modals:** `fixed inset-0` (full screen) instead of `max-w-[700px] centered`
- **Mobile panels:** Full viewport width slide-in
- **Drive FAB:** Hidden on mobile; Drive accessed via bottom tab bar
- **Sidebar on tablet:** Hamburger icon in navbar opens as drawer overlay
- **Search overlay on mobile:** Full viewport instead of 60%

---

## 17. Implementation Phases

### Phase 1 — MVP (Weeks 1-4)

```
Core infrastructure, auth, primary dashboard
- Project scaffold: React + Vite + Tailwind + ESLint
- Auth: email/password + Google OAuth (JWT)
- Global layout: Navbar, Sidebar, RightPanel, Center
- Dashboard home: MicroLearningCard (static) + NewsFeed (NewsAPI)
- Chat Rooms: create, list, basic messaging (no real-time)
- Notes modal: create + list
- Tasks modal: create + list + mark done
- Calendar modal: month view + day detail + add event
- Bookmarks modal: add + list
- Profile page: static display
- Basic routing with ProtectedRoute
```

### Phase 2 — Core Systems (Weeks 5-8)

```
Real-time features + key module completions
- WebSocket integration: real-time chat
- DuckDuckGo search overlay
- Contacts module: full CRUD + search
- Meetings: create/join rooms + WebRTC (2-person)
- Drive: upload, list, folder management
- Smart News: full page + categories + AI summarize
- Profile: edit + avatar + theme switch + password change
- Browser push notifications for reminders
```

### Phase 3 — Integrations (Weeks 9-12)

```
Third-party APIs + advanced modules
- Gmail OAuth: read-only inbox panel
- SpotSync: Leaflet map + geolocation + WebSocket locations
- Group Music Sync: rooms + WebSocket playback sync
- YouTube panel: embed + curated list + group watch
- AI generation: note gen + news summarization (Claude/OpenAI)
- Micro-learning: API or admin-curated daily content
- Activity log
```

### Phase 4 — Advanced Real-Time + Polish (Weeks 13-16)

```
Multi-participant + performance + UX completion
- Meetings: up to 4 participants + screen share
- Typing indicators in chat
- Dark mode: CSS variable theming
- Responsive: tablet + mobile breakpoints
- Lazy loading + code splitting
- Error boundaries + toast system
- Onboarding: profile completion flow
```

### Phase 5 — Scaling & Enhancement (Post v1.0)

```
Search, previews, PWA, teams
- Universal in-app search (notes, contacts, rooms, files)
- Drive file preview (PDF, image, video)
- Contacts: call logs, favorites
- SpotSync: pin sharing, location history
- Music: external API integration
- Analytics: usage stats
- PWA: service worker, offline, installable
- Teams: workspace/multi-user shared environment
```

---

> **Sources of truth:**
> 1. `/Hellow.pdf` — Primary UI/UX source (screenshots)
> 2. `/Hellow_PRD.docx` — Product Requirements Document v1.0
> 3. `/Hellow_Technical_System_Blueprint.docx` — Technical Blueprint v1.0
>
> *This document encodes ALL design decisions from those files. No redesign, no simplification, no hallucination.*
