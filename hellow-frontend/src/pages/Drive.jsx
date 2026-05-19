import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft, HardDrive, Search, Upload, Folder, FileText, Image, Video,
  Music, Star, Trash2, Clock, FolderPlus, MoreHorizontal, Download,
} from 'lucide-react'
import { api } from '../services/api'
import { QUERY_KEYS } from '../utils/constants'
import { useUIStore } from '../store/useUIStore'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Card } from '../components/ui/Card'
import { Skeleton } from '../components/ui/Skeleton'
import { EmptyState } from '../components/ui/EmptyState'
import { formatDate, formatRelative } from '../utils/formatDate'

const sideLinks = [
  { id: 'root', label: 'My Drive', icon: HardDrive },
  { id: 'recent', label: 'Recent', icon: Clock },
  { id: 'starred', label: 'Starred', icon: Star },
  { id: 'app-content', label: 'App Content', icon: FileText },
  { id: 'trash', label: 'Trash', icon: Trash2 },
]

const fileIcons = {
  folder: Folder,
  pdf: FileText,
  doc: FileText,
  docx: FileText,
  image: Image,
  jpg: Image,
  png: Image,
  mp4: Video,
  mov: Video,
  mp3: Music,
  wav: Music,
}

function getFileIcon(type, name) {
  const ext = name?.split('.').pop()?.toLowerCase()
  if (type === 'folder') return Folder
  return fileIcons[ext] || FileText
}

function formatFileSize(bytes) {
  if (!bytes) return ''
  const units = ['B', 'KB', 'MB', 'GB']
  let i = 0
  let size = bytes
  while (size >= 1024 && i < units.length - 1) {
    size /= 1024
    i++
  }
  return `${size.toFixed(1)} ${units[i]}`
}

export function DrivePage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const showToast = useUIStore((s) => s.showToast)
  const fileInputRef = useRef(null)
  const [activeSection, setActiveSection] = useState('root')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentFolder, setCurrentFolder] = useState(null)
  const [uploading, setUploading] = useState(false)

  const { data: driveData, isLoading } = useQuery({
    queryKey: QUERY_KEYS.drive(currentFolder),
    queryFn: () => api.get(`/drive${currentFolder ? `?folder=${currentFolder}` : ''}`),
  })

  const toggleStarred = useMutation({
    mutationFn: ({ id, type }) => api.patch(`/drive/${id}/star`, { type }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['drive'] }),
  })

  const deleteItem = useMutation({
    mutationFn: ({ id, type }) => api.delete(`/drive/${id}`, { data: { type } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drive'] })
      showToast('Moved to trash', 'success')
    },
  })

  const handleUpload = async (e) => {
    const files = e.target.files
    if (!files?.length) return
    setUploading(true)
    try {
      const formData = new FormData()
      Array.from(files).forEach((file) => formData.append('files', file))
      if (currentFolder) formData.append('folder', currentFolder)
      await api.upload('/drive/upload', formData)
      queryClient.invalidateQueries({ queryKey: ['drive'] })
      showToast(`${files.length} file(s) uploaded`, 'success')
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setUploading(false)
      fileInputRef.current.value = ''
    }
  }

  const createFolder = async () => {
    const name = prompt('Folder name:')
    if (!name) return
    try {
      await api.post('/drive/folder', { name, parent: currentFolder })
      queryClient.invalidateQueries({ queryKey: ['drive'] })
      showToast('Folder created', 'success')
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  const files = driveData?.files || []
  const folders = driveData?.folders || []

  const allItems = [...folders, ...files]
  const filteredItems = searchQuery
    ? allItems.filter(
        (item) =>
          item.name?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : allItems

  return (
    <div className="h-[calc(100vh-64px)] flex overflow-hidden">
      <div className="w-56 border-r border-[#D9D9D9] bg-white pt-6 px-3 flex flex-col">
        {sideLinks.map((link) => {
          const Icon = link.icon
          return (
            <button
              key={link.id}
              onClick={() => { setActiveSection(link.id); setCurrentFolder(null) }}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-colors text-left cursor-pointer mb-0.5 ${
                activeSection === link.id
                  ? 'bg-[#EDEDE8] text-[#1A1A1A] font-medium'
                  : 'text-[#4A4A4A] hover:bg-[#F5F5F0]'
              }`}
            >
              <Icon size={16} />
              {link.label}
            </button>
          )
        })}
        <div className="mt-auto pt-4 border-t border-[#D9D9D9]">
          <button
            onClick={createFolder}
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-[#4A4A4A] hover:bg-[#F5F5F0] transition-colors w-full text-left cursor-pointer"
          >
            <FolderPlus size={16} />
            New folder
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center gap-4 px-8 py-4 border-b border-[#D9D9D9]">
          <button onClick={() => navigate('/')} className="text-[#6B6B6B] hover:text-[#1A1A1A] cursor-pointer">
            <ArrowLeft size={20} />
          </button>
          <HardDrive size={20} className="text-[#1A1A1A]" />
          <h1 className="text-lg font-semibold text-[#1A1A1A]">Drive</h1>
          <div className="relative flex-1 max-w-md ml-4">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B6B6B]" />
            <Input
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleUpload}
              className="hidden"
            />
            <Button onClick={() => fileInputRef.current?.click()} disabled={uploading}>
              <Upload size={16} />
              {uploading ? 'Uploading...' : 'Upload'}
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          {currentFolder && (
            <button
              onClick={() => setCurrentFolder(null)}
              className="text-sm text-[#6B6B6B] hover:text-[#1A1A1A] mb-4 flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft size={14} /> Back to root
            </button>
          )}

          {isLoading ? (
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          ) : filteredItems.length === 0 ? (
            <EmptyState
              icon={<HardDrive size={32} />}
              title={searchQuery ? 'No files match your search' : 'Drive is empty'}
              description={searchQuery ? 'Try a different name' : 'Upload files or create folders to get started'}
              action={!searchQuery && <Button onClick={() => fileInputRef.current?.click()}><Upload size={16} /> Upload files</Button>}
            />
          ) : (
            <div className="grid grid-cols-4 gap-4">
              {filteredItems.map((item) => {
                const Icon = item.type === 'folder' ? Folder : getFileIcon(item.type, item.name)
                return (
                  <Card
                    key={item._id}
                    className="p-4 hover:border-[#1A1A1A] transition-colors cursor-pointer group"
                    onClick={() => {
                      if (item.type === 'folder') setCurrentFolder(item._id)
                    }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-10 h-10 rounded-xl bg-[#EDEDE8] flex items-center justify-center">
                        <Icon size={20} className="text-[#4A4A4A]" />
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleStarred.mutate({ id: item._id, type: item.type })
                        }}
                        className={`opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer ${
                          item.starred ? 'text-yellow-500 opacity-100' : 'text-[#6B6B6B]'
                        }`}
                      >
                        <Star size={14} fill={item.starred ? 'currentColor' : 'none'} />
                      </button>
                    </div>
                    <p className="text-sm font-medium text-[#1A1A1A] truncate mb-1">{item.name}</p>
                    <p className="text-xs text-[#6B6B6B]">
                      {item.type === 'folder'
                        ? `${item.itemCount || 0} items`
                        : formatFileSize(item.size)}
                    </p>
                    <p className="text-xs text-[#6B6B6B]">{formatRelative(item.updatedAt || item.createdAt)}</p>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
