export const API_URL = '/api'
export const WS_URL = 'http://localhost:3001'

export const QUERY_KEYS = {
  rooms: ['rooms'],
  messages: (id) => ['messages', id],
  contacts: ['contacts'],
  tasks: ['tasks'],
  notes: ['notes'],
  events: (month, year) => ['events', month, year],
  news: (category) => ['news', category],
  microLearning: ['micro-learning', 'today'],
  drive: (folderId) => ['drive', folderId],
  profile: ['profile'],
  bookmarks: ['bookmarks'],
  meetings: ['meetings'],
  musicRooms: ['music-rooms'],
}
