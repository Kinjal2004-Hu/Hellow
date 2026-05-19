import { cn } from '../../utils/cn'

export function Pill({ children, active, onClick, className }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-3 py-1 text-xs font-medium rounded-full border transition-colors cursor-pointer',
        active
          ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
          : 'bg-white text-[#4A4A4A] border-[#D9D9D9] hover:bg-[#EDEDE8]',
        className
      )}
    >
      {children}
    </button>
  )
}
