import type { ReactNode } from 'react'
import { Inbox } from 'lucide-react'

export function ChartEmptyState({
  message = 'No data available yet',
  icon,
}: {
  message?: string
  icon?: ReactNode
}) {
  return (
    <div className="flex h-56 flex-col items-center justify-center gap-2 text-gray-400 dark:text-gray-600">
      {icon ?? <Inbox className="h-8 w-8" strokeWidth={1.5} />}
      <p className="text-sm">{message}</p>
    </div>
  )
}
