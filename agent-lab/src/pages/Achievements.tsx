import { ACHIEVEMENTS } from '@/content/achievements'
import { XP, rankFor, RANKS } from '@/content/xp'
import { cn, fmt } from '@/lib/cn'
import { useProgress } from '@/state/progress'
import { Icon } from '@/components/ui/Icon'
import { Card, ProgressBar, SectionTitle } from '@/components/ui/primitives'
import { Page, PageHeader } from '@/components/layout/Page'

const TIER = {
  bronze: 'from-amber-700/30 to-amber-500/10 text-amber-600 dark:text-amber-400',
  silver: 'from-slate-400/30 to-slate-300/10 text-slate-500 dark:text-slate-300',
  gold: 'from-yellow-400/35 to-amber-300/10 text-yellow-600 dark:text-yellow-300',
}

export default function Achievements() {
  const s = useProgress()
  const rank = rankFor(s.xp)
  const earned = ACHIEVEMENTS.filter((a) => s.badges[a.id]).length
  return (
    <Page>
      <PageHeader eyebrow="Achievements" title="Your trophy cabinet" subtitle="Badges mark the instincts you’ve built — not just the lessons you’ve clicked through." />

      <div className="mb-10 grid gap-4 md:grid-cols-3">
        <Card glow className="p-5 md:col-span-2">
          <div className="flex items-center gap-4">
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-brand text-white"><Icon name="medal" size={30} /></span>
            <div className="flex-1">
              <div className="text-[11px] font-bold uppercase tracking-wider text-subtle">Rank</div>
              <div className="font-display text-2xl font-bold">{rank.title}</div>
              <div className="text-sm text-muted">{fmt(s.xp)} XP{rank.next ? ` · ${fmt(rank.next.xp - s.xp)} to ${rank.next.title}` : ' · top rank'}</div>
            </div>
          </div>
          <ProgressBar value={rank.progress} className="mt-4 h-2.5" label="Rank progress" />
          <div className="mt-3 flex flex-wrap gap-2">
            {RANKS.map((r) => (
              <span key={r.title} className={cn('rounded-full border px-2.5 py-0.5 text-[11px] font-semibold', s.xp >= r.xp ? 'border-accent/40 bg-accent-soft text-fg' : 'border-line text-subtle')}>{r.title}</span>
            ))}
          </div>
        </Card>
        <Card className="p-5">
          <div className="text-[11px] font-bold uppercase tracking-wider text-subtle">How XP works</div>
          <ul className="mt-2 space-y-1.5 text-[13px]">
            {[['Complete a lesson', XP.lesson], ['Correct challenge', XP.challenge], ['Build exercise', XP.build], ['Fix a broken agent', XP.fix], ['Complete a level', XP.level]].map(([l, x]) => (
              <li key={l as string} className="flex justify-between"><span className="text-muted">{l}</span><span className="font-mono font-bold text-accent">+{x}</span></li>
            ))}
          </ul>
          <div className="mt-3 flex items-center gap-2 rounded-xl bg-warn-soft px-3 py-2 text-[13px]"><Icon name="flame" size={16} className="text-warn" /> <span><span className="font-bold">{s.streak.count}-day streak</span> · best {s.streak.best}</span></div>
        </Card>
      </div>

      <SectionTitle eyebrow={`${earned}/${ACHIEVEMENTS.length} earned`} title="Badges" />
      <div className="mb-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {ACHIEVEMENTS.map((a) => {
          const got = s.badges[a.id]
          const p = a.progress(s)
          return (
            <Card key={a.id} className={cn('flex flex-col items-center p-4 text-center transition-all', got ? 'hover:-translate-y-0.5' : 'opacity-75')}>
              <span className={cn('mb-3 flex h-16 w-16 items-center justify-center rounded-full border bg-gradient-to-br', got ? cn('border-transparent', TIER[a.tier]) : 'border-dashed border-line-strong text-subtle')}>
                <Icon name={got ? a.icon : 'lock'} size={28} />
              </span>
              <div className="font-display text-[15px] font-semibold">{a.name}</div>
              <div className="mt-1 text-[12px] text-muted">{a.description}</div>
              <div className="mt-auto w-full pt-3">
                {got ? (
                  <div className="text-[11px] font-semibold text-ok">Earned {new Date(got).toLocaleDateString()}</div>
                ) : (
                  <ProgressBar value={p} className="h-1.5" label={`${a.name} progress`} />
                )}
              </div>
            </Card>
          )
        })}
      </div>

      <SectionTitle eyebrow="History" title="XP log" />
      <Card className="p-2">
        {s.activity.length === 0 ? (
          <p className="p-6 text-center text-sm text-muted">Nothing yet — complete your first challenge to start the log.</p>
        ) : (
          <ul className="divide-y divide-line">
            {s.activity.map((a) => (
              <li key={a.id} className="flex items-center gap-3 px-3 py-2.5">
                <Icon name={a.icon} size={16} className="text-accent" />
                <span className="min-w-0 flex-1 truncate text-sm">{a.label}</span>
                <span className="hidden text-xs text-subtle sm:inline">{new Date(a.at).toLocaleString()}</span>
                <span className="font-mono text-sm font-bold text-accent">+{a.xp}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </Page>
  )
}
