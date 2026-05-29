# Layout Refactoring Context

## Overview

Transformed the frontend layout from a fixed sidebar + permanent right panel architecture into a modern workspace layout with slide-out drawers. The design is inspired by Notion, Slack, Linear, and Arc Browser.

## Architecture

### Before

```
[ Sidebar 280px ] [ main content ] [ RightPanel 56px ]
                           ↓
                ChatRoomPanel (overlay slide-in)
```

- `Layout.tsx` rendered `Sidebar` (fixed left 280px) + `main` (padding-left 280px, padding-top 96px) + `RightPanel` (fixed right 56px)
- Chat opened as a 420px slide-in overlay panel (`ChatRoomPanel`) via `PanelManager`
- Dashboard content was inlined in `routes/index.tsx`

### After

```
[ LeftSidebar 280px ] [ MainWorkspace 1fr ] [ RightToolRail 72px ]
                                                      ↓
                                                RightDrawer 380px (slide-out)
```

- `Layout.tsx` renders flex container: `LeftSidebar` + `MainWorkspace` + `RightToolRail` + `RightDrawer`
- MainWorkspace conditionally shows `DashboardHome` (no room) or `ChatWorkspace` (room active)
- RightToolRail opens `RightDrawer` for contacts, profile, meetings, etc.

## Layout Grid

```
Desktop: 280px | 1fr | 72px | (380px drawer, hidden by default)
```

`Layout.tsx` uses `h-screen flex flex-col` for the outer shell, then `flex flex-1 overflow-hidden` for the workspace row.

## Component Map

```
Layout.tsx
├── Navbar.tsx                    (top bar, unchanged)
├── Sidebar.tsx (export: LeftSidebar)  (left sidebar, refactored)
├── MainWorkspace.tsx             (new, workspace container)
│   ├── DashboardHome.tsx         (new, extracted from routes/index.tsx)
│   └── ChatWorkspace.tsx         (new, refactored from ChatRoomPanel)
├── RightToolRail.tsx             (new, replaces RightPanel)
├── RightDrawer.tsx               (new, slide-out drawer system)
│   ├── ContactsDrawer.tsx        (new)
│   └── ProfileDrawer.tsx         (new)
└── PanelManager.tsx              (YouTube, Gmail, Search panels only)
```

## Files Changed

| File | Status | Notes |
|---|---|---|
| `src/store/useUIStore.ts` | Modified | Added `DrawerType`, `activeDrawer`, `openDrawer/closeDrawer/toggleDrawer`. Removed `chatRoom` from `PanelName`. |
| `src/components/layout/Sidebar.tsx` | Modified | Export renamed to `LeftSidebar`. Room click now toggles `activeRoomId` inline (no `openPanel`). Improved spacing. |
| `src/components/layout/Layout.tsx` | Rewritten | Flex-based layout replacing padding hacks. |
| `src/components/layout/MainWorkspace.tsx` | New | Routes between `DashboardHome` and `ChatWorkspace` based on `activeRoomId`. |
| `src/components/layout/DashboardHome.tsx` | New | Extracted from `routes/index.tsx`. |
| `src/components/layout/ChatWorkspace.tsx` | New | Refactored from `ChatRoomPanel.tsx`. Inline, full-width chat. |
| `src/components/layout/RightToolRail.tsx` | New | 72px fixed right rail. Opens drawers. |
| `src/components/layout/RightDrawer.tsx` | New | 380px slide-out drawer with overlay. ESC/outside-click to close. |
| `src/components/layout/ContactsDrawer.tsx` | New | Contact list, search, add contact, online status. |
| `src/components/layout/ProfileDrawer.tsx` | New | Profile info, settings, sign out. |
| `src/components/panels/PanelManager.tsx` | Modified | Removed `ChatRoomPanel` import. |
| `src/routes/index.tsx` | Simplified | Uses `DashboardHome` component. |
| `src/styles.css` | Modified | Removed `main { padding-left: 280px }`. |
| `src/components/layout/DriveFab.tsx` | Modified | Updated `right` from `4.25rem` to `5.5rem` for new rail width. |
| `src/components/panels/YouTubePanel.tsx` | Modified | `right-14` → `right-[72px]`. |
| `src/components/panels/GmailPanel.tsx` | Modified | `right-14` → `right-[72px]`. |
| `src/components/panels/SearchPanel.tsx` | Modified | `right-14` → `right-[72px]`. |

## Drawer System

### Types

```ts
type DrawerType =
  | "contacts" | "location" | "meetings" | "news"
  | "media" | "actions" | "mail" | "tasks" | "profile";
```

### Implementation

- `RightDrawer.tsx` renders drawer based on `activeDrawer` from `useUIStore`
- Opens from right, 380px wide, overlays main content
- ESC key closes, outside-click closes, body scroll locked when open
- Uses existing slide-in-right animation from `styles.css`
- Stub components for: location, meetings, news, media, actions, mail, tasks

