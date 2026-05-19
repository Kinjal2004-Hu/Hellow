import { useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cn } from '../../utils/cn'
import { useKeyPress } from '../../hooks/useKeyPress'

export function Modal({ open, onClose, title, children, className }) {
  useKeyPress('Escape', useCallback((e) => { if (open) onClose?.(e) }, [open, onClose]))

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className={cn(
        'relative z-[70] bg-[#FAFAF8] rounded-2xl shadow-xl w-full max-w-[700px] max-h-[85vh] overflow-y-auto animate-[fadeIn_200ms_ease-out]',
        className
      )}>
        <div className="sticky top-0 bg-[#FAFAF8] z-10 flex items-center justify-between px-8 pt-8 pb-4">
          <h2 className="text-xl font-semibold text-[#1A1A1A]">{title}</h2>
          <button onClick={onClose} className="text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors cursor-pointer">
            <X size={20} />
          </button>
        </div>
        <div className="px-8 pb-8">
          {children}
        </div>
      </div>
    </div>,
    document.body
  )
}
