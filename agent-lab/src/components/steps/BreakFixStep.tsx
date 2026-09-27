import { useState } from 'react'
import type { BreakFixStep as S } from '@/content/types'
import { cn } from '@/lib/cn'
import { Icon } from '@/components/ui/Icon'
import { Feedback, OptionButton, type StepProps } from './shared'

export function BreakFixStep({ step, done, onComplete }: StepProps<S>) {
  const [tried, setTried] = useState<string[]>([])
  const correct = step.options.find((o) => o.correct)!
  const solved = done || tried.includes(correct.id)
  const lastWrong = tried.filter((t) => t !== correct.id).slice(-1)[0]

  const choose = (id: string) => {
    if (solved || tried.includes(id)) return
    const next = [...tried, id]
    setTried(next)
    if (id === correct.id) onComplete({ firstTry: next.length === 1 })
  }

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-2xl border border-bad/30">
        <div className="flex items-center gap-2 bg-bad-soft px-4 py-2 text-xs font-bold uppercase tracking-wider text-bad">
          <Icon name="bug" size={14} /> Incident
        </div>
        <div className="space-y-3 bg-surface p-4">
          <p className="text-sm">{step.scenario}</p>
          <div className="grid gap-2 sm:grid-cols-3">
            {step.evidence.map((e) => (
              <div
                key={e.label}
                className={cn(
                  'rounded-xl border px-3 py-2',
                  e.tone === 'bad' ? 'border-bad/40 bg-bad-soft' : e.tone === 'ok' ? 'border-ok/40 bg-ok-soft' : 'border-line bg-surface-2',
                )}
              >
                <div className="text-[10.5px] font-semibold uppercase tracking-wider text-subtle">{e.label}</div>
                <div className="font-mono text-[13px] font-medium">{e.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <h3 className="font-display text-lg font-semibold">{step.question}</h3>
      <div className="grid gap-2 sm:grid-cols-2">
        {step.options.map((o) => (
          <OptionButton
            key={o.id}
            state={solved && o.id === correct.id ? 'correct' : tried.includes(o.id) ? (o.id === correct.id ? 'correct' : 'wrong') : 'idle'}
            onClick={() => choose(o.id)}
            disabled={solved && o.id !== correct.id}
          >
            {o.text}
          </OptionButton>
        ))}
      </div>
      {lastWrong && !solved && <Feedback tone="bad" title="That wouldn’t catch it">{step.options.find((o) => o.id === lastWrong)!.feedback}</Feedback>}

      {solved && (
        <div className="space-y-3 animate-fade-up">
          <Feedback tone="ok" title="Root cause found">{correct.feedback}</Feedback>
          <div className="rounded-2xl border border-ok/30 bg-surface p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-bold">
              <Icon name="wrench" size={16} className="text-ok" /> FIX · {step.fixTitle}
            </div>
            <div className="grid items-center gap-3 sm:grid-cols-[1fr_auto_1fr]">
              <pre className="overflow-x-auto rounded-xl border border-bad/30 bg-bad-soft p-3 font-mono text-[12px] leading-relaxed">{step.fix.before.join('\n')}</pre>
              <Icon name="arrow-right" size={18} className="mx-auto rotate-90 text-subtle sm:rotate-0" />
              <pre className="overflow-x-auto rounded-xl border border-ok/30 bg-ok-soft p-3 font-mono text-[12px] leading-relaxed">{step.fix.after.join('\n')}</pre>
            </div>
            <p className="mt-3 text-sm text-muted">{step.fix.note}</p>
          </div>
        </div>
      )}
    </div>
  )
}
