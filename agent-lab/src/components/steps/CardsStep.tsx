import { useState } from 'react'
import type { CardsStep as S } from '@/content/types'
import { cn } from '@/lib/cn'
import { Icon } from '@/components/ui/Icon'
import type { StepProps } from './shared'

export function CardsStep({ step }: StepProps<S>) {
  const [flipped, setFlipped] = useState<Set<number>>(new Set())
  const toggle = (i: number) =>
    setFlipped((f) => {
      const n = new Set(f)
      if (n.has(i)) n.delete(i)
      else n.add(i)
      return n
    })
  return (
    <div>
      <p className="mb-4 text-sm text-muted">
        {step.intro} <span className="font-semibold text-fg">{flipped.size}/{step.cards.length}</span> explored.
      </p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {step.cards.map((c, i) => {
          const on = flipped.has(i)
          return (
            <button
              key={c.term}
              onClick={() => toggle(i)}
              aria-pressed={on}
              className={cn(
                'group relative min-h-[132px] rounded-2xl border p-4 text-left transition-all duration-200',
                on ? 'border-accent/50 bg-accent-soft' : 'border-line bg-surface hover:-translate-y-0.5 hover:border-line-strong',
              )}
            >
              <div className="flex items-center gap-2">
                <span className={cn('flex h-8 w-8 items-center justify-center rounded-lg', on ? 'bg-gradient-brand text-white' : 'bg-surface-2 text-accent')}>
                  <Icon name={c.icon} size={16} />
                </span>
                <span className="font-display text-[15px] font-semibold">{c.term}</span>
                <Icon name={on ? 'check' : 'pointer'} size={14} className={cn('ml-auto', on ? 'text-accent' : 'text-subtle')} />
              </div>
              <p className="mt-2 text-[13px] text-muted">{c.text}</p>
              {on && <p className="mt-2 rounded-lg border border-line bg-surface px-2.5 py-1.5 font-mono text-[12px] text-fg animate-fade-up">{c.example}</p>}
            </button>
          )
        })}
      </div>
    </div>
  )
}
