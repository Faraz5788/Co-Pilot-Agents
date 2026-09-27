import { useState } from 'react'
import type { QuizStep as S } from '@/content/types'
import { cn } from '@/lib/cn'
import { Icon } from '@/components/ui/Icon'
import { Feedback, OptionButton, type StepProps } from './shared'

const GOV: Record<string, { icon: string; cls: string }> = {
  allow: { icon: 'check', cls: 'text-ok' },
  deny: { icon: 'ban', cls: 'text-bad' },
  approve: { icon: 'user-check', cls: 'text-warn' },
}

export function QuizStep({ step, done, onComplete }: StepProps<S>) {
  const [tried, setTried] = useState<string[]>([])
  const correct = step.options.find((o) => o.correct)!
  const solved = done || tried.includes(correct.id)
  const last = tried.length ? step.options.find((o) => o.id === tried[tried.length - 1]) : undefined

  const choose = (id: string) => {
    if (solved || tried.includes(id)) return
    const next = [...tried, id]
    setTried(next)
    if (id === correct.id) onComplete({ firstTry: next.length === 1 })
  }

  const stateOf = (id: string) => {
    if (solved && id === correct.id) return 'correct'
    if (tried.includes(id)) return id === correct.id ? 'correct' : 'wrong'
    return 'idle'
  }

  return (
    <div className="space-y-4">
      {step.context && <p className="text-sm text-muted">{step.context}</p>}
      {step.scenario && (
        <div className="rounded-2xl border border-line bg-surface-2/60 p-4">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-lg bg-accent-2-soft px-2 py-1 text-xs font-bold text-accent-2">
              <Icon name="bot" size={14} /> {step.scenario.actor}
            </span>
            <span className="text-sm font-semibold">wants to</span>
            <span className="text-sm font-bold">{step.scenario.action}</span>
          </div>
          <dl className="grid gap-2 sm:grid-cols-2">
            {step.scenario.details.map((d) => (
              <div key={d.label} className="rounded-lg border border-line bg-surface px-3 py-2">
                <dt className="text-[10.5px] font-semibold uppercase tracking-wider text-subtle">{d.label}</dt>
                <dd className="text-sm">{d.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}
      <h3 className="font-display text-lg font-semibold leading-snug">{step.question}</h3>
      <div className={cn('grid gap-2', step.variant === 'governance' ? 'sm:grid-cols-3' : '')}>
        {step.options.map((o, i) => {
          const gov = step.variant === 'governance' ? GOV[o.id] : undefined
          return (
            <OptionButton key={o.id} state={stateOf(o.id)} onClick={() => choose(o.id)} disabled={solved && o.id !== correct.id && !tried.includes(o.id)}>
              {gov ? (
                <span className="flex flex-col items-center gap-1.5 py-2 text-center">
                  <Icon name={gov.icon} size={24} className={gov.cls} />
                  <span className="font-display text-[15px] font-bold tracking-wide">{o.text}</span>
                </span>
              ) : (
                <span className="flex items-start gap-3">
                  <span className="mt-px flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-line bg-surface-2 text-xs font-bold text-muted">
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span>{o.text}</span>
                </span>
              )}
            </OptionButton>
          )
        })}
      </div>
      {last && !solved && <Feedback tone="bad" title="Not quite — try again">{last.feedback}</Feedback>}
      {solved && (
        <Feedback tone="ok" title={tried.length <= 1 ? 'Correct!' : 'That’s it'}>
          {correct.feedback}
        </Feedback>
      )}
      {solved && step.variant === 'governance' && tried.filter((t) => t !== correct.id).length > 0 && (
        <div className="space-y-1 text-xs text-muted">
          {tried.filter((t) => t !== correct.id).map((t) => (
            <p key={t}>
              <span className="font-semibold text-fg">Why not {step.options.find((o) => o.id === t)?.text}?</span> {step.options.find((o) => o.id === t)?.feedback}
            </p>
          ))}
        </div>
      )}
    </div>
  )
}
