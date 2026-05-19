import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'

export function NotFoundPage() {
  return (
    <div className="h-screen flex flex-col items-center justify-center gap-4">
      <div className="text-6xl font-bold text-[--text-muted]">404</div>
      <p className="text-[--text-secondary]">This page doesn't exist.</p>
      <Link to="/"><Button>Go home</Button></Link>
    </div>
  )
}
