import { useUIStore } from '../../../store/useUIStore'
import { X, Mail } from 'lucide-react'
import { Button } from '../../ui/Button'

export function GmailPanel() {
  const closePanel = useUIStore((s) => s.closePanel)

  return (
    <div className="fixed right-0 top-16 w-[420px] h-[calc(100vh-64px)] bg-white border-l border-[--border] z-40 animate-[slideInRight_300ms_ease] flex flex-col shadow-xl">
      <div className="flex items-center justify-between px-5 py-4 border-b border-[--border]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-red-500 rounded-lg flex items-center justify-center">
            <Mail size={14} className="text-white" />
          </div>
          <span className="text-sm font-semibold text-[--text-primary]">Gmail</span>
        </div>
        <button onClick={() => closePanel('gmail')} className="p-1 text-[--text-muted] hover:text-[--text-primary] cursor-pointer">
          <X size={18} />
        </button>
      </div>
      <div className="flex-1 flex items-center justify-center px-8">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Mail size={32} className="text-red-500" />
          </div>
          <h3 className="text-lg font-bold text-[--text-primary] mb-3">Continue with Google</h3>
          <p className="text-sm text-[--text-secondary] leading-relaxed mb-4">
            Sign in with your Google account to read your inbox right here - secure, read-only, and disconnectable anytime.
          </p>
          <Button variant="primary" className="w-full">
            <Mail size={16} />
            Continue with Google
          </Button>
          <p className="text-xs text-[--text-muted] mt-4">
            Your Gmail link will activate as soon as the workspace's Google connection is ready.
          </p>
        </div>
      </div>
    </div>
  )
}
