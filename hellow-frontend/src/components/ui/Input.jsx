import { cn } from '../../utils/cn'

export function Input({ className, ...props }) {
  return (
    <input
      className={cn(
        'w-full px-4 py-2.5 bg-white border border-[#D9D9D9] rounded-full text-sm text-[#1A1A1A] placeholder:text-[#6B6B6B] outline-none focus:border-[#1A1A1A] transition-colors',
        className
      )}
      {...props}
    />
  )
}
