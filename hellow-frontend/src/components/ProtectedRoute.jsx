import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'
import { Spinner } from './ui/Spinner'

export function ProtectedRoute({ children }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const isHydrating = useAuthStore((s) => s.isHydrating)

  if (isHydrating) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-[#1A1A1A] rounded-2xl flex items-center justify-center text-white font-bold text-xl">H</div>
          <Spinner size={24} />
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}
