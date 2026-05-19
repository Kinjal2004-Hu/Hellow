import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Plus, Search, Phone, Mail, Star, Clock, Users, UserPlus, Trash2 } from 'lucide-react'
import { api } from '../services/api'
import { QUERY_KEYS } from '../utils/constants'
import { useUIStore } from '../store/useUIStore'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Avatar } from '../components/ui/Avatar'
import { Badge } from '../components/ui/Badge'
import { Skeleton } from '../components/ui/Skeleton'
import { EmptyState } from '../components/ui/EmptyState'
import { formatDate } from '../utils/formatDate'

const tabs = ['All contacts', 'Call logs', 'Favorites']

export function ContactsPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const openModal = useUIStore((s) => s.openModal)
  const showToast = useUIStore((s) => s.showToast)
  const [activeTab, setActiveTab] = useState('All contacts')
  const [search, setSearch] = useState('')

  const { data: contactsData, isLoading: contactsLoading } = useQuery({
    queryKey: QUERY_KEYS.contacts,
    queryFn: () => api.get('/contacts'),
  })

  const { data: callLogsData, isLoading: callLogsLoading } = useQuery({
    queryKey: ['call-logs'],
    queryFn: () => api.get('/contacts/call-logs'),
    enabled: activeTab === 'Call logs',
  })

  const toggleFavorite = useMutation({
    mutationFn: (id) => api.patch(`/contacts/${id}`, { isFavorite: true }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.contacts }),
  })

  const deleteContact = useMutation({
    mutationFn: (id) => api.delete(`/contacts/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.contacts })
      showToast('Contact deleted', 'success')
    },
    onError: (err) => showToast(err.message, 'error'),
  })

  const contacts = contactsData?.contacts || []
  const callLogs = callLogsData?.callLogs || []

  const filteredContacts = contacts.filter((c) => {
    const matchesSearch = !search || c.name?.toLowerCase().includes(search.toLowerCase()) || c.email?.toLowerCase().includes(search.toLowerCase())
    if (activeTab === 'Favorites') return matchesSearch && c.favorite
    return matchesSearch
  })

  return (
    <div className="max-w-5xl mx-auto px-8 py-8">
      <div className="flex items-center gap-4 mb-1">
        <button onClick={() => navigate('/')} className="text-[#6B6B6B] hover:text-[#1A1A1A] cursor-pointer">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-semibold text-[#1A1A1A]">Contacts</h1>
          <p className="text-sm text-[#6B6B6B]">Manage your connections</p>
        </div>
        <div className="ml-auto">
          <Button onClick={() => openModal('newContact')}>
            <Plus size={16} />
            New contact
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-3 mt-6 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors cursor-pointer ${
              activeTab === tab
                ? 'bg-[#1A1A1A] text-white'
                : 'bg-white text-[#4A4A4A] border border-[#D9D9D9] hover:bg-[#EDEDE8]'
            }`}
          >
            {tab}
            {tab === 'All contacts' && contacts.length > 0 && (
              <Badge className="ml-2">{contacts.length}</Badge>
            )}
          </button>
        ))}
      </div>

      <div className="relative mb-6">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B6B6B]" />
        <Input
          placeholder="Search contacts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {activeTab === 'Call logs' ? (
        <div>
          {callLogsLoading ? (
            <div className="flex flex-col gap-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : callLogs.length === 0 ? (
            <EmptyState
              icon={<Phone size={32} />}
              title="No call logs yet"
              description="Your call history will appear here"
            />
          ) : (
            <div className="flex flex-col gap-2">
              {callLogs.map((log) => (
                <div key={log._id} className="flex items-center gap-4 p-3 bg-white border border-[#D9D9D9] rounded-xl">
                  <Avatar name={log.contactName || 'Unknown'} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#1A1A1A] truncate">{log.contactName || 'Unknown'}</p>
                    <p className="text-xs text-[#6B6B6B]">{log.type === 'incoming' ? 'Incoming' : 'Outgoing'} · {formatDate(log.createdAt)}</p>
                  </div>
                  <Phone size={16} className="text-[#22C55E]" />
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div>
          {contactsLoading ? (
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : filteredContacts.length === 0 ? (
            <EmptyState
              icon={<Users size={32} />}
              title={search ? 'No contacts match your search' : 'No contacts yet'}
              description={search ? 'Try a different name' : 'Add your first contact to get started'}
              action={!search && <Button onClick={() => openModal('newContact')}><UserPlus size={16} /> Add contact</Button>}
            />
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {filteredContacts.map((contact) => (
                <div
                  key={contact._id}
                  className="flex items-center gap-4 p-4 bg-white border border-[#D9D9D9] rounded-xl hover:border-[#1A1A1A] transition-colors group"
                >
                  <Avatar name={contact.name} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#1A1A1A] truncate">{contact.name}</p>
                    <p className="text-xs text-[#6B6B6B] truncate">{contact.email || contact.phone || 'No contact info'}</p>
                  </div>
                  <button
                    onClick={() => toggleFavorite.mutate(contact._id)}
                    className={`opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer ${
                      contact.favorite ? 'text-yellow-500 opacity-100' : 'text-[#6B6B6B]'
                    }`}
                    title="Toggle favorite"
                  >
                    <Star size={16} fill={contact.favorite ? 'currentColor' : 'none'} />
                  </button>
                  <button
                    onClick={() => deleteContact.mutate(contact._id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-[#6B6B6B] hover:text-red-500"
                    title="Delete contact"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