### Active Drawer Content

| Drawer | Status | Notes |
|---|---|---|
| contacts | Implemented | Search, add contact, contact list with online status |
| profile | Implemented | User info, settings, sign out |
| location | Stub | "Coming soon" placeholder |
| meetings | Stub | "Coming soon" placeholder |
| news | Stub | "Coming soon" placeholder |
| media | Stub | "Coming soon" placeholder |
| actions | Stub | "Coming soon" placeholder |
| mail | Stub | "Coming soon" placeholder |
| tasks | Stub | "Coming soon" placeholder |

## Chat System

### Before

- `ChatRoomPanel.tsx` rendered as fixed overlay (420px wide, `right-14`, `z-40`)
- Opened via `openPanel("chatRoom")` from `Sidebar.tsx`
- Used `useMountTransition` for slide-in/out animation
- Closed via `setActiveRoom(null)` + `closePanel("chatRoom")`

### After

- `ChatWorkspace.tsx` renders inline within `MainWorkspace` (full width)
- Opens when `activeRoomId` is set in `useChatStore`
- Closes via `setActiveRoom(null)` only
- No overlay, no fixed positioning, no animation needed
- `ChatRoomPanel.tsx` remains as dead code (not imported, not in PanelManager)

## State Management

### useUIStore Changes

```ts
// Added
activeDrawer: DrawerType | null;
openDrawer: (name: DrawerType) => void;
closeDrawer: () => void;
toggleDrawer: (name: DrawerType) => void;

// Removed
// PanelName: "chatRoom" (removed from union)
// panels.chatRoom (removed from initial state)
```

### Sidebar Click Behavior

```ts
// Before
const handleRoomClick = (id: string) => {
  setActiveRoom(id);
  openPanel("chatRoom");  // Opens overlay panel
};

// After
const handleRoomClick = (id: string) => {
  setActiveRoom(activeRoomId === id ? null : id);  // Toggle inline
};
```

## Layout CSS

### Removed

```css
/* Old layout hack */
main { padding-left: 280px; }
```

### New Layout

```tsx
// Layout.tsx uses flex:
<div className="h-screen flex flex-col">
  <Navbar />                              {/* fixed top 96px */}
  <div className="flex flex-1 overflow-hidden pt-[96px]">
    <LeftSidebar />                       {/* fixed left 280px */}
    <div className="flex-1 overflow-hidden">
      <MainWorkspace>{children}</MainWorkspace>
    </div>
    <RightToolRail />                     {/* fixed right 72px */}
    <RightDrawer />                       {/* 380px, hidden by default */}
  </div>
</div>
```

## Preserved Functionality

All existing features remain intact:

- Auth (JWT token, ProtectedRoute, OAuth)
- Chat rooms (create, delete, categories, unread badges)
- Real-time messaging (Socket.IO, typing indicators, optimistic sends)
- YouTube panel (group watch, sync, chat)
- Gmail panel (inbox, connect, disconnect)
- Search panel (web search, bookmarks)
- Modals (Notes, Tasks, Calendar, Bookmarks, AI Chat, Micro-Learning, New Contact)
- Theme system (light/dark/system)
- All routing (/contacts, /profile, /news, /music, /meetings, /workspace, etc.)
- Presence overlay
- Toast notifications
- Drive FAB

## Page Fixes

### spotsync.tsx
- **Fixed:** Duplicate `useState` and `useUIStore` imports (4 TS errors)
- **Fixed:** Nested `YouTubeAction` component inside `SpotSyncPage` (React hooks violation — recreated on every render)
- **Fixed:** Hardcoded "ashish sharma" user name replaced with `currentUser?.username` from `useAuthStore`
- **Fixed:** Hardcoded avatar initial "A" replaced with dynamic user initial
- **Redesigned:** Room layout now has toggleable sidebar (20% chat, 80% map split)
  - Added sidebar toggle strip (thin button on left edge)
  - Sidebar collapses/expands with smooth animation
  - When collapsed: map takes full width
  - Pin form moved inside sidebar as inline section
  - Members list and chat area use flex ratios for proportional space

### meetings.tsx
- **Fixed:** Hardcoded dark theme (`bg-[#1a1a2e]`, `bg-[#16162a]`, `bg-[#222244]`) replaced with app theme tokens (`bg-background`, `bg-surface`, `bg-muted`)
- **Fixed:** Hardcoded text colors (`text-white/80`, `text-white/60`) replaced with app tokens (`text-foreground/80`, `text-muted-foreground`)
- **Fixed:** Hardcoded background colors on controls replaced with app theme classes (`bg-accent`, `bg-destructive`)

### music.tsx
- Already had correct `YouTubeAction` component structure (not nested)

### workspace.tsx
- No changes needed — already used app theme correctly

## Build Status

- TypeScript: 0 errors
- Vite build: Success (client + SSR)
