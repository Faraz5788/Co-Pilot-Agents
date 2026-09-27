import { useMemo, useState, type ReactNode } from 'react'
import type { AgentBuilderStep as S } from '@/content/types'
import { GOALS, GUARDRAILS, INPUTS, INSTRUCTIONS, OUTPUTS, ROLES, SKILLS, TOOLS, byId } from '@/content/catalog'
import { cn } from '@/lib/cn'
import { useProgress } from '@/state/progress'
import { Icon } from '@/components/ui/Icon'
import { Button } from '@/components/ui/primitives'
import { ChipGroup } from './ChipGroup'
import { ANALYST_ID, blankAnalyst } from './agentDefaults'
import { Feedback, type StepProps } from './shared'

function Section({ n, icon, title, sub, children }: { n: number; icon: string; title: string; sub: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-line bg-surface p-4">
      <header className="mb-3 flex items-center gap-2.5">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-surface-2 text-xs font-bold text-muted">{n}</span>
        <Icon name={icon} size={16} className="text-accent" />
        <div>
          <h3 className="text-sm font-bold">{title}</h3>
          <p className="text-[11.5px] text-muted">{sub}</p>
        </div>
      </header>
      {children}
    </section>
  )
}

export function AgentBuilderStep({ done, onComplete }: StepProps<S>) {
  const saved = useProgress((s) => s.agents.find((a) => a.id === ANALYST_ID))
  const saveAgent = useProgress((s) => s.saveAgent)
  const [a, setA] = useState(() => saved ?? blankAnalyst())
  const [submitted, setSubmitted] = useState(false)
  const set = <K extends keyof typeof a>(k: K, v: (typeof a)[K]) => setA((x) => ({ ...x, [k]: v }))

  const checks = useMemo(
    () => [
      { ok: a.name.trim().length >= 3, label: 'Named', hint: 'Give your agent a name.' },
      { ok: a.role === 'hr-analyst', label: 'Focused role', hint: a.role ? byId(ROLES, a.role)?.hint ?? '' : 'Pick a role.' },
      { ok: a.goal === 'answer-metrics', label: 'Testable goal', hint: a.goal ? byId(GOALS, a.goal)?.hint ?? '' : 'Pick a goal.' },
      { ok: a.tools.some((t) => t === 'powerbi' || t === 'hr-db'), label: 'Has a workforce data tool', hint: 'Numbers need a source: add Power BI Model or HR Database.' },
      { ok: a.instructions.length > 0, label: 'At least one instruction', hint: 'Add a standing rule, e.g. “never estimate”.' },
      { ok: a.outputs.length > 0 && !a.outputs.includes('raw-records'), label: 'Safe, defined output', hint: a.outputs.includes('raw-records') ? 'Raw employee records expose personal data.' : 'Choose what the agent returns.' },
    ],
    [a],
  )
  const ready = checks.every((c) => c.ok)
  const notes = [
    a.tools.includes('payroll') && 'Payroll access: does a headcount analyst need salaries?',
    a.tools.includes('email') && 'Email can send data outside the system.',
    a.tools.includes('web') && 'Web Search isn’t a source of truth for internal numbers.',
  ].filter(Boolean) as string[]

  const save = () => {
    setSubmitted(true)
    if (!ready) return
    saveAgent(a)
    onComplete({ firstTry: true })
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_320px]">
      <div className="space-y-3">
        <Section n={1} icon="user" title="Name & role" sub="WHO is this agent?">
          <label className="mb-3 block">
            <span className="mb-1 block text-xs font-semibold text-muted">Name</span>
            <input
              value={a.name}
              onChange={(e) => set('name', e.target.value)}
              className="w-full rounded-xl border border-line bg-surface-2 px-3 py-2 text-sm outline-none focus:border-accent"
              maxLength={40}
            />
          </label>
          <ChipGroup ariaLabel="Role" options={ROLES} value={a.role ? [a.role] : []} onChange={(v) => set('role', v[0])} />
        </Section>
        <Section n={2} icon="target" title="Goal" sub="What outcome makes it successful?">
          <ChipGroup ariaLabel="Goal" options={GOALS} value={a.goal ? [a.goal] : []} onChange={(v) => set('goal', v[0])} />
        </Section>
        <Section n={3} icon="scroll-text" title="Instructions" sub="RULES it follows every time">
          <ChipGroup ariaLabel="Instructions" multiple columns={2} options={INSTRUCTIONS} value={a.instructions} onChange={(v) => set('instructions', v)} />
        </Section>
        <Section n={4} icon="wrench" title="Tools" sub="WHAT it can use">
          <ChipGroup
            ariaLabel="Tools"
            multiple
            columns={2}
            options={TOOLS.map((t) => ({ id: t.id, label: t.name, icon: t.icon, hint: t.data, badge: t.permissions.join(' · '), badgeTone: t.sensitive ? 'bad' : t.outbound ? 'warn' : undefined }))}
            value={a.tools}
            onChange={(v) => set('tools', v)}
          />
        </Section>
        <Section n={5} icon="sparkles" title="Skills" sub="HOW it does specific tasks">
          <ChipGroup ariaLabel="Skills" multiple columns={2} options={SKILLS.map((s) => ({ id: s.id, label: s.name, icon: s.icon, hint: s.useWhen }))} value={a.skills} onChange={(v) => set('skills', v)} />
        </Section>
        <div className="grid gap-3 md:grid-cols-2">
          <Section n={6} icon="arrow-right" title="Inputs" sub="What it receives">
            <ChipGroup ariaLabel="Inputs" multiple options={INPUTS} value={a.inputs} onChange={(v) => set('inputs', v)} />
          </Section>
          <Section n={7} icon="file-output" title="Outputs" sub="What “done” looks like">
            <ChipGroup ariaLabel="Outputs" multiple options={OUTPUTS} value={a.outputs} onChange={(v) => set('outputs', v)} />
          </Section>
        </div>
        <Section n={8} icon="shield" title="Guardrails" sub="Boundaries it must not cross">
          <ChipGroup ariaLabel="Guardrails" multiple columns={2} options={GUARDRAILS} value={a.guardrails} onChange={(v) => set('guardrails', v)} />
          <p className="mt-2 text-[11.5px] text-subtle">Not sure yet? That’s fine — you’ll stress-test your agent next.</p>
        </Section>
      </div>

      {/* Live spec */}
      <aside className="space-y-3 xl:sticky xl:top-4 xl:self-start">
        <div className="overflow-hidden rounded-2xl border border-line bg-surface">
          <div className="flex items-center gap-2 border-b border-line bg-gradient-brand px-4 py-3 text-white">
            <Icon name="bot" size={18} />
            <span className="truncate font-display font-semibold">{a.name || 'Unnamed agent'}</span>
          </div>
          <dl className="divide-y divide-line text-[12.5px]">
            {[
              ['Role', byId(ROLES, a.role)?.label],
              ['Goal', byId(GOALS, a.goal)?.label],
              ['Rules', a.instructions.length ? `${a.instructions.length} instruction(s)` : undefined],
              ['Tools', a.tools.map((t) => byId(TOOLS, t)?.name).join(', ')],
              ['Skills', a.skills.map((t) => byId(SKILLS, t)?.name).join(', ')],
              ['Guardrails', a.guardrails.length ? `${a.guardrails.length} set` : undefined],
            ].map(([k, v]) => (
              <div key={k} className="flex gap-3 px-4 py-2">
                <dt className="w-16 shrink-0 font-semibold text-subtle">{k}</dt>
                <dd className={cn(!v && 'italic text-subtle')}>{v || 'not set'}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="rounded-2xl border border-line bg-surface p-4">
          <div className="mb-2 text-xs font-bold uppercase tracking-wider text-subtle">Readiness</div>
          <ul className="space-y-1.5">
            {checks.map((c) => (
              <li key={c.label} className="flex items-start gap-2 text-[13px]">
                <Icon name={c.ok ? 'check-circle' : 'circle'} size={16} className={cn('mt-px shrink-0', c.ok ? 'text-ok' : 'text-subtle')} />
                <span>
                  <span className={c.ok ? '' : 'text-muted'}>{c.label}</span>
                  {!c.ok && submitted && c.hint && <span className="block text-[11.5px] text-warn">{c.hint}</span>}
                </span>
              </li>
            ))}
          </ul>
          {notes.length > 0 && (
            <div className="mt-3 space-y-1 border-t border-line pt-3">
              {notes.map((n) => (
                <p key={n} className="flex items-start gap-1.5 text-[11.5px] text-warn">
                  <Icon name="alert-triangle" size={13} className="mt-px shrink-0" /> {n}
                </p>
              ))}
            </div>
          )}
          <Button className="mt-4 w-full" icon="save" onClick={save} variant={ready ? 'primary' : 'secondary'}>
            {done ? 'Update agent' : 'Save agent'}
          </Button>
        </div>
        {submitted && !ready && <Feedback tone="warn" title="Almost there">Fix the unchecked items above — each hint says why it matters.</Feedback>}
        {done && submitted && ready && <Feedback tone="ok" title="Agent saved">Now let’s see how it handles real requests.</Feedback>}
      </aside>
    </div>
  )
}
