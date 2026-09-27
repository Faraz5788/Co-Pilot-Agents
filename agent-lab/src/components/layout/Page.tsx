import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

export function Page({ children, className, wide }: { children: ReactNode; className?: string; wide?: boolean }) {
  return <div className={cn('mx-auto w-full px-4 pb-16 pt-6 sm:px-6 lg:px-10 lg:pt-10', wide ? 'max-w-[1500px]' : 'max-w-6xl', className)}>{children}</div>
}

export function PageHeader({ eyebrow, title, subtitle, action, icon }: { eyebrow?: string; title: ReactNode; subtitle?: ReactNode; action?: ReactNode; icon?: ReactNode }) {
  return (
    <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex items-start gap-4">
        {icon}
        <div>
          {eyebrow && <div className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-accent">{eyebrow}</div>}
          <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
          {subtitle && <p className="mt-2 max-w-2xl text-[15px] text-muted">{subtitle}</p>}
        </div>
      </div>
      {action}
    </header>
  )
}
