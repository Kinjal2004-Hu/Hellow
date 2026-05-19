import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { ArrowLeft, Video, Copy, Users, Clock } from 'lucide-react'
import { api } from '../services/api'
import { QUERY_KEYS } from '../utils/constants'
import { useUIStore } from '../store/useUIStore'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Card } from '../components/ui/Card'
import { Avatar } from '../components/ui/Avatar'
import { Skeleton } from '../components/ui/Skeleton'
import { EmptyState } from '../components/ui/EmptyState'
import { formatDate } from '../utils/formatDate'

export function MeetingsPage() {
  const navigate = useNavigate()
  const showToast = useUIStore((s) => s.showToast)
  const [inCall, setInCall] = useState(false)
  const [meetingCode, setMeetingCode] = useState('')
  const [meetingName, setMeetingName] = useState('')
  const [roomCode, setRoomCode] = useState('')
  const [createLoading, setCreateLoading] = useState(false)
  const [joinLoading, setJoinLoading] = useState(false)

  const { data: meetingsData, isLoading } = useQuery({
    queryKey: QUERY_KEYS.meetings,
    queryFn: () => api.get('/meetings'),
  })

  const createMeeting = async () => {
    setCreateLoading(true)
    try {
      const data = await api.post('/meetings', { name: meetingName || 'Quick Meeting' })
      setRoomCode(data.code)
      setInCall(true)
      setMeetingCode(data.code)
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setCreateLoading(false)
    }
  }

  const joinMeeting = async () => {
    if (!meetingCode.trim()) return
    setJoinLoading(true)
    try {
      await api.post(`/meetings/join`, { code: meetingCode.trim() })
      setRoomCode(meetingCode.trim())
      setInCall(true)
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setJoinLoading(false)
    }
  }

  const copyCode = () => {
    navigator.clipboard.writeText(roomCode)
    showToast('Code copied to clipboard', 'success')
  }

  const endCall = () => {
    setInCall(false)
    setRoomCode('')
    setMeetingCode('')
  }

  const meetings = meetingsData?.meetings || []

  if (inCall) {
    return (
      <div className="h-[calc(100vh-64px)] flex flex-col bg-[#1A1A1A]">
        <div className="flex items-center justify-between px-8 py-4">
          <div className="flex items-center gap-3">
            <Video size={20} className="text-white" />
            <span className="text-white font-medium">Meeting</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full">
              <span className="text-xs text-white/70">Code:</span>
              <span className="text-sm font-mono text-white font-bold">{roomCode}</span>
              <button onClick={copyCode} className="text-white/70 hover:text-white cursor-pointer">
                <Copy size={14} />
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 grid grid-cols-2 gap-4 p-8">
          <div className="bg-white/5 rounded-2xl flex items-center justify-center text-white/40 text-sm border border-white/10">
            Your video
          </div>
          <div className="bg-white/5 rounded-2xl flex items-center justify-center text-white/40 text-sm border border-white/10">
            Waiting for others...
          </div>
        </div>

        <div className="flex items-center justify-center gap-4 pb-8">
          <button className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer transition-colors">
            <Video size={20} />
          </button>
          <button className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer transition-colors">
            <Users size={20} />
          </button>
          <button
            onClick={endCall}
            className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center text-white cursor-pointer transition-colors"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
            </svg>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-8 py-8">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/')} className="text-[#6B6B6B] hover:text-[#1A1A1A] cursor-pointer">
          <ArrowLeft size={20} />
        </button>
        <Video size={22} className="text-[#1A1A1A]" />
        <h1 className="text-2xl font-semibold text-[#1A1A1A]">Meetings</h1>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-8">
        <Card className="p-6">
          <h3 className="text-base font-semibold text-[#1A1A1A] mb-1">Start a new meeting</h3>
          <p className="text-xs text-[#6B6B6B] mb-4">Create a room and invite others</p>
          <Input
            placeholder="Meeting name (optional)"
            value={meetingName}
            onChange={(e) => setMeetingName(e.target.value)}
            className="mb-3"
          />
          <Button className="w-full" onClick={createMeeting} disabled={createLoading}>
            {createLoading ? 'Creating...' : 'Create'}
          </Button>
        </Card>

        <Card className="p-6">
          <h3 className="text-base font-semibold text-[#1A1A1A] mb-1">Join a meeting</h3>
          <p className="text-xs text-[#6B6B6B] mb-4">Enter a code to join</p>
          <Input
            placeholder="Meeting code"
            value={meetingCode}
            onChange={(e) => setMeetingCode(e.target.value)}
            className="mb-3 font-mono"
          />
          <Button className="w-full" onClick={joinMeeting} disabled={joinLoading}>
            {joinLoading ? 'Joining...' : 'Join'}
          </Button>
        </Card>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-[#1A1A1A] mb-4">Recent meetings</h2>
        {isLoading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : meetings.length === 0 ? (
          <EmptyState
            icon={<Video size={32} />}
            title="No recent meetings"
            description="Start or join a meeting to see it here"
          />
        ) : (
          <div className="flex flex-col gap-2">
            {meetings.map((meeting) => (
              <div
                key={meeting._id}
                className="flex items-center gap-4 p-4 bg-white border border-[#D9D9D9] rounded-xl"
              >
                <div className="w-10 h-10 rounded-xl bg-[#EDEDE8] flex items-center justify-center">
                  <Video size={18} className="text-[#4A4A4A]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#1A1A1A] truncate">{meeting.name}</p>
                  <p className="text-xs text-[#6B6B6B]">
                    Code: {meeting.code} · {formatDate(meeting.createdAt)}
                  </p>
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  meeting.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-[#EDEDE8] text-[#6B6B6B]'
                }`}>
                  {meeting.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
