import { useState } from 'react'
import type { MatchStep as S } from '@/content/types'
import { cn } from '@/lib/cn'
import { Icon } from '@/components/ui/Icon'
import { Button } from '@/components/ui/primitives'
import { Feedback, type StepProps } from './shared'

export function MatchStep({ step, done, onComplete }: StepProps<S>) {
  const [round, setRound] = useState(done ? step.rounds.length : 0)
  const [tried, setTried] = useState<string[]>([])
  const [firstTryCount, setFirstTryCount] = useState(0)
  const [mistakes, setMistakes] = useState(0)
  const finished = round >= step.rounds.length
  const r = step.rounds[Math.min(round, step.rounds.length - 1)]
  const solved = tried.includes(r.answer)

  const choose = (id: string) => {
    if (solved || tried.includes(id)) return
    const next = [...tried, id]
    setTried(next)
    if (id === r.answer) {
      if (next.length === 1) setFirstTryCount((c) => c + 1)
    } else setMistakes((m) => m + 1)
  }
  const advance = () => {
    const n = round + 1
    setRound(n)
    setTried([])
    if (n >= step.rounds.length) onComplete({ firstTry: mistakes === 0 })
  }
  const lastWrong = tried.filter((t) => t !== r.answer).slice(-1)[0]

  if (finished) {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-ok/30 bg-ok-soft p-6 text-center">
          <Icon name="trophy" size={32} className="mx-auto text-ok" />
          <div className="mt-2 font-display text-xl font-bold">All {step.rounds.length} requests routed</div>
          {!done && <div className="text-sm text-muted">{firstTryCount}/{step.rounds.length} right first time</div>}
        </div>
        <div className="grid gap-2">
          {step.rounds.map((x) => {
            const c = step.choices.find((c) => c.id === x.answer)!
            return (
              <div key={x.id} className="flex items-center gap-3 rounded-xl border border-line bg-surface px-3 py-2 text-sm">
                <span className="flex-1">“{x.question}”</span>
                <span className="flex items-center gap-1.5 rounded-lg bg-accent-soft px-2 py-1 text-xs font-semibold text-accent">
                  <Icon name={c.icon} size={13} /> {c.label}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        {step.rounds.map((x, i) => (
          <span key={x.id} className={cn('h-1.5 flex-1 rounded-full', i < round ? 'bg-ok' : i === round ? 'bg-accent' : 'bg-surface-3')} />
        ))}
      </div>
      <div className="rounded-2xl border border-line bg-surface-2/60 p-5">
        <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-subtle">
          <Icon name="mail" size={14} /> Request {round + 1} of {step.rounds.length}
        </div>
        <p key={r.id} className="font-display text-xl font-semibold leading-snug animate-fade-up">“{r.question}”</p>
      </div>
      <p className="text-sm text-muted">{step.prompt}</p>
      <div className="grid gap-2 sm:grid-cols-3">
        {step.choices.map((c) => {
          const state = tried.includes(c.id) ? (c.id === r.answer ? 'correct' : 'wrong') : 'idle'
          return (
            <button
              key={c.id}
              onClick={() => choose(c.id)}
              disabled={solved && state === 'idle'}
              className={cn(
                'flex flex-col items-start gap-1 rounded-xl border p-3.5 text-left transition-all',
                state === 'idle' && 'border-line bg-surface hover:-translate-y-0.5 hover:border-accent/50',
                state === 'correct' && 'border-ok/60 bg-ok-soft',
                state === 'wrong' && 'border-bad/50 bg-bad-soft animate-shake',
                solved && state === 'idle' && 'opacity-50',
              )}
            >
              <Icon name={c.icon} size={20} className="text-accent" />
              <span className="text-sm font-bold">{c.label}</span>
              <span className="text-xs text-muted">{c.desc}</span>
            </button>
          )
        })}
      </div>
      {lastWrong && !solved && (
        <Feedback tone="bad" title="Not that one">
          {r.wrong?.[lastWrong] ?? `Look at the shape of the question: is it a count, a breakdown, or a rate?`}
        </Feedback>
      )}
      {solved && (
        <>
          <Feedback tone="ok" title={tried.length === 1 ? 'Correct!' : 'Got it'}>
            {r.why}
          </Feedback>
          <div className="flex justify-end">
            <Button onClick={advance} iconRight="arrow-right" data-autofocus>
              {round + 1 < step.rounds.length ? 'Next request' : 'Finish'}
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
