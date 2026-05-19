import { useState, useEffect, useCallback } from 'react'

export function useGeolocation() {
  const [position, setPosition] = useState(null)
  const [error, setError] = useState(null)
  const [watching, setWatching] = useState(false)
  let watchId = null

  const startWatching = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported')
      return
    }
    watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setError(null)
      },
      (err) => setError(err.message),
      { enableHighAccuracy: true, maximumAge: 3000, timeout: 10000 }
    )
    setWatching(true)
  }, [])

  const stopWatching = useCallback(() => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId)
      watchId = null
    }
    setWatching(false)
  }, [])

  useEffect(() => {
    return () => {
      if (watchId !== null) navigator.geolocation.clearWatch(watchId)
    }
  }, [])

  return { position, error, watching, startWatching, stopWatching }
}
