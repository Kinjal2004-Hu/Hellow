import { cn } from '../../utils/cn'

export function Avatar({ name, size = 'md', className }) {
  const initial = (name || '?')[0].toUpperCase()
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-lg',
  }
  return (
    <div className={cn(
      'rounded-xl bg-[#1A1A1A] text-white flex items-center justify-center font-semibold select-none',
      sizes[size],
      className
    )}>
      {initial}
    </div>
  )
}
