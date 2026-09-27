import { useState } from 'react'
import type { SequenceStep as S } from '@/content/types'
import { cn } from '@/lib/cn'
import { Icon } from '@/components/ui/Icon'
import { Feedback, useShuffled, type StepProps } from './shared'

export function SequenceStep({ step, done, onComplete }: StepProps<S>) {
  const pool = useShuffled(step.items, step.id)
  const [order, setOrder] = useState<string[]>(() => (done ? step.items.map((i) => i.id) : []))
  const [wrong, setWrong] = useState<string | null>(null)
  const [mistakes, setMistakes] = useState(0)
  const complete = order.length === step.items.length

  const pick = (id: string) => {
    if (order.includes(id) || complete) return
    const expected = step.items[order.length].id
    if (id === expected) {
      const next = [...order, id]
      setOrder(next)
      setWrong(null)
      if (next.length === step.items.length) onComplete({ firstTry: mistakes === 0 })
    } else {
      setMistakes((m) => m + 1)
      setWrong(id)
    }
  }
  const wrongItem = step.items.find((i) => i.id === wrong)
  const wrongPos = step.items.findIndex((i) => i.id === wrong)

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">{step.prompt}</p>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <div className="mb-2 text-xs font-semibold text-subtle">AVAILABLE STEPS</div>
          <div className="flex flex-col gap-2">
            {pool.map((i) => {
              const used = order.includes(i.id)
              return (
                <button
                  key={i.id}
                  onClick={() => pick(i.id)}
                  disabled={used}
                  className={cn(
                    'flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left text-sm transition-all',
                    used ? 'border-transparent bg-surface-2/40 text-subtle line-through' : 'border-line bg-surface hover:-translate-y-px hover:border-accent/50',
                    wrong === i.id && 'animate-shake border-bad/60 bg-bad-soft',
                  )}
                >
                  <Icon name={i.icon ?? 'circle'} size={16} className={used ? 'text-subtle' : 'text-accent'} />
                  {i.text}
                </button>
              )
            })}
          </div>
        </div>
        <div>
          <div className="mb-2 text-xs font-semibold text-subtle">YOUR SEQUENCE</div>
          <ol className="flex flex-col gap-2">
            {step.items.map((_, idx) => {
              const id = order[idx]
              const item = step.items.find((i) => i.id === id)
              return (
                <li
                  key={idx}
                  className={cn(
                    'flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-sm',
                    item ? 'border-ok/40 bg-ok-soft animate-pop' : idx === order.length ? 'border-dashed border-accent/60' : 'border-dashed border-line text-subtle',
                  )}
                >
                  <span className={cn('flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold', item ? 'bg-ok text-white' : 'bg-surface-2 text-muted')}>{idx + 1}</span>
                  {item ? item.text : idx === order.length ? <span className="text-muted">What comes next?</span> : '—'}
                </li>
              )
            })}
          </ol>
        </div>
      </div>
      {wrongItem && !complete && (
        <Feedback tone="bad" title="Not yet">
          “{wrongItem.text}” is step {wrongPos + 1}. Something needs to happen before it. What must come directly after “{order.length ? step.items[order.length - 1].text : 'the start'}”?
        </Feedback>
      )}
      {complete && <Feedback tone="ok" title="Sequence complete">{step.explanation}</Feedback>}
    </div>
  )
}
