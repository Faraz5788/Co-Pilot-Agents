import { Link } from 'react-router-dom'
import { ACHIEVEMENTS } from '@/content/achievements'
import { LEVELS } from '@/content/course'
import { cn, fmt } from '@/lib/cn'
import { currentLevel, levelProgress, missionsCompleted, nextLesson, totalMissions, useProgress } from '@/state/progress'
import { Icon } from '@/components/ui/Icon'
import { ButtonLink, Card, IconTile, ProgressBar, SectionTitle } from '@/components/ui/primitives'
import { LevelStrip } from '@/components/learning/LevelMap'
import { Page } from '@/components/layout/Page'

function Stat({ icon, label, value, sub, tone = 'accent' }: { icon: string; label: string; value: string; sub?: string; tone?: 'accent' | 'cyan' | 'ok' | 'warn' | 'gold' }) {
  return (
    <Card className="flex items-center gap-3 p-4">
      <IconTile icon={icon} tone={tone} />
      <div className="min-w-0">
        <div className="truncate text-[11px] font-semibold uppercase tracking-wider text-subtle">{label}</div>
        <div className="font-display text-xl font-bold leading-tight">{value}</div>
        {sub && <div className="truncate text-[11px] text-muted">{sub}</div>}
      </div>
    </Card>
  )
}

