import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Music, Play, Pause, SkipBack, SkipForward, Volume2, Copy, Users, List, Disc3, Power } from 'lucide-react'
import { useMusicStore } from '../store/useMusicStore'
import { useUIStore } from '../store/useUIStore'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Card } from '../components/ui/Card'
import { Avatar } from '../components/ui/Avatar'
import { EmptyState } from '../components/ui/EmptyState'

export function MusicSyncPage() {
  const navigate = useNavigate()
  const showToast = useUIStore((s) => s.showToast)
  const {
    isInRoom, isHost, roomCode, currentTrack, queue, isPlaying,
    currentTime, volume, powerToAll, listeners,
    setRoomCode, setHost, setInRoom,
    play, pause, nextTrack, prevTrack,
    setVolume, setCurrentTime, togglePowerToAll,
  } = useMusicStore()

  const [roomName, setRoomName] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [showQueue, setShowQueue] = useState(false)

  const createRoom = () => {
    setRoomCode('MUSIC-' + Math.random().toString(36).substring(2, 6).toUpperCase())
    setHost(true)
    setInRoom(true)
  }

  const joinRoom = () => {
    if (!joinCode.trim()) return
    setRoomCode(joinCode.trim().toUpperCase())
    setHost(false)
    setInRoom(true)
  }

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode)
    showToast('Room code copied', 'success')
  }

  const leaveRoom = () => {
    setInRoom(false)
    setRoomCode(null)
    setHost(false)
  }

  if (isInRoom) {
    const progressPercent = currentTrack ? (currentTime / currentTrack.duration) * 100 : 0

    return (
      <div className="max-w-5xl mx-auto px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button onClick={leaveRoom} className="text-[#6B6B6B] hover:text-[#1A1A1A] cursor-pointer">
              <ArrowLeft size={20} />
            </button>
            <Music size={22} className="text-[#1A1A1A]" />
            <h1 className="text-2xl font-semibold text-[#1A1A1A]">Music Sync</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-[#D9D9D9] rounded-full">
              <span className="text-xs text-[#6B6B6B]">Room:</span>
              <span className="text-sm font-mono font-bold text-[#1A1A1A]">{roomCode}</span>
              <button onClick={copyRoomCode} className="text-[#6B6B6B] hover:text-[#1A1A1A] cursor-pointer">
                <Copy size={14} />
              </button>
            </div>
            {isHost && (
              <button
                onClick={togglePowerToAll}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                  powerToAll ? 'bg-[#22C55E] text-white' : 'bg-[#EDEDE8] text-[#6B6B6B]'
                }`}
              >
                <Power size={14} />
                Power to all
              </button>
            )}
            <button
              onClick={() => setShowQueue(!showQueue)}
              className={`p-2 rounded-full transition-colors cursor-pointer ${
                showQueue ? 'bg-[#1A1A1A] text-white' : 'bg-[#EDEDE8] text-[#4A4A4A]'
              }`}
            >
              <List size={16} />
            </button>
          </div>
        </div>

        <div className="flex gap-6">
          <div className="flex-1">
            <Card className="p-8">
              <div className="flex flex-col items-center">
                <div className="w-48 h-48 rounded-2xl bg-gradient-to-br from-amber-100 to-green-100 flex items-center justify-center mb-6">
                  <Disc3 size={64} className="text-[#4A4A4A] animate-spin" style={{ animationDuration: '3s', animationPlayState: isPlaying ? 'running' : 'paused' }} />
                </div>
                <h3 className="text-lg font-semibold text-[#1A1A1A]">{currentTrack?.title || 'No track'}</h3>
                <p className="text-sm text-[#6B6B6B] mb-6">{currentTrack?.artist || 'Unknown artist'}</p>

                <div className="w-full max-w-sm mb-6">
                  <input
                    type="range"
                    min="0"
                    max={currentTrack?.duration || 100}
                    value={currentTime}
                    onChange={(e) => setCurrentTime(Number(e.target.value))}
                    className="w-full h-1 appearance-none bg-[#EDEDE8] rounded-full outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-[#1A1A1A] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-[#6B6B6B] mt-2">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(currentTrack?.duration || 0)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <button onClick={prevTrack} className="text-[#4A4A4A] hover:text-[#1A1A1A] cursor-pointer">
                    <SkipBack size={22} />
                  </button>
                  <button
                    onClick={() => isPlaying ? pause() : play()}
                    className="w-14 h-14 rounded-full bg-[#1A1A1A] text-white hover:bg-[#333] flex items-center justify-center cursor-pointer transition-colors"
                  >
                    {isPlaying ? <Pause size={24} fill="white" /> : <Play size={24} fill="white" />}
                  </button>
                  <button onClick={nextTrack} className="text-[#4A4A4A] hover:text-[#1A1A1A] cursor-pointer">
                    <SkipForward size={22} />
                  </button>
                </div>

                <div className="flex items-center gap-3 mt-8 w-full max-w-sm">
                  <Volume2 size={16} className="text-[#6B6B6B]" />
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={volume}
                    onChange={(e) => setVolume(Number(e.target.value))}
                    className="flex-1 h-1 appearance-none bg-[#EDEDE8] rounded-full outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-[#1A1A1A] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer"
                  />
                  <span className="text-xs text-[#6B6B6B] w-8 text-right">{volume}%</span>
                </div>
              </div>
            </Card>
          </div>

          {showQueue && (
            <div className="w-80">
              <Card className="p-4">
                <h3 className="text-sm font-semibold text-[#1A1A1A] mb-3">Queue</h3>
                <div className="flex flex-col gap-2">
                  {queue.map((track, i) => (
                    <div
                      key={track.id}
                      className={`flex items-center gap-3 p-2 rounded-lg ${
                        track.id === currentTrack?.id ? 'bg-[#EDEDE8]' : 'hover:bg-[#EDEDE8]'
                      }`}
                    >
                      <span className="text-xs text-[#6B6B6B] w-5">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#1A1A1A] truncate">{track.title}</p>
                        <p className="text-xs text-[#6B6B6B] truncate">{track.artist}</p>
                      </div>
                      <span className="text-xs text-[#6B6B6B]">{formatTime(track.duration)}</span>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-4 mt-3">
                <h3 className="text-sm font-semibold text-[#1A1A1A] mb-3">
                  Listeners ({listeners.length})
                </h3>
                {listeners.length === 0 ? (
                  <p className="text-xs text-[#6B6B6B]">No one else is here yet</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {listeners.map((listener, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <Avatar name={listener.name || '?'} size="sm" />
                        <span className="text-sm text-[#1A1A1A]">{listener.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          )}
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
        <Music size={22} className="text-[#1A1A1A]" />
        <h1 className="text-2xl font-semibold text-[#1A1A1A]">Group Music Sync</h1>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-base font-semibold text-[#1A1A1A] mb-1">Create a room</h3>
          <p className="text-xs text-[#6B6B6B] mb-4">Start a new music session</p>
          <Input
            placeholder="Room name (optional)"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            className="mb-3"
          />
          <Button className="w-full" onClick={createRoom}>
            <Music size={16} /> Create room
          </Button>
        </Card>

        <Card className="p-6">
          <h3 className="text-base font-semibold text-[#1A1A1A] mb-1">Join a room</h3>
          <p className="text-xs text-[#6B6B6B] mb-4">Enter a room code to join</p>
          <Input
            placeholder="Room code"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            className="mb-3 font-mono"
          />
          <Button className="w-full" onClick={joinRoom}>
            Join room
          </Button>
        </Card>
      </div>
    </div>
  )
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}
