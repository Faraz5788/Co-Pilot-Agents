import { useState } from 'react'
import type { SkillBuilderStep as S } from '@/content/types'
import { SKILL_SPECS, type SkillSpec } from '@/content/skillSpecs'
import { cn } from '@/lib/cn'
import { useProgress } from '@/state/progress'
import { Icon } from '@/components/ui/Icon'
import { Button } from '@/components/ui/primitives'
import { Feedback, useShuffled, type StepProps } from './shared'

interface Draft { useWhen: string; inputs: string[]; steps: string[]; output: string }
const empty: Draft = { useWhen: '', inputs: [], steps: [], output: '' }

function validate(spec: SkillSpec, d: Draft) {
  const issues: { field: string; msg: string }[] = []
  const uw = spec.useWhen.find((o) => o.id === d.useWhen)
  if (!uw) issues.push({ field: 'useWhen', msg: 'Choose when this skill should be used.' })
  else if (!uw.ok) issues.push({ field: 'useWhen', msg: uw.why })
  const missing = spec.inputs.filter((i) => i.role === 'required' && !d.inputs.includes(i.id))
  if (missing.length) issues.push({ field: 'inputs', msg: `Missing required input: ${missing.map((m) => m.text).join(', ')}.` })
  spec.inputs.filter((i) => i.role === 'forbidden' && d.inputs.includes(i.id)).forEach((i) => issues.push({ field: 'inputs', msg: `${i.text}: ${i.why}` }))
  const distractor = d.steps.map((id) => spec.steps.find((s) => s.id === id)!).find((s) => s.distractor)
  if (distractor) issues.push({ field: 'steps', msg: `“${distractor.text}” — ${distractor.distractor}` })
  else if (d.steps.length < spec.order.length) issues.push({ field: 'steps', msg: `The method needs ${spec.order.length} steps; you have ${d.steps.length}.` })
  else if (d.steps.join() !== spec.order.join()) {
    const firstBad = d.steps.findIndex((id, i) => id !== spec.order[i])
    issues.push({ field: 'steps', msg: `Step ${firstBad + 1} is out of order — what must happen before “${spec.steps.find((s) => s.id === d.steps[firstBad])!.text}”?` })
  }
  const out = spec.output.find((o) => o.id === d.output)
  if (!out) issues.push({ field: 'output', msg: 'Choose the output format.' })
  else if (!out.ok) issues.push({ field: 'output', msg: out.why })
  return issues
}

