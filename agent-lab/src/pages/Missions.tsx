import { useState } from 'react'
import { Link } from 'react-router-dom'
import { LEVELS, stepKey } from '@/content/course'
import { isChallenge, stepXp } from '@/content/xp'
import { cn } from '@/lib/cn'
import { isLessonUnlocked, missionsCompleted, totalMissions, useProgress } from '@/state/progress'
import { Icon } from '@/components/ui/Icon'
import { Card, ProgressBar } from '@/components/ui/primitives'
import { PHASE_META } from '@/components/steps/registry'
import { Page, PageHeader } from '@/components/layout/Page'

type Filter = 'all' | 'todo' | 'done'

const KIND_LABEL: Record<string, string> = {
  quiz: 'Decision', sort: 'Sort', sequence: 'Sequence', match: 'Routing', 'agent-builder': 'Build', 'agent-run': 'Stress test',
  'skill-builder': 'Build', 'break-fix': 'Break & fix', architecture: 'Architecture',
}

export default function Missions() {
  const s = useProgress()
  const [filter, setFilter] = useState<Filter>('all')
  const done = missionsCompleted(s)
  const total = totalMissions()

  return (
    <Page>
      <PageHeader
        eyebrow="Missions"
        title="Every challenge in one place"
        subtitle="Decisions, builds, stress tests and broken workflows. Jump straight into any mission you’ve unlocked."
        action={
          <Card className="w-full p-4 sm:w-64">
            <div className="mb-1 flex justify-between text-xs text-muted"><span>Completed</span><span className="font-semibold text-fg">{done}/{total}</span></div>
            <ProgressBar value={done / total} label="Missions completed" />
          </Card>
        }
      />
      <div className="mb-6 flex gap-1 rounded-xl border border-line bg-surface p-1 sm:w-fit" role="tablist">
        {(['all', 'todo', 'done'] as Filter[]).map((f) => (
          <button key={f} role="tab" aria-selected={filter === f} onClick={() => setFilter(f)} className={cn('flex-1 rounded-lg px-4 py-1.5 text-sm font-semibold transition-colors sm:flex-none', filter === f ? 'bg-accent-soft text-fg' : 'text-muted hover:text-fg')}>
            {{ all: 'All', todo: 'To do', done: 'Completed' }[f]}
          </button>
        ))}
      </div>

      <div className="space-y-10">
        {LEVELS.map((level) => {
          const items = level.lessons.flatMap((lesson) =>
            lesson.steps.map((step, idx) => ({ lesson, step, idx })).filter(({ step }) => isChallenge(step)),
          ).filter(({ lesson, step }) => {
            const d = !!s.completedSteps[stepKey(lesson.id, step.id)]
            return filter === 'all' || (filter === 'done' ? d : !d)
          })
          if (!items.length) return null
          return (
            <section key={level.id}>
              <h2 className="mb-3 flex items-center gap-2 font-display text-lg font-semibold">
                <Icon name={level.icon} size={18} className="text-accent" /> Level {level.number} — {level.title}
              </h2>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {items.map(({ lesson, step, idx }) => {
                  const d = !!s.completedSteps[stepKey(lesson.id, step.id)]
                  const open = isLessonUnlocked(s, level.id, lesson.id)
                  const body = (
                    <>
                      <div className="mb-2 flex items-center gap-2">
                        <span className={cn('inline-flex items-center gap-1 text-[10.5px] font-bold uppercase tracking-wider', PHASE_META[step.phase].tone)}>
                          <Icon name={PHASE_META[step.phase].icon} size={12} /> {KIND_LABEL[step.kind] ?? step.kind}
                        </span>
                        <span className={cn('ml-auto inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-bold', d ? 'bg-ok-soft text-ok' : open ? 'bg-accent-soft text-accent' : 'bg-surface-2 text-subtle')}>
                          <Icon name={d ? 'check' : open ? 'zap' : 'lock'} size={11} /> {d ? 'Done' : `${stepXp(step)} XP`}
                        </span>
                      </div>
                      <div className="font-display text-[15px] font-semibold">{step.title}</div>
                      <p className="mt-1 line-clamp-2 text-[12.5px] text-muted">{step.mission?.mission ?? ('question' in step ? step.question : lesson.summary)}</p>
                      <div className="mt-3 text-[11px] text-subtle">{lesson.title}</div>
                    </>
                  )
                  return open ? (
                    <Link key={`${lesson.id}-${step.id}`} to={`/level/${level.id}/lesson/${lesson.id}?step=${idx}`} className="rounded-2xl border border-line bg-surface p-4 transition-all hover:-translate-y-0.5 hover:border-line-strong hover:shadow-card">
                      {body}
                    </Link>
                  ) : (
                    <div key={`${lesson.id}-${step.id}`} className="rounded-2xl border border-line bg-surface/50 p-4 opacity-60">{body}</div>
                  )
                })}
              </div>
            </section>
          )
        })}
      </div>
    </Page>
  )
}