export default function Home() {
  const s = useProgress()
  const level = currentLevel(s)
  const lp = levelProgress(s, level.id)
  const next = nextLesson(s)
  const started = s.xp > 0
  const earned = ACHIEVEMENTS.filter((a) => s.badges[a.id]).sort((a, b) => s.badges[b.id].localeCompare(s.badges[a.id]))
  const upcoming = ACHIEVEMENTS.filter((a) => !s.badges[a.id]).map((a) => ({ a, p: a.progress(s) })).sort((x, y) => y.p - x.p).slice(0, 3 - Math.min(3, earned.length))
  const allDone = LEVELS.every((l) => s.completedLevels[l.id])

  const suggestion = !s.counters.simulations
    ? { icon: 'play-circle', title: 'Run your first simulation', text: 'Open the Agent Playground, load the attrition template and watch a request travel through a multi-agent system.', to: '/playground', cta: 'Open Playground' }
    : !s.counters.faultsCaught
      ? { icon: 'bug', title: 'Break it on purpose', text: 'In the Playground, tick “Inject a fault”. Does your architecture catch a wrong headcount before it reaches leadership?', to: '/playground', cta: 'Try fault injection' }
      : { icon: 'gauge', title: 'Push your score to 90+', text: 'Use the Review tab in the Playground to score your design against six architecture principles.', to: '/playground', cta: 'Review my design' }

  return (
    <Page>
      {/* Hero */}
      <section className="relative mb-8 overflow-hidden rounded-3xl border border-line bg-surface p-6 shadow-card sm:p-8">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[radial-gradient(circle,var(--accent-soft),transparent_70%)]" />
        <div className="pointer-events-none absolute -bottom-32 right-40 h-72 w-72 rounded-full bg-[radial-gradient(circle,var(--accent-2-soft),transparent_70%)]" />
        <div className="relative grid gap-8 lg:grid-cols-[1.3fr_1fr] lg:items-center">
          <div>
            <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-accent">{started ? `Welcome back${s.learnerName ? `, ${s.learnerName}` : ''}` : 'Welcome to Agent Lab'}</div>
            <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-tight sm:text-[42px]">
              {started ? <>Ready to build <span className="text-gradient">smarter agents?</span></> : <>Learn to build AI systems <span className="text-gradient">by building them.</span></>}
            </h1>
            <p className="mt-3 max-w-lg text-[15px] text-muted">
              {started
                ? 'Pick up where you left off. Every mission trains an instinct you’ll use when designing real agent systems.'
                : 'Hands-on missions that take you from a single agent to governed multi-agent systems — with tools, skills, QA and human approval.'}
            </p>
          </div>
          <div className="rounded-2xl border border-line bg-surface-2/70 p-5">
            {next && !allDone ? (
              <>
                <div className="mb-1 text-[11px] font-bold uppercase tracking-wider text-subtle">{started ? 'Continue' : 'Start here'}</div>
                <div className="font-display text-lg font-semibold">Level {next.level.number} — {next.level.title}</div>
                <div className="mt-2 flex items-start gap-2 rounded-xl bg-surface px-3 py-2 text-sm">
                  <Icon name="rocket" size={16} className="mt-0.5 shrink-0 text-accent" />
                  <span><span className="font-semibold">Mission: </span>“{next.lesson.summary}”</span>
                </div>
                <ButtonLink to={`/level/${next.level.id}/lesson/${next.lesson.id}`} size="lg" iconRight="arrow-right" className="mt-4 w-full">
                  {started ? 'Continue mission' : 'Start your first mission'}
                </ButtonLink>
              </>
            ) : (
              <>
                <div className="mb-1 text-[11px] font-bold uppercase tracking-wider text-ok">Course complete</div>
                <div className="font-display text-lg font-semibold">You’re an Agent Architect.</div>
                <p className="mt-1 text-sm text-muted">Keep experimenting in the Playground.</p>
                <ButtonLink to="/playground" size="lg" iconRight="arrow-right" className="mt-4 w-full">Open Playground</ButtonLink>
              </>
            )}
          </div>
        </div>
        {/* Current level progress */}
        <div className="relative mt-6 border-t border-line pt-5">
          <div className="mb-2 flex items-center justify-between text-xs">
            <span className="font-display font-bold uppercase tracking-wider">Level {level.number} — {level.unlocks}</span>
            <span className="text-muted">{lp.done}/{lp.total} lessons</span>
          </div>
          <ProgressBar value={lp.ratio} label="Current level progress" className="h-2.5" />
        </div>
      </section>

      {/* Stats */}
      <section className="mb-10 grid grid-cols-2 gap-3 md:grid-cols-3 2xl:grid-cols-6" aria-label="Your stats">
        <Stat icon="map" label="Current level" value={`Level ${level.number}`} sub={level.title} />
        <Stat icon="zap" label="XP" value={fmt(s.xp)} tone="cyan" />
        <Stat icon="swords" label="Missions" value={`${missionsCompleted(s)}`} sub={`of ${totalMissions()} completed`} tone="ok" />
        <Stat icon="bot" label="Agents built" value={`${s.agents.length + s.architectures.length}`} sub="agents & systems" tone="cyan" />
        <Stat icon="sparkles" label="Skills unlocked" value={`${s.skills.length}`} tone="warn" />
        <Stat icon="flame" label="Streak" value={`${s.streak.count} day${s.streak.count === 1 ? '' : 's'}`} sub={`Best: ${s.streak.best}`} tone="gold" />
      </section>

      {/* Map */}
      <section className="mb-10">
        <SectionTitle eyebrow="Your journey" title="Learning map" action={<Link to="/path" className="text-sm font-semibold text-accent hover:underline">Full path →</Link>} />
        <Card className="p-5">
          <LevelStrip />
        </Card>
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Suggested */}
        <section className="lg:col-span-1">
          <SectionTitle eyebrow="Suggested" title="Next challenge" />
          <Card glow className="p-5">
            <IconTile icon={suggestion.icon} tone="cyan" />
            <h3 className="mt-3 font-display text-lg font-semibold">{suggestion.title}</h3>
            <p className="mt-1 text-sm text-muted">{suggestion.text}</p>
            <ButtonLink to={suggestion.to} variant="secondary" className="mt-4" iconRight="arrow-right">{suggestion.cta}</ButtonLink>
          </Card>
        </section>

        {/* Achievements */}
        <section>
          <SectionTitle eyebrow="Badges" title="Recent achievements" action={<Link to="/achievements" className="text-sm font-semibold text-accent hover:underline">All →</Link>} />
          <Card className="divide-y divide-line">
            {earned.slice(0, 3).map((a) => (
              <div key={a.id} className="flex items-center gap-3 p-3.5">
                <IconTile icon={a.icon} tone="gold" size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold">{a.name}</div>
                  <div className="truncate text-xs text-muted">{a.description}</div>
                </div>
                <Icon name="check-circle" size={16} className="text-ok" />
              </div>
            ))}
            {upcoming.map(({ a, p }) => (
              <div key={a.id} className="flex items-center gap-3 p-3.5">
                <IconTile icon={a.icon} tone="neutral" size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-muted">{a.name}</div>
                  <ProgressBar value={p} className="mt-1.5 h-1.5" label={`${a.name} progress`} />
                </div>
              </div>
            ))}
          </Card>
        </section>

        {/* Activity */}
        <section>
          <SectionTitle eyebrow="History" title="Recent XP" />
          <Card className="p-2">
            {s.activity.length === 0 ? (
              <div className="p-6 text-center text-sm text-muted">
                <Icon name="zap" size={22} className="mx-auto mb-2 text-accent" />
                XP you earn will appear here.
              </div>
            ) : (
              <ul>
                {s.activity.slice(0, 6).map((a) => (
                  <li key={a.id} className="flex items-center gap-3 rounded-xl px-2.5 py-2">
                    <Icon name={a.icon} size={15} className="text-accent" />
                    <span className="min-w-0 flex-1 truncate text-[13px]">{a.label}</span>
                    <span className={cn('font-mono text-xs font-bold text-accent')}>+{a.xp}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </section>
      </div>
    </Page>
  )
}
