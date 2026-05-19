import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, MapPin, Send, Radio, Users, MessageCircle, Navigation } from 'lucide-react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import { useSpotStore } from '../store/useSpotStore'
import { useGeolocation } from '../hooks/useGeolocation'
import { useUIStore } from '../store/useUIStore'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Avatar } from '../components/ui/Avatar'
import { EmptyState } from '../components/ui/EmptyState'


const quickReplies = ['Hey!', 'Where are you?', 'On my way!', 'Meet you there', 'Looks good!']

function getDefaultIcon() {
  return L.divIcon({
    className: 'bg-transparent',
    html: `<div style="width:32px;height:32px;background:#1A1A1A;border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;font-size:14px;font-weight:bold;border:2px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.2)">📍</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  })
}

export function SpotSyncPage() {
  const navigate = useNavigate()
  const showToast = useUIStore((s) => s.showToast)
  const { position, watching, startWatching, stopWatching } = useGeolocation()
  const {
    isLive, setLive, friends, messages, selectedFriend,
    setSelectedFriend, addMessage, peerLocations,
  } = useSpotStore()

  const [messageText, setMessageText] = useState('')
  const [friendSearch, setFriendSearch] = useState('')

  const toggleLive = () => {
    if (isLive) {
      stopWatching()
      setLive(false)
    } else {
      startWatching()
      setLive(true)
    }
  }

  const sendMessage = () => {
    if (!messageText.trim()) return
    addMessage({
      id: Date.now(),
      text: messageText.trim(),
      sender: 'You',
      timestamp: new Date().toISOString(),
    })
    setMessageText('')
  }

  const handleQuickReply = (text) => {
    addMessage({
      id: Date.now(),
      text,
      sender: 'You',
      timestamp: new Date().toISOString(),
    })
  }

  const allLocations = {
    ...(position ? { you: position } : {}),
    ...peerLocations,
  }

  const center = position || { lat: 20, lng: 78 }

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col">
      <div className="flex items-center justify-between px-8 py-3 border-b border-[#D9D9D9] bg-white">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/')} className="text-[#6B6B6B] hover:text-[#1A1A1A] cursor-pointer">
            <ArrowLeft size={20} />
          </button>
          <MapPin size={20} className="text-[#1A1A1A]" />
          <h1 className="text-lg font-semibold text-[#1A1A1A]">SpotSync</h1>
        </div>
        <button
          onClick={toggleLive}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer ${
            isLive
              ? 'bg-[#22C55E] text-white'
              : 'bg-[#EDEDE8] text-[#4A4A4A] hover:bg-[#D9D9D9]'
          }`}
        >
          <Radio size={14} className={isLive ? 'animate-pulse' : ''} />
          {isLive ? 'Live' : 'Go Live'}
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-72 border-r border-[#D9D9D9] bg-white flex flex-col">
          <div className="p-4 border-b border-[#D9D9D9]">
            <Input
              placeholder="Search friends..."
              value={friendSearch}
              onChange={(e) => setFriendSearch(e.target.value)}
              className="text-sm"
            />
          </div>

          <div className="flex-1 overflow-y-auto p-3">
            <p className="text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider mb-3 px-2">
              Online — {friends.filter((f) => f.online).length}
            </p>
            {friends.length === 0 ? (
              <EmptyState
                icon={<Users size={24} />}
                title="No friends yet"
                description="Add friends to see them here"
              />
            ) : (
              <div className="flex flex-col gap-1">
                {friends
                  .filter((f) => !friendSearch || f.name.toLowerCase().includes(friendSearch.toLowerCase()))
                  .map((friend) => (
                    <button
                      key={friend._id || friend.id}
                      onClick={() => setSelectedFriend(friend._id || friend.id)}
                      className={`flex items-center gap-3 p-2 rounded-xl transition-colors text-left cursor-pointer ${
                        selectedFriend === (friend._id || friend.id)
                          ? 'bg-[#EDEDE8]'
                          : 'hover:bg-[#F5F5F0]'
                      }`}
                    >
                      <div className="relative">
                        <Avatar name={friend.name} size="sm" />
                        <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                          friend.online ? 'bg-[#22C55E]' : 'bg-[#D9D9D9]'
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#1A1A1A] truncate">{friend.name}</p>
                        <p className="text-xs text-[#6B6B6B]">{friend.online ? 'Online' : 'Offline'}</p>
                      </div>
                    </button>
                  ))}
              </div>
            )}
          </div>

          <div className="border-t border-[#D9D9D9] p-4 flex flex-col gap-2">
            <div className="flex flex-wrap gap-1.5">
              {quickReplies.map((reply) => (
                <button
                  key={reply}
                  onClick={() => handleQuickReply(reply)}
                  className="px-2.5 py-1 text-xs rounded-full bg-[#EDEDE8] text-[#4A4A4A] hover:bg-[#D9D9D9] cursor-pointer transition-colors"
                >
                  {reply}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Type a message..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                className="text-sm flex-1"
              />
              <button
                onClick={sendMessage}
                disabled={!messageText.trim()}
                className="p-2.5 rounded-full bg-[#1A1A1A] text-white hover:bg-[#333] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                <Send size={14} />
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 relative">
          <MapContainer
            center={[center.lat, center.lng]}
            zoom={13}
            className="h-full w-full"
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {Object.entries(allLocations).map(([key, loc]) => (
              <Marker
                key={key}
                position={[loc.lat, loc.lng]}
                icon={getDefaultIcon()}
              >
                <Popup>
                  <div className="text-sm font-medium">
                    {key === 'you' ? 'You' : friends.find((f) => (f._id || f.id) === key)?.name || key}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>

          {position && (
            <div className="absolute bottom-4 left-4 bg-white border border-[#D9D9D9] rounded-xl px-4 py-2 shadow-lg flex items-center gap-2">
              <Navigation size={14} className="text-[#22C55E]" />
              <span className="text-xs text-[#6B6B6B]">
                {position.lat.toFixed(4)}, {position.lng.toFixed(4)}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
