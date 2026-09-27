import { useMemo, useState } from 'react'
import type { ArchitectureStep as S } from '@/content/types'
import { stepKey } from '@/content/course'
import { reviewArchitecture } from '@/engine/evaluate'
import type { LabGraph } from '@/engine/graph'
import type { SimPlan } from '@/engine/simulation'
import { cn } from '@/lib/cn'
import { useProgress } from '@/state/progress'
import { Icon } from '@/components/ui/Icon'
import { Button } from '@/components/ui/primitives'
import { ReviewPanel } from '@/components/playground/ReviewPanel'
import { Workbench, type PanelTab } from '@/components/playground/Workbench'
import type { PlayerStatus } from '@/components/playground/useSimPlayer'
import { Feedback, type StepProps } from './shared'

const clone = (g: LabGraph): LabGraph => JSON.parse(JSON.stringify(g))

export function ArchitectureStep({ step, lessonId, done, onComplete }: StepProps<S>) {
  const archId = `challenge:${stepKey(lessonId, step.id)}`
  const saved = useProgress((s) => s.architectures.find((a) => a.id === archId))
  const saveArchitecture = useProgress((s) => s.saveArchitecture)
  const [graph, setGraph] = useState<LabGraph>(() => clone(saved?.graph ?? step.start))
  const [attempts, setAttempts] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [simOk, setSimOk] = useState(false)
  const [simMsg, setSimMsg] = useState<{ tone: 'ok' | 'bad' | 'warn'; text: string } | null>(null)
  const [tab, setTab] = useState<PanelTab>('mission')

  const results = useMemo(() => (step.checks ?? []).map((c) => ({ ...c, ok: c.test(graph) })), [graph, step.checks])
  const allChecks = results.every((r) => r.ok)
  const review = useMemo(() => (step.grading === 'score' ? reviewArchitecture(graph) : null), [graph, step.grading])
  const scorePass = !!review && review.overall >= (step.passScore ?? 70) && review.dimensions.every((d) => d.score >= 40)

  const change = (g: LabGraph) => {
    setGraph(g)
    setSimOk(false)
    setSubmitted(false)
  }

  const finish = (firstTry: boolean) => {
    saveArchitecture({ id: archId, name: step.title, graph })
    if (!done) onComplete({ firstTry })
  }

  const onSimFinish = (plan: SimPlan, status: PlayerStatus) => {
    if (!step.simulate) return
    if (status === 'rejected') {
      setSimMsg({ tone: 'warn', text: 'You rejected the report at the approval gate. Run it again and approve to complete the mission.' })
      return
    }
    const ok = plan.outcome === 'success' || plan.outcome === 'caught'
    if (ok && (step.grading === 'score' ? scorePass : allChecks)) {
      setSimOk(true)
      setSimMsg({ tone: 'ok', text: plan.outcome === 'caught' ? 'Fault caught and repaired before it reached leadership.' : 'The workflow ran end to end.' })
      finish(attempts <= 1)
    } else if (ok) {
      setSimMsg({ tone: 'warn', text: 'It ran — now satisfy the mission checklist too.' })
    } else {
      setSimMsg({ tone: 'bad', text: plan.summary })
    }
  }

  const submitChecks = () => {
    setAttempts((a) => a + 1)
    setSubmitted(true)
    if (!allChecks) return
    if (step.simulate) setTab('simulate')
    else finish(attempts === 0)
  }

  const submitScore = () => {
    setAttempts((a) => a + 1)
    setSubmitted(true)
    if (scorePass && !step.simulate) finish(attempts === 0)
    if (scorePass && step.simulate) setTab('simulate')
  }

  const mission = (
    <div className="space-y-4">
      <p className="text-[13px] text-muted">{step.intro}</p>
      {step.grading === 'checks' && (
        <>
          <div>
            <div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-subtle">Success checklist</div>
            <ul className="space-y-2">
              {results.map((r) => (
                <li key={r.id} className="flex items-start gap-2 text-[13px]">
                  <Icon name={r.ok ? 'check-circle' : 'circle'} size={16} className={cn('mt-px shrink-0', r.ok ? 'text-ok' : 'text-subtle')} />
                  <span>
                    <span className={r.ok ? '' : 'text-fg/80'}>{r.label}</span>
                    {!r.ok && submitted && <span className="mt-0.5 block text-[11.5px] text-warn">{r.hint}</span>}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          {!simOk && (
            <Button className="w-full" icon={step.simulate ? 'play' : 'check'} onClick={submitChecks} variant={allChecks ? 'primary' : 'secondary'}>
              {allChecks ? (step.simulate ? 'Design ready — run it' : 'Submit design') : 'Check my design'}
            </Button>
          )}
          {submitted && !allChecks && <Feedback tone="warn" title={`${results.filter((r) => !r.ok).length} item(s) to address`}>Each hint above explains the principle behind it.</Feedback>}
        </>
      )}
      {step.grading === 'score' && review && (
        <>
          {submitted ? (
            <>
              <ReviewPanel review={review} compact={scorePass} />
              {scorePass ? (
                <Feedback tone="ok" title="Architecture approved">{step.simulate ? 'Now run it with a fault injected and prove it holds up.' : 'This design meets the bar across every principle.'}</Feedback>
              ) : (
                <Feedback tone="warn" title="Not there yet — and that’s normal">
                  Aim for an overall score of {step.passScore ?? 70}+ with no principle below 40. Open the weakest dimension above; each finding explains what to change and why.
                </Feedback>
              )}
            </>
          ) : (
            <div className="rounded-xl border border-dashed border-line p-4 text-center text-[13px] text-muted">
              <Icon name="gauge" size={24} className="mx-auto mb-2 text-accent" />
              There’s no single right answer. You’ll be scored on six principles: separation of responsibilities, tool use, reliability, security, human oversight and efficiency.
            </div>
          )}
          {!simOk && (
            <Button className="w-full" icon="send" onClick={submitScore}>
              {submitted ? 'Re-submit for review' : 'Submit for review'}
            </Button>
          )}
        </>
      )}
      {simMsg && <Feedback tone={simMsg.tone} title={simMsg.tone === 'ok' ? 'Mission complete' : 'Simulation result'}>{simMsg.text}</Feedback>}
      {step.simulate && (allChecks || scorePass) && !simOk && submitted && (
        <p className="text-[12px] text-muted">
          <Icon name="info" size={12} className="mr-1 inline" /> Open the <button className="font-semibold text-accent underline" onClick={() => setTab('simulate')}>Simulate</button> tab and press Run simulation.
        </p>
      )}
      <button className="text-[12px] font-medium text-subtle underline hover:text-fg" onClick={() => change(clone(step.start))}>
        Reset canvas to the starting point
      </button>
    </div>
  )

  return (
    <Workbench
      graph={graph}
      onChange={change}
      palette={step.palette}
      tabs={['mission', 'inspect', 'simulate']}
      tab={tab}
      onTabChange={setTab}
      missionPanel={mission}
      faultDefault={step.fault === 'on' || step.fault === 'locked'}
      faultLocked={step.fault === 'locked'}
      onSimFinish={onSimFinish}
      canvasClassName="h-[62vh] lg:h-[640px]"
    />
  )
}
