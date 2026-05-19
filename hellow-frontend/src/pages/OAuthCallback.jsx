import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'
import { Spinner } from '../components/ui/Spinner'

export function OAuthCallback() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const login = useAuthStore((s) => s.login)

  useEffect(() => {
    const token = searchParams.get('token')
    const userStr = searchParams.get('user')
    if (token && userStr) {
      try {
        const user = JSON.parse(decodeURIComponent(userStr))
        login(token, user)
        navigate('/')
      } catch {
        navigate('/login')
      }
    } else {
      navigate('/login')
    }
  }, [])

  return (
    <div className="h-screen flex items-center justify-center">
      <Spinner size={32} />
    </div>
  )
}
