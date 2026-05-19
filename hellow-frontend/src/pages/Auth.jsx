import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Sparkles, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { useAuthStore } from '../store/useAuthStore'
import { login, register } from '../services/auth'
import { api } from '../services/api'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Spinner } from '../components/ui/Spinner'

const features = ['Chat', 'Notes', 'Todos', 'News', 'Reminders', 'AI']

export function AuthPage({ mode = 'login' }) {
  const navigate = useNavigate()
  const loginAction = useAuthStore((s) => s.login)
  const [isRegister, setIsRegister] = useState(mode === 'register')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = isRegister
        ? await register(email, password, username)
        : await login(email, password)
      loginAction(data.token, data.user)
      api.post('/seed').catch(() => {})
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = () => {
    window.location.href = '/api/auth/google'
  }

  return (
    <div className="h-screen flex">
      <div className="w-[55%] bg-gradient-to-br from-amber-100 via-green-100 to-orange-100 flex flex-col justify-center px-20">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full text-xs font-semibold text-[#4A4A4A] mb-6 w-fit">
          <Sparkles size={14} />
          YOUR PRODUCTIVITY HOME
        </div>
        <h1 className="text-5xl font-bold text-[#1A1A1A] leading-tight mb-4">
          One calm place for everything you do.
        </h1>
        <p className="text-[#4A4A4A] text-base mb-8 max-w-md">
          Chat rooms, notes, reminders, smart news, AI assistance — all in one beautifully minimal workspace.
        </p>
        <div className="flex flex-wrap gap-2">
          {features.map((f) => (
            <span
              key={f}
              className="px-4 py-1.5 bg-white/70 backdrop-blur-sm rounded-full text-sm font-medium text-[#4A4A4A] border border-white/50"
            >
              {f}
            </span>
          ))}
        </div>
      </div>

      <div className="w-[45%] bg-[#FAFAF8] flex flex-col justify-center px-16">
        <div className="w-full max-w-sm mx-auto">
          <div className="w-12 h-12 bg-[#1A1A1A] rounded-2xl flex items-center justify-center text-white font-bold text-xl mb-6">
            H
          </div>
          <h2 className="text-2xl font-semibold text-[#1A1A1A] mb-1">
            {isRegister ? 'Create your account' : 'Sign in to continue'}
          </h2>
          <p className="text-sm text-[#6B6B6B] mb-8">
            {isRegister ? 'Get started with Hellow' : 'Welcome back to Hellow'}
          </p>

          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {isRegister && (
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B6B6B]" />
                <Input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            )}
            <div className="relative">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B6B6B]" />
              <Input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
              />
            </div>
            <div className="relative">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B6B6B]" />
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6B6B6B] hover:text-[#1A1A1A] cursor-pointer"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <Button type="submit" className="w-full mt-2" disabled={loading}>
              {loading ? <Spinner size={16} /> : isRegister ? 'Create account' : 'Sign in'}
            </Button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-[#D9D9D9]" />
            <span className="text-xs text-[#6B6B6B]">OR</span>
            <div className="flex-1 h-px bg-[#D9D9D9]" />
          </div>

          <Button
            variant="secondary"
            className="w-full"
            onClick={handleGoogleLogin}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continue with Google
          </Button>

          <p className="text-sm text-[#6B6B6B] text-center mt-6">
            {isRegister ? 'Already have an account?' : "New here?"}{' '}
            <button
              onClick={() => { setIsRegister(!isRegister); setError('') }}
              className="text-[#1A1A1A] font-medium hover:underline cursor-pointer"
            >
              {isRegister ? 'Sign in' : 'Create account'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
