import { useCallback } from 'react'
import { useUIStore } from '../store/useUIStore'

export function useNotifications() {
  const showToast = useUIStore((s) => s.showToast)

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      showToast('Notifications not supported', 'error')
      return false
    }
    const permission = await Notification.requestPermission()
    return permission === 'granted'
  }, [showToast])

  const sendNotification = useCallback((title, options = {}) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        icon: '/favicon.svg',
        ...options,
      })
    }
  }, [])

  return { requestPermission, sendNotification }
}
