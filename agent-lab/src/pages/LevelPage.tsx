import { Link, Navigate, useParams } from 'react-router-dom'
import { LEVELS, getLevel, stepKey } from '@/content/course'
import { getAchievement } from '@/content/achievements'
import { isChallenge } from '@/content/xp'
import { cn } from '@/lib/cn'
import { isLessonUnlocked, isLevelUnlocked, levelProgress, useProgress } from '@/state/progress'
import { Icon } from '@/components/ui/Icon'
import { ButtonLink, Card, IconTile, ProgressBar } from '@/components/ui/primitives'
import { LearnMoreLink } from '@/components/steps/shared'
import { PHASE_META } from '@/components/steps/registry'
import { Page } from '@/components/layout/Page'

export default function LevelPage() {
  const { levelId = '' } = useParams()
  const s = useProgress()
  const level = getLevel(levelId)
  if (!level) return <Navigate to="/path" replace />
  const unlocked = isLevelUnlocked(s, level.id)
  const prev = LEVELS[LEVELS.indexOf(level) - 1]
  const p = levelProgress(s, level.id)
  const badge = getAchievement(level.badgeId)
  const firstOpen = level.lessons.find((l) => !s.completedLessons[l.id])

  return (
    <Page>
      <Link to="/path" className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-fg">
        <Icon name="arrow-left" size={15} /> Learning path
      </Link>

      <section className="relative mb-8 overflow-hidden rounded-3xl border border-line bg-surface p-6 shadow-card sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-[radial-gradient(circle,var(--accent-soft),transparent_70%)]" />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-center">
          <span className={cn('flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl', unlocked ? 'bg-gradient-brand text-white shadow-[0_10px_40px_-12px_var(--accent)]' : 'border-2 border-line bg-surface-2 text-subtle')}>
            <Icon name={unlocked ? level.icon : 'lock'} size={36} />
          </span>
          <div className="flex-1">
            <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-accent">Level {level.number} · {level.pathLabel}</div>
            <h1 className="mt-1 font-display text-3xl font-bold tracking-tight sm:text-4xl">{level.title}</h1>
            <p className="mt-1 font-display text-lg text-fg/85">“{level.theme}”</p>
            <p className="mt-2 max-w-2xl text-[15px] text-muted">{level.description}</p>
          </div>
          <div className="flex shrink-0 flex-col gap-3 md:w-56">
            <div className="rounded-2xl border border-line bg-surface-2/70 p-3">
              <div className="text-[10.5px] font-bold uppercase tracking-wider text-subtle">Completion unlocks</div>
              <div className="mt-0.5 flex items-center gap-2 font-semibold"><Icon name="unlock" size={15} className="text-accent" /> {level.unlocks}</div>
              {badge && <div className="mt-1 flex items-center gap-2 text-sm text-muted"><Icon name={badge.icon} size={15} className="text-gold" /> Badge: {badge.name}</div>}
            </div>
            {unlocked && (
              <div>
                <div className="mb-1 flex justify-between text-xs text-muted"><span>Progress</span><span>{p.done}/{p.total}</span></div>
                <ProgressBar value={p.ratio} tone={p.ratio === 1 ? 'ok' : 'brand'} label="Level progress" />
              </div>
            )}
          </div>
        </div>
        <div className="relative mt-6 flex flex-wrap gap-2">
          {level.concepts.map((c) => (
            <span key={c} className="rounded-full border border-line bg-surface-2 px-3 py-1 text-[12.5px] font-medium">{c}</span>
          ))}
        </div>
      </section>

      {!unlocked && (
        <Card className="mb-8 flex flex-col items-start gap-4 border-dashed p-6 sm:flex-row sm:items-center">
          <IconTile icon="lock" tone="neutral" size="lg" />
          <div className="flex-1">
            <h2 className="font-display text-lg font-semibold">This level is locked</h2>
            <p className="text-sm text-muted">Complete Level {prev?.number} — {prev?.title} to unlock it. Here’s a preview of what you’ll do.</p>
          </div>
          {prev && <ButtonLink to={`/level/${prev.id}`} iconRight="arrow-right">Go to Level {prev.number}</ButtonLink>}
        </Card>
      )}

      <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
        <section>
          <h2 className="mb-4 font-display text-lg font-semibold">Lessons</h2>
          <ol className="space-y-3">
            {level.lessons.map((lesson, i) => {
              const done = !!s.completedLessons[lesson.id]
              const open = isLessonUnlocked(s, level.id, lesson.id)
              const challenges = lesson.steps.filter(isChallenge)
              const doneCh = challenges.filter((st) => s.completedSteps[stepKey(lesson.id, st.id)]).length
              const phases = Array.from(new Set(lesson.steps.map((st) => st.phase)))
              const inner = (
                <>
                  <span className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-bold', done ? 'bg-ok text-white' : open ? 'bg-accent-soft text-accent' : 'bg-surface-2 text-subtle')}>
                    {done ? <Icon name="check" size={18} strokeWidth={3} /> : open ? i + 1 : <Icon name="lock" size={16} />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="font-display text-[16px] font-semibold">{lesson.title}</div>
                    <div className="text-[13px] text-muted">{lesson.summary}</div>
                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11.5px] text-subtle">
                      <span className="flex items-center gap-1"><Icon name="clock" size={12} /> {lesson.minutes} min</span>
                      <span className="flex items-center gap-1"><Icon name="swords" size={12} /> {doneCh}/{challenges.length} challenges</span>
                      <span className="flex items-center gap-1.5">
                        {phases.map((ph) => <Icon key={ph} name={PHASE_META[ph].icon} size={12} className={PHASE_META[ph].tone} aria-label={PHASE_META[ph].label} />)}
                      </span>
                    </div>
                  </div>
                  {open && <span className="hidden text-sm font-semibold text-accent sm:block">{done ? 'Review' : lesson.id === firstOpen?.id ? 'Start' : 'Open'}</span>}
                  {open && <Icon name="chevron-right" size={18} className="text-subtle" />}
                </>
              )
              return (
                <li key={lesson.id}>
                  {open ? (
                    <Link to={`/level/${level.id}/lesson/${lesson.id}`} className={cn('flex items-center gap-4 rounded-2xl border bg-surface p-4 transition-all hover:-translate-y-0.5 hover:border-line-strong hover:shadow-card', lesson.id === firstOpen?.id && unlocked ? 'border-accent/40' : 'border-line')}>
                      {inner}
                    </Link>
                  ) : (
                    <div className="flex items-center gap-4 rounded-2xl border border-line bg-surface/60 p-4 opacity-70" aria-disabled>{inner}</div>
                  )}
                </li>
              )
            })}
          </ol>
        </section>
        <aside className="space-y-4">
          {level.learnMore && level.learnMore.length > 0 && (
            <div>
              <h2 className="mb-3 font-display text-sm font-semibold uppercase tracking-wider text-subtle">Go deeper</h2>
              <div className="flex flex-col gap-2">{level.learnMore.map((l) => <LearnMoreLink key={l.href} link={l} />)}</div>
            </div>
          )}
        </aside>
      </div>
    </Page>
  )
}
