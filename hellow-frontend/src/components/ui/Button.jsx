import { cn } from '../../utils/cn'

export function Button({ children, variant = 'primary', size = 'default', className, ...props }) {
  const base = 'inline-flex items-center justify-center gap-2 font-medium transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'
  const variants = {
    primary: 'bg-[#1A1A1A] text-white hover:bg-[#333] rounded-full',
    secondary: 'bg-white text-[#1A1A1A] border border-[#D9D9D9] hover:bg-[#F5F5F0] rounded-full',
    ghost: 'bg-transparent text-[#4A4A4A] hover:bg-[#EDEDE8] rounded-full',
    danger: 'bg-red-500 text-white hover:bg-red-600 rounded-full',
    green: 'bg-[#22C55E] text-white hover:bg-[#16A34A] rounded-full',
  }
  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    default: 'px-5 py-2 text-sm',
    lg: 'px-6 py-2.5 text-base',
  }
  return (
    <button className={cn(base, variants[variant], sizes[size], className)} {...props}>
      {children}
    </button>
  )
}
