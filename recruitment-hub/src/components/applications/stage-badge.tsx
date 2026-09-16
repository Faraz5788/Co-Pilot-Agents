import { cn } from '@/lib/utils'

const stageColors: Record<string, string> = {
  application: 'bg-blue-100 text-blue-800',
  screening: 'bg-yellow-100 text-yellow-800',
  review: 'bg-purple-100 text-purple-800',
  interview: 'bg-orange-100 text-orange-800',
  offer: 'bg-emerald-100 text-emerald-800',
  hired: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  withdrawn: 'bg-gray-100 text-gray-800',
}

export interface StageBadgeProps {
  name: string
  stageType: string
  className?: string
}

/** Reusable pill badge showing a pipeline stage's name, colored by its stage type. */
export function StageBadge({ name, stageType, className }: StageBadgeProps) {
  const colorClass = stageColors[stageType] ?? 'bg-gray-100 text-gray-800'

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        colorClass,
        className
      )}
    >
      {name}
    </span>
  )
}
