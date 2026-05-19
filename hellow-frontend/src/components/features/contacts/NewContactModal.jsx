import { useState } from 'react'
import { UserPlus } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Modal } from '../../ui/Modal'
import { Button } from '../../ui/Button'
import { Input } from '../../ui/Input'
import { useUIStore } from '../../../store/useUIStore'
import { api } from '../../../services/api'
import { QUERY_KEYS } from '../../../utils/constants'

export function NewContactModal() {
  const open = useUIStore((s) => s.modals.newContact)
  const close = () => useUIStore.getState().closeModal('newContact')
  const showToast = useUIStore((s) => s.showToast)
  const queryClient = useQueryClient()

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [notes, setNotes] = useState('')

  const mutation = useMutation({
    mutationFn: (body) => api.post('/contacts', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.contacts })
      setName('')
      setPhone('')
      setEmail('')
      setNotes('')
      close()
      showToast('Contact saved', 'success')
    },
    onError: (err) => showToast(err.message, 'error'),
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim()) return
    mutation.mutate({
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      notes: notes.trim(),
    })
  }

  return (
    <Modal open={open} onClose={close} title="New Contact">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <Input
          placeholder="+1 555 555 0100"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <Input
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <textarea
          placeholder="Where you met, kids' names, anything..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="w-full px-4 py-2.5 bg-white border border-[#D9D9D9] rounded-xl text-sm text-[--text-primary] placeholder:text-[--text-muted] outline-none focus:border-[--text-primary] transition-colors resize-none"
        />
        <Button type="submit" variant="primary" disabled={!name.trim()} loading={mutation.isPending}>
          Save
        </Button>
      </form>
    </Modal>
  )
}
