import { Link } from 'react-router-dom'
import { LEVELS } from '@/content/course'
import type { Level } from '@/content/types'
import { cn } from '@/lib/cn'
import { isLevelUnlocked, levelProgress, useProgress, type ProgressData } from '@/state/progress'
import { Icon } from '@/components/ui/Icon'
import { ProgressBar } from '@/components/ui/primitives'

export type LevelState = 'done' | 'current' | 'open' | 'locked'

export function levelState(s: ProgressData, l: Level): LevelState {
  if (s.completedLevels[l.id]) return 'done'
  if (!isLevelUnlocked(s, l.id)) return 'locked'
  const firstOpen = LEVELS.find((x) => !s.completedLevels[x.id] && isLevelUnlocked(s, x.id))
  return firstOpen?.id === l.id ? 'current' : 'open'
}

function Medallion({ level, state, size = 'md' }: { level: Level; state: LevelState; size?: 'sm' | 'md' }) {
  const s = size === 'sm' ? 'h-12 w-12 rounded-2xl' : 'h-16 w-16 rounded-[20px]'
  return (
    <span
      className={cn(
        'relative flex shrink-0 items-center justify-center border-2 transition-all',
        s,
        state === 'done' && 'border-ok/60 bg-ok-soft text-ok',
        state === 'current' && 'border-transparent bg-gradient-brand text-white shadow-[0_8px_30px_-8px_var(--accent)] animate-pulse-ring',
        state === 'open' && 'border-accent/50 bg-accent-soft text-accent',
        state === 'locked' && 'border-line bg-surface-2 text-subtle',
      )}
    >
      <Icon name={state === 'locked' ? 'lock' : level.icon} size={size === 'sm' ? 20 : 26} />
      {state === 'done' && (
        <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-ok text-white ring-2 ring-[var(--bg)]">
          <Icon name="check" size={12} strokeWidth={3} />
        </span>
      )}
      <span className={cn('absolute -left-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-surface text-[10px] font-bold ring-1 ring-line', state === 'locked' ? 'text-subtle' : 'text-fg')}>
        {level.number}
      </span>
    </span>
  )
}

/** Compact horizontal map for the dashboard. */
export function LevelStrip() {
  const s = useProgress()
  return (
    <div className="-mx-1 overflow-x-auto px-1 pb-2 scrollbar-thin">
      <ol className="flex min-w-max items-start">
        {LEVELS.map((l, i) => {
          const st = levelState(s, l)
          return (
            <li key={l.id} className="flex items-start">
              <Link to={`/level/${l.id}`} className="group flex w-[92px] flex-col items-center gap-2 text-center">
                <Medallion level={l} state={st} size="sm" />
                <span className={cn('text-[10.5px] font-bold uppercase tracking-wider', st === 'locked' ? 'text-subtle' : 'text-fg')}>{l.pathLabel}</span>
              </Link>
              {i < LEVELS.length - 1 && (
                <span className={cn('mt-6 h-0.5 w-6 rounded-full', s.completedLevels[l.id] ? 'bg-ok' : 'bg-line-strong')} aria-hidden />
              )}
            </li>
          )
        })}
      </ol>
    </div>
  )
}

/** Full vertical learning path. */
export function LevelPath() {
  const s = useProgress()
  return (
    <ol className="relative space-y-4">
      <span className="absolute bottom-8 left-[31px] top-8 w-0.5 bg-gradient-to-b from-[var(--accent)] via-[var(--line-strong)] to-transparent sm:left-[39px]" aria-hidden />
      {LEVELS.map((l) => {
        const st = levelState(s, l)
        const p = levelProgress(s, l.id)
        return (
          <li key={l.id} className="relative">
            <Link
              to={`/level/${l.id}`}
              className={cn(
                'group flex items-center gap-4 rounded-2xl border p-3 transition-all sm:gap-5 sm:p-4',
                st === 'current' ? 'border-accent/40 bg-surface shadow-card' : 'border-transparent hover:border-line hover:bg-surface/70',
                st === 'locked' && 'opacity-70',
              )}
            >
              <span className="relative z-10 sm:p-1"><Medallion level={l} state={st} /></span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10.5px] font-bold uppercase tracking-[0.16em] text-subtle">{l.pathLabel}</span>
                  {st === 'current' && <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[10px] font-bold uppercase text-accent">You are here</span>}
                  {st === 'done' && <span className="rounded-full bg-ok-soft px-2 py-0.5 text-[10px] font-bold uppercase text-ok">Complete</span>}
                </div>
                <div className="font-display text-lg font-semibold leading-tight">Level {l.number} — {l.title}</div>
                <div className="truncate text-[13px] text-muted">{l.theme}</div>
                {st !== 'locked' && (
                  <div className="mt-2 flex items-center gap-2">
                    <ProgressBar value={p.ratio} tone={st === 'done' ? 'ok' : 'brand'} className="max-w-[220px]" label={`${l.title} progress`} />
                    <span className="text-[11px] text-subtle">{p.done}/{p.total}</span>
                  </div>
                )}
                {st === 'locked' && <div className="mt-1 flex items-center gap-1 text-[11.5px] text-subtle"><Icon name="lock" size={11} /> Complete Level {l.number - 1} to unlock</div>}
              </div>
              <div className="hidden text-right md:block">
                <div className="text-[10.5px] font-semibold uppercase tracking-wider text-subtle">Unlocks</div>
                <div className="text-[13px] font-semibold">{l.unlocks}</div>
              </div>
              <Icon name="chevron-right" size={18} className="shrink-0 text-subtle transition-transform group-hover:translate-x-0.5" />
            </Link>
          </li>
        )
      })}
    </ol>
  )
}
