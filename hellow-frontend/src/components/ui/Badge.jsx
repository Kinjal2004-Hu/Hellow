import { cn } from '../../utils/cn'

export function Badge({ children, count, className }) {
  return (
    <span className={cn(
      'inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[11px] font-medium rounded-full bg-[#EDEDE8] text-[#6B6B6B]',
      className
    )}>
      {count !== undefined ? count : children}
    </span>
  )
}
