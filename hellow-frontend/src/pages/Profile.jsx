import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import {
  ArrowLeft, LogOut, Settings, Sun, Moon, Monitor, Bell, Lock, Shield,
  MessageCircle, FileText, HardDrive, MapPin, Video, Database,
  Edit3, Save, Check,
} from 'lucide-react'
import { api } from '../services/api'
import { QUERY_KEYS } from '../utils/constants'
import { useAuthStore } from '../store/useAuthStore'
import { useUIStore } from '../store/useUIStore'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Card } from '../components/ui/Card'
import { Avatar } from '../components/ui/Avatar'
import { Skeleton } from '../components/ui/Skeleton'
import { EmptyState } from '../components/ui/EmptyState'
import { formatDate } from '../utils/formatDate'

const themeOptions = [
  { id: 'light', label: 'Light', icon: Sun },
  { id: 'dark', label: 'Dark', icon: Moon },
  { id: 'system', label: 'System', icon: Monitor },
]

const statCards = [
  { key: 'chatRooms', label: 'Chat rooms', icon: MessageCircle },
  { key: 'notes', label: 'Notes', icon: FileText },
  { key: 'driveFiles', label: 'Drive files', icon: HardDrive },
  { key: 'storage', label: 'Storage', icon: Database },
  { key: 'meetings', label: 'Meetings', icon: Video },
  { key: 'spotPins', label: 'SpotSync pins', icon: MapPin },
]

