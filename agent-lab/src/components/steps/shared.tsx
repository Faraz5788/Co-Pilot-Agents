import { useMemo, type ReactNode } from 'react'
import type { MissionBrief as Brief, LearnMore, Step } from '@/content/types'
import { cn } from '@/lib/cn'
import { Icon } from '@/components/ui/Icon'

export interface StepProps<S extends Step = Step> {
  step: S
  lessonId: string
  done: boolean
  onComplete: (opts?: { firstTry?: boolean }) => void
}

export function shuffle<T>(arr: T[], seed = 7): T[] {
  const a = [...arr]
  let s = seed
  const rand = () => ((s = (s * 9301 + 49297) % 233280) / 233280)
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  // Guarantee the result is not already in order.
  if (a.length > 1 && a.every((x, i) => x === arr[i])) a.push(a.shift()!)
  return a
}

export function useShuffled<T>(arr: T[], key: string) {
  return useMemo(() => shuffle(arr, [...key].reduce((a, c) => a + c.charCodeAt(0), 0)), [arr, key])
}

export function MissionBrief({ brief }: { brief: Brief }) {
  const rows: { k: string; icon: string; v: ReactNode }[] = [
    { k: 'Mission', icon: 'rocket', v: brief.mission },
    { k: 'Objective', icon: 'target', v: brief.objective },
    ...(brief.components ? [{ k: 'Available components', icon: 'layers', v: brief.components.join(' · ') }] : []),
    { k: 'Success condition', icon: 'check-circle', v: brief.success },
  ]
  return (
    <div className="mb-5 grid gap-px overflow-hidden rounded-2xl border border-accent/25 bg-accent/15 sm:grid-cols-2">
      {rows.map((r) => (
        <div key={r.k} className="bg-surface p-3.5">
          <div className="mb-1 flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-[0.14em] text-accent">
            <Icon name={r.icon} size={13} /> {r.k}
          </div>
          <div className="text-sm leading-snug text-fg">{r.v}</div>
        </div>
      ))}
    </div>
  )
}

export function Feedback({ tone, title, children, className }: { tone: 'ok' | 'bad' | 'info' | 'warn'; title: string; children?: ReactNode; className?: string }) {
  const map = {
    ok: { c: 'border-ok/35 bg-ok-soft', i: 'check-circle', t: 'text-ok' },
    bad: { c: 'border-bad/35 bg-bad-soft', i: 'x-circle', t: 'text-bad' },
    warn: { c: 'border-warn/35 bg-warn-soft', i: 'alert-triangle', t: 'text-warn' },
    info: { c: 'border-accent-2/35 bg-accent-2-soft', i: 'lightbulb', t: 'text-accent-2' },
  }[tone]
  return (
    <div className={cn('flex gap-3 rounded-xl border p-3.5 animate-fade-up', map.c, className)} role="status">
      <Icon name={map.i} size={18} className={cn('mt-0.5 shrink-0', map.t)} />
      <div className="text-sm">
        <div className={cn('font-bold', map.t)}>{title}</div>
        {children && <div className="mt-0.5 text-fg/90">{children}</div>}
      </div>
    </div>
  )
}

export function LearnMoreLink({ link }: { link: LearnMore }) {
  return (
    <a
      href={link.href}
      target="_blank"
      rel="noreferrer"
      className="group inline-flex items-center gap-2 rounded-xl border border-line bg-surface-2 px-3 py-2 text-sm transition-colors hover:border-accent/40"
    >
      <Icon name="book-open" size={16} className="text-accent" />
      <span>
        <span className="block text-[10.5px] font-semibold uppercase tracking-wider text-subtle">Learn more · Copilot Learning Hub</span>
        <span className="font-medium">{link.label}</span>
      </span>
      <Icon name="external-link" size={14} className="text-subtle group-hover:text-accent" />
    </a>
  )
}

export function OptionButton({ state, onClick, children, disabled, className }: { state: 'idle' | 'correct' | 'wrong' | 'selected'; onClick: () => void; children: ReactNode; disabled?: boolean; className?: string }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'w-full rounded-xl border px-4 py-3 text-left text-sm transition-all duration-150',
        state === 'idle' && 'border-line bg-surface hover:-translate-y-px hover:border-accent/50 hover:bg-surface-2',
        state === 'selected' && 'border-accent bg-accent-soft',
        state === 'correct' && 'border-ok/60 bg-ok-soft',
        state === 'wrong' && 'border-bad/50 bg-bad-soft opacity-80 animate-shake',
        disabled && state === 'idle' && 'opacity-50',
        className,
      )}
    >
      {children}
    </button>
  )
}
