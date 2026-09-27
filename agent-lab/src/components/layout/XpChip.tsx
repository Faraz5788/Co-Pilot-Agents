import { Link } from 'react-router-dom'
import { rankFor } from '@/content/xp'
import { cn, fmt } from '@/lib/cn'
import { useProgress } from '@/state/progress'
import { Icon } from '@/components/ui/Icon'
import { ProgressBar } from '@/components/ui/primitives'

export function XpChip({ compact }: { compact?: boolean }) {
  const xp = useProgress((s) => s.xp)
  const streak = useProgress((s) => s.streak.count)
  const rank = rankFor(xp)
  if (compact) {
    return (
      <Link to="/achievements" className="flex items-center gap-2 rounded-full border border-line bg-surface-2 px-2.5 py-1 text-xs font-bold">
        <span className="flex items-center gap-1 text-accent"><Icon name="zap" size={13} />{fmt(xp)}</span>
        <span className={cn('flex items-center gap-1', streak ? 'text-warn' : 'text-subtle')}><Icon name="flame" size={13} />{streak}</span>
      </Link>
    )
  }
  return (
    <Link to="/achievements" className="block rounded-2xl border border-line bg-surface-2/70 p-3 transition-colors hover:border-line-strong">
      <div className="mb-2 flex items-center justify-between text-xs">
        <span className="font-semibold text-muted">{rank.title}</span>
        <span className={cn('flex items-center gap-1 font-bold', streak ? 'text-warn' : 'text-subtle')} title="Learning streak (days)">
          <Icon name="flame" size={14} /> {streak}
        </span>
      </div>
      <div className="mb-2 flex items-baseline gap-1.5">
        <Icon name="zap" size={16} className="self-center text-accent" />
        <span className="font-display text-xl font-bold">{fmt(xp)}</span>
        <span className="text-xs text-subtle">XP</span>
      </div>
      <ProgressBar value={rank.progress} label="Progress to next rank" />
      {rank.next && <div className="mt-1.5 text-[11px] text-subtle">{fmt(rank.next.xp - xp)} XP to {rank.next.title}</div>}
    </Link>
  )
}