export function ProfilePage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const showToast = useUIStore((s) => s.showToast)

  const [theme, setTheme] = useState(() => localStorage.getItem('hellow_theme') || 'light')
  const [notifications, setNotifications] = useState(true)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('hellow_theme', theme)
  }, [theme])
  const [editingProfile, setEditingProfile] = useState(false)
  const [editName, setEditName] = useState('')
  const [editBio, setEditBio] = useState('')
  const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' })

  const { data: profileData, isLoading } = useQuery({
    queryKey: QUERY_KEYS.profile,
    queryFn: () => api.get('/profile'),
  })

  const { data: activityData } = useQuery({
    queryKey: ['activity-log'],
    queryFn: () => api.get('/activity'),
  })

  const updateProfile = useMutation({
    mutationFn: (data) => api.patch('/profile', data),
    onSuccess: () => {
      showToast('Profile updated', 'success')
      setEditingProfile(false)
    },
  })

  const changePassword = useMutation({
    mutationFn: (data) => api.patch('/auth/password', data),
    onSuccess: () => {
      showToast('Password changed', 'success')
      setPasswords({ current: '', newPass: '', confirm: '' })
    },
    onError: (err) => showToast(err.message, 'error'),
  })

  const handleSignOut = () => {
    logout()
    navigate('/login')
  }

  const handleSaveProfile = () => {
    updateProfile.mutate({ name: editName, bio: editBio })
  }

  const handleChangePassword = (e) => {
    e.preventDefault()
    if (passwords.newPass !== passwords.confirm) {
      showToast('Passwords do not match', 'error')
      return
    }
    changePassword.mutate({ currentPassword: passwords.current, newPassword: passwords.newPass })
  }

  const profile = profileData?.user || user
  const stats = profileData?.stats || {}
  const activities = activityData?.activities || []

  const startEditing = () => {
    setEditName(profile?.name || '')
    setEditBio(profile?.bio || '')
    setEditingProfile(true)
  }

  return (
    <div className="max-w-5xl mx-auto px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/')} className="text-[#6B6B6B] hover:text-[#1A1A1A] cursor-pointer">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-semibold text-[#1A1A1A]">Profile</h1>
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 text-sm text-[#6B6B6B] hover:text-red-500 transition-colors cursor-pointer"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : (
        <>
          <Card className="p-6 mb-6">
            <div className="flex items-start gap-6">
              <Avatar name={profile?.name} size="lg" className="w-20 h-20 text-2xl" />
              <div className="flex-1">
                {editingProfile ? (
                  <div className="space-y-3 max-w-sm">
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Your name"
                    />
                    <Input
                      value={editBio}
                      onChange={(e) => setEditBio(e.target.value)}
                      placeholder="Short bio"
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleSaveProfile} disabled={updateProfile.isPending}>
                        <Save size={14} /> Save
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingProfile(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h2 className="text-xl font-semibold text-[#1A1A1A]">{profile?.name || 'User'}</h2>
                    <p className="text-sm text-[#6B6B6B]">{profile?.email}</p>
                    {profile?.bio && <p className="text-sm text-[#4A4A4A] mt-1">{profile.bio}</p>}
                    <Button size="sm" variant="ghost" className="mt-3" onClick={startEditing}>
                      <Edit3 size={14} /> Edit profile
                    </Button>
                  </>
                )}
              </div>
              <div className="text-right">
                <div className="text-xs text-[#6B6B6B] mb-1">Profile completeness</div>
                <div className="w-32 h-2 bg-[#EDEDE8] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#22C55E] rounded-full transition-all"
                    style={{ width: `${profile?.completeness || 65}%` }}
                  />
                </div>
                <span className="text-xs text-[#6B6B6B] mt-1 block">{profile?.completeness || 65}%</span>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-6 gap-3 mb-6">
            {statCards.map((stat) => {
              const Icon = stat.icon
              const value = stats[stat.key]
              return (
                <Card key={stat.key} className="p-4 text-center">
                  <div className="w-8 h-8 rounded-lg bg-[#EDEDE8] flex items-center justify-center mx-auto mb-2">
                    <Icon size={16} className="text-[#4A4A4A]" />
                  </div>
                  <p className="text-lg font-semibold text-[#1A1A1A]">{value ?? '—'}</p>
                  <p className="text-[11px] text-[#6B6B6B]">{stat.label}</p>
                </Card>
              )
            })}
          </div>

          <div className="grid grid-cols-2 gap-6 mb-6">
            <Card className="p-5">
              <h3 className="text-sm font-semibold text-[#1A1A1A] mb-4">Preferences</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-[#6B6B6B] block mb-2">Theme</label>
                  <div className="flex gap-2">
                    {themeOptions.map((opt) => {
                      const Icon = opt.icon
                      return (
                        <button
                          key={opt.id}
                          onClick={() => setTheme(opt.id)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer ${
                            theme === opt.id
                              ? 'bg-[#1A1A1A] text-white'
                              : 'bg-[#EDEDE8] text-[#4A4A4A] hover:bg-[#D9D9D9]'
                          }`}
                        >
                          <Icon size={14} />
                          {opt.label}
                        </button>
                      )
                    })}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell size={16} className="text-[#6B6B6B]" />
                    <span className="text-sm text-[#1A1A1A]">Notifications</span>
                  </div>
                  <button
                    onClick={() => setNotifications(!notifications)}
                    className={`w-10 h-5 rounded-full transition-colors cursor-pointer relative ${
                      notifications ? 'bg-[#22C55E]' : 'bg-[#D9D9D9]'
                    }`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-transform ${
                      notifications ? 'translate-x-5' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
              </div>
            </Card>

            <Card className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <Shield size={16} className="text-[#6B6B6B]" />
                <h3 className="text-sm font-semibold text-[#1A1A1A]">Privacy & Security</h3>
              </div>
              <form onSubmit={handleChangePassword} className="space-y-3">
                <Input
                  type="password"
                  placeholder="Current password"
                  value={passwords.current}
                  onChange={(e) => setPasswords((p) => ({ ...p, current: e.target.value }))}
                  required
                />
                <Input
                  type="password"
                  placeholder="New password"
                  value={passwords.newPass}
                  onChange={(e) => setPasswords((p) => ({ ...p, newPass: e.target.value }))}
                  required
                  minLength={6}
                />
                <Input
                  type="password"
                  placeholder="Confirm new password"
                  value={passwords.confirm}
                  onChange={(e) => setPasswords((p) => ({ ...p, confirm: e.target.value }))}
                  required
                />
                <Button type="submit" size="sm" disabled={changePassword.isPending}>
                  <Lock size={14} /> Change password
                </Button>
              </form>
            </Card>
          </div>

          <Card className="p-5 mb-6">
            <h3 className="text-sm font-semibold text-[#1A1A1A] mb-4">Connected Modules</h3>
            <div className="grid grid-cols-4 gap-3">
              {['Chat', 'Notes', 'Tasks', 'Calendar', 'Bookmarks', 'Contacts', 'Meetings', 'Music', 'SpotSync', 'News', 'Drive', 'Gmail'].map((mod) => (
                <div
                  key={mod}
                  className="flex items-center gap-2 px-3 py-2 bg-[#EDEDE8] rounded-lg text-sm text-[#4A4A4A]"
                >
                  <Check size={14} className="text-[#22C55E]" />
                  {mod}
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="text-sm font-semibold text-[#1A1A1A] mb-4">Recent Activity</h3>
            {activities.length === 0 ? (
              <EmptyState
                icon={<Settings size={24} />}
                title="No recent activity"
                description="Your actions will appear here"
              />
            ) : (
              <div className="flex flex-col gap-2">
                {activities.slice(0, 10).map((activity) => (
                  <div key={activity._id} className="flex items-center gap-3 py-2 border-b border-[#EDEDE8] last:border-0">
                    <div className="w-2 h-2 rounded-full bg-[#22C55E] shrink-0" />
                    <p className="text-sm text-[#1A1A1A] flex-1">{activity.message}</p>
                    <span className="text-xs text-[#6B6B6B]">{formatDate(activity.createdAt)}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  )
}
