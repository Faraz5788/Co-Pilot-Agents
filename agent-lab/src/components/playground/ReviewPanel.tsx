import type { Review } from '@/engine/evaluate'
import { cn } from '@/lib/cn'
import { Icon } from '@/components/ui/Icon'

export function ScoreRing({ value, size = 64 }: { value: number; size?: number }) {
  const r = size / 2 - 5
  const c = 2 * Math.PI * r
  const color = value >= 70 ? 'var(--ok)' : value >= 45 ? 'var(--warn)' : 'var(--bad)'
  return (
    <svg width={size} height={size} className="shrink-0 -rotate-90" role="img" aria-label={`Score ${value} out of 100`}>
      <circle cx={size / 2} cy={size / 2} r={r} stroke="var(--surface-3)" strokeWidth={6} fill="none" />
      <circle cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={6} fill="none" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - value / 100)} className="transition-[stroke-dashoffset] duration-700" />
      <text x="50%" y="50%" dominantBaseline="central" textAnchor="middle" className="rotate-90 fill-[var(--fg)] font-display text-[15px] font-bold" style={{ transformOrigin: 'center' }}>{value}</text>
    </svg>
  )
}

export function ReviewPanel({ review, compact }: { review: Review; compact?: boolean }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <ScoreRing value={review.overall} />
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-subtle">Architecture score</div>
          <p className="text-[13px] font-medium">{review.headline}</p>
        </div>
      </div>
      <div className="space-y-2">
        {review.dimensions.map((d) => (
          <details key={d.id} className="group rounded-xl border border-line bg-surface" open={!compact && d.score < 70}>
            <summary className="flex cursor-pointer list-none items-center gap-2 px-3 py-2">
              <Icon name={d.icon} size={15} className="text-accent" />
              <span className="flex-1 text-[12.5px] font-semibold">{d.label}</span>
              <span className="h-1.5 w-16 overflow-hidden rounded-full bg-surface-3">
                <span className={cn('block h-full rounded-full', d.score >= 70 ? 'bg-ok' : d.score >= 45 ? 'bg-warn' : 'bg-bad')} style={{ width: `${d.score}%` }} />
              </span>
              <span className="w-7 text-right font-mono text-[11px] text-muted">{d.score}</span>
              <Icon name="chevron-down" size={14} className="text-subtle transition-transform group-open:rotate-180" />
            </summary>
            <ul className="space-y-1 border-t border-line px-3 py-2">
              {d.findings.map((f, i) => (
                <li key={i} className="flex items-start gap-1.5 text-[12px]">
                  <Icon name={f.tone === 'good' ? 'check' : f.tone === 'tip' ? 'lightbulb' : 'alert-triangle'} size={13} className={cn('mt-0.5 shrink-0', f.tone === 'good' ? 'text-ok' : f.tone === 'tip' ? 'text-accent-2' : 'text-warn')} />
                  <span>{f.text}</span>
                </li>
              ))}
            </ul>
          </details>
        ))}
      </div>
    </div>
  )
}
