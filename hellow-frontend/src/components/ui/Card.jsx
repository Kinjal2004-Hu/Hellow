import { cn } from '../../utils/cn'

export function Card({ children, className, ...props }) {
  return (
    <div className={cn(
      'bg-white border border-[#D9D9D9] rounded-xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)]',
      className
    )} {...props}>
      {children}
    </div>
  )
}
