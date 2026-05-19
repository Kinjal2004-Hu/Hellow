import { cn } from '../../utils/cn'

export function Skeleton({ className }) {
  return (
    <div
      className={cn(
        'rounded-lg bg-gradient-to-r from-[#EDEDE8] via-[#E0E0D8] to-[#EDEDE8] bg-[length:200%_100%] animate-[shimmer_1.5s_infinite]',
        className
      )}
    />
  )
}
