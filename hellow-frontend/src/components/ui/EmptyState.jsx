import { cn } from '../../utils/cn'

export function EmptyState({ icon, title, description, action, className }) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 text-center', className)}>
      {icon && <div className="text-[#6B6B6B] mb-4">{icon}</div>}
      <p className="text-sm text-[#6B6B6B] mb-1">{title}</p>
      {description && <p className="text-xs text-[#6B6B6B]">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
