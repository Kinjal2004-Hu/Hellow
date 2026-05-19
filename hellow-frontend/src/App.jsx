import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Layout } from './components/layout/Layout'
import { AuthPage } from './pages/Auth'
import { Dashboard } from './pages/Dashboard'
import { ContactsPage } from './pages/Contacts'
import { MeetingsPage } from './pages/Meetings'
import { MusicSyncPage } from './pages/MusicSync'
import { SpotSyncPage } from './pages/SpotSync'
import { SmartNewsPage } from './pages/SmartNews'
import { DrivePage } from './pages/Drive'
import { ProfilePage } from './pages/Profile'
import { OAuthCallback } from './pages/OAuthCallback'
import { NotFoundPage } from './pages/NotFound'
import { useAuthStore } from './store/useAuthStore'

export default function App() {
  const hydrate = useAuthStore((s) => s.hydrate)

  useEffect(() => {
    hydrate()
  }, [hydrate])

  return (
    <Routes>
      <Route path="/login" element={<AuthPage />} />
      <Route path="/register" element={<AuthPage mode="register" />} />
      <Route path="/oauth-callback" element={<OAuthCallback />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="contacts" element={<ContactsPage />} />
        <Route path="meetings" element={<MeetingsPage />} />
        <Route path="music" element={<MusicSyncPage />} />
        <Route path="spotsync" element={<SpotSyncPage />} />
        <Route path="news" element={<SmartNewsPage />} />
        <Route path="drive" element={<DrivePage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