function SkillForm({ spec, onPass, passed }: { spec: SkillSpec; onPass: (d: Draft, attempts: number) => void; passed: boolean }) {
  const [d, setD] = useState<Draft>(() =>
    passed ? { useWhen: spec.useWhen.find((o) => o.ok)!.id, inputs: spec.inputs.filter((i) => i.role !== 'forbidden').map((i) => i.id), steps: spec.order, output: spec.output.find((o) => o.ok)!.id } : empty,
  )
  const [issues, setIssues] = useState<{ field: string; msg: string }[] | null>(null)
  const [attempts, setAttempts] = useState(0)
  const pool = useShuffled(spec.steps, spec.skillId)
  const bad = (f: string) => issues?.some((i) => i.field === f)

  const check = () => {
    const found = validate(spec, d)
    const n = attempts + 1
    setAttempts(n)
    setIssues(found)
    if (!found.length) onPass(d, n)
  }
  const field = (f: string) => cn('rounded-2xl border p-4', bad(f) ? 'border-warn/50 bg-warn-soft/40' : 'border-line bg-surface')

  return (
    <div className="space-y-3">
      <div className={field('useWhen')}>
        <div className="mb-2 flex items-center gap-2 text-sm font-bold"><Icon name="search" size={15} className="text-accent" /> Use when… <span className="text-xs font-normal text-muted">(how agents discover it)</span></div>
        <div className="grid gap-2">
          {spec.useWhen.map((o) => (
            <button key={o.id} onClick={() => setD({ ...d, useWhen: o.id })} aria-pressed={d.useWhen === o.id}
              className={cn('rounded-xl border px-3 py-2 text-left text-[13px] transition-colors', d.useWhen === o.id ? 'border-accent bg-accent-soft' : 'border-line hover:border-line-strong')}>
              {o.text}
            </button>
          ))}
        </div>
      </div>

      <div className={field('inputs')}>
        <div className="mb-2 flex items-center gap-2 text-sm font-bold"><Icon name="arrow-right" size={15} className="text-accent" /> Inputs <span className="text-xs font-normal text-muted">(select all it needs — and nothing it shouldn’t)</span></div>
        <div className="flex flex-wrap gap-2">
          {spec.inputs.map((i) => {
            const on = d.inputs.includes(i.id)
            return (
              <button key={i.id} aria-pressed={on} onClick={() => setD({ ...d, inputs: on ? d.inputs.filter((x) => x !== i.id) : [...d.inputs, i.id] })}
                className={cn('rounded-full border px-3 py-1.5 text-[13px] transition-colors', on ? 'border-accent bg-accent-soft' : 'border-line hover:border-line-strong')}>
                {on && '✓ '}{i.text}
              </button>
            )
          })}
        </div>
      </div>

      <div className={field('steps')}>
        <div className="mb-2 flex items-center gap-2 text-sm font-bold"><Icon name="list-ordered" size={15} className="text-accent" /> Method <span className="text-xs font-normal text-muted">(tap steps in order · tap a numbered step to remove it)</span></div>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            {pool.map((s) => {
              const used = d.steps.includes(s.id)
              return (
                <button key={s.id} disabled={used} onClick={() => setD({ ...d, steps: [...d.steps, s.id] })}
                  className={cn('flex items-center gap-2 rounded-lg border px-2.5 py-2 text-left text-[12.5px] transition-colors', used ? 'border-transparent text-subtle line-through' : 'border-line hover:border-accent/50')}>
                  <Icon name="plus" size={13} className={used ? 'text-subtle' : 'text-accent'} /> {s.text}
                </button>
              )
            })}
          </div>
          <ol className="flex min-h-[80px] flex-col gap-1.5 rounded-xl border border-dashed border-line p-2">
            {d.steps.length === 0 && <li className="p-2 text-center text-xs text-subtle">Your method appears here</li>}
            {d.steps.map((id, i) => (
              <li key={id}>
                <button onClick={() => setD({ ...d, steps: d.steps.filter((x) => x !== id) })} className="flex w-full items-center gap-2 rounded-lg bg-surface-2 px-2.5 py-2 text-left text-[12.5px] hover:bg-bad-soft" aria-label={`Remove step ${i + 1}`}>
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white">{i + 1}</span>
                  <span className="flex-1">{spec.steps.find((s) => s.id === id)!.text}</span>
                  <Icon name="x" size={12} className="text-subtle" />
                </button>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className={field('output')}>
        <div className="mb-2 flex items-center gap-2 text-sm font-bold"><Icon name="file-output" size={15} className="text-accent" /> Output</div>
        <div className="grid gap-2 sm:grid-cols-3">
          {spec.output.map((o) => (
            <button key={o.id} onClick={() => setD({ ...d, output: o.id })} aria-pressed={d.output === o.id}
              className={cn('rounded-xl border px-3 py-2 text-left text-[13px] transition-colors', d.output === o.id ? 'border-accent bg-accent-soft' : 'border-line hover:border-line-strong')}>
              {o.text}
            </button>
          ))}
        </div>
      </div>

      {issues && issues.length > 0 && (
        <Feedback tone="warn" title={`${issues.length} thing${issues.length > 1 ? 's' : ''} to fix`}>
          <ul className="mt-1 list-disc space-y-1 pl-4">{issues.map((i, k) => <li key={k}>{i.msg}</li>)}</ul>
        </Feedback>
      )}
      {passed ? (
        <Feedback tone="ok" title={`${spec.name} skill saved`}>Any agent can now load this skill when a request matches its “use when”.</Feedback>
      ) : (
        <div className="flex justify-end"><Button icon="shield-check" onClick={check}>Validate skill</Button></div>
      )}
    </div>
  )
}

export function SkillBuilderStep({ done, onComplete }: StepProps<S>) {
  const savedSkills = useProgress((s) => s.skills)
  const saveSkill = useProgress((s) => s.saveSkill)
  const passedIds = new Set(done ? SKILL_SPECS.map((s) => s.skillId) : savedSkills.map((s) => s.id))
  const [active, setActive] = useState(SKILL_SPECS.find((s) => !passedIds.has(s.skillId))?.skillId ?? SKILL_SPECS[0].skillId)
  const [totalAttempts, setTotalAttempts] = useState(0)
  const spec = SKILL_SPECS.find((s) => s.skillId === active)!

  const onPass = (d: Draft, attempts: number) => {
    saveSkill({
      id: spec.skillId,
      name: spec.name,
      useWhen: spec.useWhen.find((o) => o.id === d.useWhen)!.text,
      inputs: d.inputs.map((id) => spec.inputs.find((i) => i.id === id)!.text),
      steps: d.steps.map((id) => spec.steps.find((s) => s.id === id)!.text),
      output: spec.output.find((o) => o.id === d.output)!.text,
    })
    const n = totalAttempts + attempts
    setTotalAttempts(n)
    const nowPassed = new Set([...passedIds, spec.skillId])
    const next = SKILL_SPECS.find((s) => !nowPassed.has(s.skillId))
    if (next) setTimeout(() => setActive(next.skillId), 900)
    else onComplete({ firstTry: n === SKILL_SPECS.length })
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2" role="tablist" aria-label="Skills to build">
        {SKILL_SPECS.map((s) => {
          const ok = passedIds.has(s.skillId)
          return (
            <button key={s.skillId} role="tab" aria-selected={active === s.skillId} onClick={() => setActive(s.skillId)}
              className={cn('flex flex-col items-center gap-1 rounded-xl border p-3 text-center transition-colors sm:flex-row sm:text-left',
                active === s.skillId ? 'border-accent bg-accent-soft' : 'border-line bg-surface hover:border-line-strong')}>
              <span className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', ok ? 'bg-ok text-white' : 'bg-surface-2 text-accent')}>
                <Icon name={ok ? 'check' : s.icon} size={16} />
              </span>
              <span className="text-[12.5px] font-semibold leading-tight">{s.name}</span>
            </button>
          )
        })}
      </div>
      <SkillForm key={active} spec={spec} passed={passedIds.has(active)} onPass={onPass} />
    </div>
  )
}
