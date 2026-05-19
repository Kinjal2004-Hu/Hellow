import { useEffect } from 'react'

export function useKeyPress(targetKey, handler) {
  useEffect(() => {
    const listener = (e) => {
      if (e.key === targetKey) handler(e)
    }
    window.addEventListener('keydown', listener)
    return () => window.removeEventListener('keydown', listener)
  }, [targetKey, handler])
}
