import { useCallback, useEffect, useState, type ComponentType } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { LEVELS, stepKey } from '@/content/course'
import type { Lesson, Level, Step } from '@/content/types'
import { XP, isChallenge, stepXp } from '@/content/xp'
import { cn } from '@/lib/cn'
import { isLessonUnlocked, useProgress } from '@/state/progress'
import { useUi } from '@/state/ui'
import { Icon } from '@/components/ui/Icon'
import { Button, ButtonLink, ProgressBar } from '@/components/ui/primitives'
import { PHASE_META, STEP_COMPONENTS } from '@/components/steps/registry'
import { MissionBrief } from '@/components/steps/shared'
import type { StepProps } from '@/components/steps/shared'

function StepBody({ step, lessonId, done, onComplete }: { step: Step; lessonId: string; done: boolean; onComplete: StepProps['onComplete'] }) {
  const C = STEP_COMPONENTS[step.kind] as ComponentType<StepProps>
  return <C step={step} lessonId={lessonId} done={done} onComplete={onComplete} />
}

export function LessonPlayer({ level, lesson }: { level: Level; lesson: Lesson }) {
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const completedSteps = useProgress((s) => s.completedSteps)
  const completeStep = useProgress((s) => s.completeStep)
  const completeLesson = useProgress((s) => s.completeLesson)
  const [finished, setFinished] = useState<null | 'first' | 'again'>(null)

  const initial = Math.min(Math.max(0, Number(params.get('step') ?? 0) || 0), lesson.steps.length - 1)
  const [index, setIndex] = useState(initial)
  const [justCompleted, setJustCompleted] = useState<Set<string>>(new Set())
  const step = lesson.steps[index]
  const key = stepKey(lesson.id, step.id)
  const stepDone = !!completedSteps[key] || justCompleted.has(step.id)
  const canContinue = !isChallenge(step) || stepDone
  const wide = step.kind === 'architecture' || step.kind === 'agent-builder' || step.kind === 'agent-run'

  useEffect(() => {
    setParams(index ? { step: String(index) } : {}, { replace: true })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [index, setParams])

  const onComplete = useCallback(
    ({ firstTry }: { firstTry?: boolean } = {}) => {
      setJustCompleted((s) => new Set(s).add(step.id))
      completeStep(lesson.id, step.id, stepXp(step), step.title, firstTry)
    },
    [completeStep, lesson.id, step],
  )

  const next = () => {
    if (!isChallenge(step)) completeStep(lesson.id, step.id, 0, step.title)
    if (index + 1 < lesson.steps.length) setIndex(index + 1)
    else {
      const done = useProgress.getState().completedSteps
      const missing = lesson.steps.findIndex((s) => isChallenge(s) && !done[stepKey(lesson.id, s.id)] && !justCompleted.has(s.id))
      if (missing >= 0) {
        useUi.getState().pushToast({ kind: 'info', title: 'One more challenge', detail: `Complete “${lesson.steps[missing].title}” to finish the lesson.`, icon: 'target' })
        setIndex(missing)
        return
      }
      const first = !useProgress.getState().completedLessons[lesson.id]
      completeLesson(lesson.id)
      setFinished(first ? 'first' : 'again')
    }
  }

  const levelIdx = LEVELS.indexOf(level)
  const lessonIdx = level.lessons.indexOf(lesson)
  const nextLesson = level.lessons[lessonIdx + 1]
  const nextLevel = LEVELS[levelIdx + 1]
  const challenges = lesson.steps.filter(isChallenge)

  if (finished) {
    const canNext = nextLesson && isLessonUnlocked(useProgress.getState(), level.id, nextLesson.id)
    return (
      <div className="mx-auto max-w-xl px-4 py-12 text-center animate-fade-up">
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-brand text-white shadow-[0_10px_40px_-10px_var(--accent)] animate-pop">
          <Icon name="book-check" size={36} />
        </div>
        <div className="text-xs font-bold uppercase tracking-[0.18em] text-accent">Lesson complete</div>
        <h1 className="mt-1 font-display text-3xl font-bold">{lesson.title}</h1>
        <p className="mt-2 text-muted">
          {finished === 'first' ? (
            <>You earned the <span className="font-semibold text-fg">+{XP.lesson} XP</span> lesson bonus{challenges.length ? <> and completed {challenges.length} challenge{challenges.length > 1 ? 's' : ''}</> : null}.</>
          ) : (
            'Lesson reviewed. XP is awarded the first time — but practice still sharpens the instinct.'
          )}
        </p>
        <div className="mx-auto mt-5 flex max-w-sm flex-wrap justify-center gap-1.5">
          {lesson.steps.map((s) => (
            <span key={s.id} className={cn('inline-flex items-center gap-1 rounded-full border border-line bg-surface px-2 py-1 text-[11px] font-semibold', PHASE_META[s.phase].tone)}>
              <Icon name={PHASE_META[s.phase].icon} size={11} /> {PHASE_META[s.phase].label}
            </span>
          ))}
        </div>
        <div className="mt-8 flex flex-col justify-center gap-2 sm:flex-row">
          {canNext ? (
            <Button size="lg" iconRight="arrow-right" onClick={() => navigate(`/level/${level.id}/lesson/${nextLesson.id}`)}>Next: {nextLesson.title}</Button>
          ) : nextLevel && useProgress.getState().completedLevels[level.id] ? (
            <ButtonLink size="lg" iconRight="arrow-right" to={`/level/${nextLevel.id}`}>Go to Level {nextLevel.number}</ButtonLink>
          ) : null}
          <ButtonLink size="lg" variant="secondary" to={`/level/${level.id}`}>Back to level</ButtonLink>
        </div>
      </div>
    )
  }

  const phase = PHASE_META[step.phase]

  return (
    <div className={cn('mx-auto px-4 pb-16 pt-5 sm:px-6 lg:pt-8', wide ? 'max-w-[1400px]' : 'max-w-4xl')}>
      {/* Header */}
      <div className="mb-5 flex items-center gap-3">
        <Link to={`/level/${level.id}`} className="rounded-xl border border-line bg-surface p-2 text-muted hover:text-fg" aria-label="Exit lesson">
          <Icon name="x" size={18} />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="truncate text-xs font-semibold text-subtle">Level {level.number} · {level.title} · {lesson.title}</div>
          <div className="mt-1.5 flex gap-1" aria-label={`Step ${index + 1} of ${lesson.steps.length}`}>
            {lesson.steps.map((s, i) => {
              const d = !!completedSteps[stepKey(lesson.id, s.id)] || justCompleted.has(s.id)
              return (
                <button
                  key={s.id}
                  onClick={() => (d || i <= index ? setIndex(i) : undefined)}
                  className={cn('h-1.5 flex-1 rounded-full transition-colors', i === index ? 'bg-gradient-brand' : d ? 'bg-ok' : 'bg-surface-3', (d || i < index) && 'cursor-pointer')}
                  aria-label={`Step ${i + 1}: ${s.title}`}
                  disabled={!(d || i <= index)}
                />
              )
            })}
          </div>
        </div>
      </div>

      {/* Step */}
      <div key={step.id} className="animate-fade-up">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className={cn('inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.14em]', phase.tone)}>
            <Icon name={phase.icon} size={13} /> {phase.label}
          </span>
          {isChallenge(step) && (
            <span className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold', stepDone ? 'bg-ok-soft text-ok' : 'bg-accent-soft text-accent')}>
              <Icon name={stepDone ? 'check' : 'zap'} size={12} /> {stepDone ? 'Completed' : `+${stepXp(step)} XP`}
            </span>
          )}
        </div>
        <h1 className="mb-4 font-display text-2xl font-bold tracking-tight sm:text-[28px]">{step.title}</h1>
        {step.mission && <MissionBrief brief={step.mission} />}
        <StepBody step={step} lessonId={lesson.id} done={!!completedSteps[key]} onComplete={onComplete} />
      </div>

      {/* Footer */}
      <div className="sticky bottom-16 z-20 mt-8 lg:bottom-4">
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-line p-2.5 shadow-card glass">
          <Button variant="ghost" icon="arrow-left" onClick={() => setIndex(index - 1)} disabled={index === 0}>
            Back
          </Button>
          <div className="hidden flex-1 text-center text-xs text-muted sm:block">
            {canContinue ? (index + 1 === lesson.steps.length ? 'Finish the lesson to collect your XP.' : 'Nice — keep going.') : 'Complete the challenge to continue.'}
          </div>
          <div className="hidden w-28 sm:block"><ProgressBar value={(index + (canContinue ? 1 : 0)) / lesson.steps.length} label="Lesson progress" /></div>
          <Button onClick={next} disabled={!canContinue} iconRight={index + 1 === lesson.steps.length ? 'check' : 'arrow-right'}>
            {index + 1 === lesson.steps.length ? 'Finish lesson' : 'Continue'}
          </Button>
        </div>
      </div>
    </div>
  )
}
