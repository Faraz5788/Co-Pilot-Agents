import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface StatCardProps {
  title: string
  value: number | string
  icon: ReactNode
  color?: string
  subtitle?: string
}

/**
 * Reusable KPI stat card: icon, large value, label, with a colored left
 * accent border. `color` accepts a Tailwind border color class (e.g.
 * `border-l-blue-500`); it defaults to a neutral border when omitted.
 */
export function StatCard({ title, value, icon, color, subtitle }: StatCardProps) {
  return (
    <div
      className={cn(
        'rounded-lg border border-l-4 bg-white shadow-sm p-6 dark:bg-gray-900 dark:border-gray-800',
        color ?? 'border-l-gray-300 dark:border-l-gray-700'
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{title}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-gray-900 dark:text-gray-50">
            {value}
          </p>
          {subtitle ? (
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>
          ) : null}
        </div>
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-300">
          {icon}
        </div>
      </div>
    </div>
  )
}
