import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react'
import { cn } from '../../utils/cn'
import { useUIStore } from '../../store/useUIStore'

export function ToastContainer() {
  const toast = useUIStore((s) => s.toast)
  const dismissToast = useUIStore((s) => s.dismissToast)

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(dismissToast, 3000)
      return () => clearTimeout(timer)
    }
  }, [toast, dismissToast])

  if (!toast) return null

  const icons = {
    success: <CheckCircle size={16} className="text-[#22C55E]" />,
    error: <AlertCircle size={16} className="text-red-500" />,
    info: <Info size={16} className="text-[#6B6B6B]" />,
  }

  return createPortal(
    <div className="fixed bottom-6 right-6 z-[90] animate-[slideUp_200ms_ease-out]">
      <div className={cn(
        'flex items-center gap-3 px-4 py-3 bg-white border border-[#D9D9D9] rounded-xl shadow-lg',
      )}>
        {icons[toast.type] || icons.info}
        <span className="text-sm text-[#1A1A1A]">{toast.message}</span>
        <button onClick={dismissToast} className="text-[#6B6B6B] hover:text-[#1A1A1A] cursor-pointer ml-2">
          <X size={14} />
        </button>
      </div>
    </div>,
    document.body
  )
}
