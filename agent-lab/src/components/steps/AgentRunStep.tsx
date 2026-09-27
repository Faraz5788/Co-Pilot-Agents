import { useEffect, useRef, useState } from 'react'
import type { AgentRunStep as S } from '@/content/types'
import { GUARDRAILS, INSTRUCTIONS, SKILLS, TOOLS } from '@/content/catalog'
import { AGENT_REQUESTS, OUTCOME_META, runAgentRequest, unguardedCounterfactual, type RunResult, type TraceLine } from '@/engine/agentRunner'
import { cn } from '@/lib/cn'
import { useProgress } from '@/state/progress'
import { Icon } from '@/components/ui/Icon'
import { Button, Pill } from '@/components/ui/primitives'
import { ANALYST_ID, blankAnalyst } from './agentDefaults'
import { Feedback, type StepProps } from './shared'

const TRACE_ICON: Record<TraceLine['kind'], { icon: string; cls: string }> = {
  think: { icon: 'brain', cls: 'text-accent' },
  tool: { icon: 'wrench', cls: 'text-accent-2' },
  skill: { icon: 'sparkles', cls: 'text-warn' },
  guard: { icon: 'shield', cls: 'text-ok' },
  result: { icon: 'arrow-right', cls: 'text-muted' },
  warn: { icon: 'alert-triangle', cls: 'text-warn' },
  error: { icon: 'x-circle', cls: 'text-bad' },
}

function Trace({ lines, shown }: { lines: TraceLine[]; shown: number }) {
  return (
    <ol className="space-y-1 rounded-xl border border-line bg-surface-2/60 p-3 font-mono text-[12px]">
      {lines.slice(0, shown).map((l, i) => (
        <li key={i} className={cn('flex items-start gap-2 animate-fade-up', l.kind === 'error' && 'font-bold text-bad')}>
          <Icon name={TRACE_ICON[l.kind].icon} size={13} className={cn('mt-0.5 shrink-0', TRACE_ICON[l.kind].cls)} />
          <span>{l.text}</span>
        </li>
      ))}
      {shown < lines.length && (
        <li className="flex items-center gap-2 text-subtle">
          <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-accent" /> thinking…
        </li>
      )}
    </ol>
  )
}

function ResultCard({ r, animate }: { r: RunResult; animate: boolean }) {
  const [shown, setShown] = useState(animate ? 0 : r.trace.length)
  useEffect(() => {
    if (!animate) return
    setShown(0)
    const t = setInterval(() => setShown((s) => (s >= r.trace.length ? (clearInterval(t), s) : s + 1)), 420)
    return () => clearInterval(t)
  }, [r, animate])
  const finished = shown >= r.trace.length
  const meta = OUTCOME_META[r.outcome]
  return (
    <div className="space-y-2">
      <Trace lines={r.trace} shown={shown} />
      {finished && (
        <div className="space-y-2 animate-fade-up">
          <div className={cn('rounded-xl border p-3 text-sm', r.outcome === 'breach' ? 'border-bad/50 bg-bad-soft' : 'border-line bg-surface')}>
            <div className="mb-1 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-subtle">
              <Icon name="bot" size={13} /> Agent reply
            </div>
            <p>{r.answer}</p>
            {r.table && (
              <table className="mt-2 w-full text-[12.5px]">
                <tbody>
                  {r.table.map((row) => (
                    <tr key={row.key} className="border-t border-line">
                      <td className="py-1">{row.key}</td>
                      <td className="py-1 text-right font-mono">{row.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <Feedback tone={meta.tone === 'ok' ? 'ok' : meta.tone === 'warn' ? 'warn' : 'bad'} title={meta.label}>
            {r.coach}
          </Feedback>
        </div>
      )}
    </div>
  )
}

export function AgentRunStep({ done, onComplete }: StepProps<S>) {
  const saved = useProgress((s) => s.agents.find((a) => a.id === ANALYST_ID))
  const saveAgent = useProgress((s) => s.saveAgent)
  const agent = saved ?? { ...blankAnalyst(), updatedAt: '' }
  const [results, setResults] = useState<Record<string, RunResult>>({})
  const [active, setActive] = useState<string>(AGENT_REQUESTS[0].id)
  const [animKey, setAnimKey] = useState(0)
  const [stale, setStale] = useState(false)
  const [everFailedSalary, setEverFailedSalary] = useState(false)
  const completed = useRef(done)

  const run = (id: string) => {
    const r = runAgentRequest(agent, id)
    setResults((x) => ({ ...x, [id]: r }))
    setActive(id)
    setAnimKey((k) => k + 1)
    if (id === 'salary' && !r.pass) setEverFailedSalary(true)
  }

  const runAll = () => {
    const all = Object.fromEntries(AGENT_REQUESTS.map((q) => [q.id, runAgentRequest(agent, q.id)]))
    setResults(all)
    setStale(false)
    if (!all.salary.pass) setEverFailedSalary(true)
    const firstFail = AGENT_REQUESTS.find((q) => !all[q.id].pass)
    setActive(firstFail?.id ?? 'salary')
    setAnimKey((k) => k + 1)
  }

  const allPass = AGENT_REQUESTS.every((q) => results[q.id]?.pass) && !stale
  useEffect(() => {
    if (allPass && !completed.current) {
      completed.current = true
      onComplete({ firstTry: !everFailedSalary })
    }
  }, [allPass, everFailedSalary, onComplete])

  const update = (patch: Partial<typeof agent>) => {
    saveAgent({ ...agent, ...patch })
    setStale(true)
  }
  const toggle = (k: 'tools' | 'skills' | 'guardrails' | 'instructions', id: string) =>
    update({ [k]: agent[k].includes(id) ? agent[k].filter((x) => x !== id) : [...agent[k], id] })

  const current = results[active]
  const counterfactual = allPass && !everFailedSalary ? unguardedCounterfactual(agent) : null

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-brand text-white"><Icon name="bot" size={16} /></span>
            <span className="font-semibold">{agent.name}</span>
            {stale && <Pill tone="warn" icon="rotate-ccw">Config changed — re-run</Pill>}
          </div>
          <Button icon="play" onClick={runAll}>{Object.keys(results).length ? 'Re-run all requests' : 'Run all 3 requests'}</Button>
        </div>

        <div className="grid gap-2 sm:grid-cols-3">
          {AGENT_REQUESTS.map((q) => {
            const r = results[q.id]
            const meta = r && OUTCOME_META[r.outcome]
            return (
              <button
                key={q.id}
                onClick={() => (r ? setActive(q.id) : run(q.id))}
                className={cn(
                  'flex flex-col gap-2 rounded-xl border p-3 text-left transition-all',
                  active === q.id ? 'border-accent bg-accent-soft' : 'border-line bg-surface hover:border-line-strong',
                )}
              >
                <span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-subtle">
                  <Icon name={q.icon} size={13} /> Request
                </span>
                <span className="text-sm font-medium">“{q.text}”</span>
                {meta ? (
                  <Pill tone={meta.tone} icon={meta.icon} className="self-start">{meta.label}</Pill>
                ) : (
                  <span className="flex items-center gap-1 text-xs font-semibold text-accent"><Icon name="play" size={12} /> Run</span>
                )}
              </button>
            )
          })}
        </div>

        {current ? (
          <ResultCard key={`${active}-${animKey}`} r={current} animate />
        ) : (
          <div className="rounded-2xl border border-dashed border-line p-8 text-center text-sm text-muted">
            <Icon name="play-circle" size={28} className="mx-auto mb-2 text-accent" />
            Run the requests to see how your agent thinks, which tools it calls and what it replies.
          </div>
        )}

        {allPass && (
          <Feedback tone="ok" title="Mission complete">
            Both questions answered from real data, and the dangerous request refused. That’s an agent you could trust with real work.
          </Feedback>
        )}
        {counterfactual && (
          <details className="rounded-2xl border border-bad/30 bg-surface">
            <summary className="flex cursor-pointer list-none items-center gap-2 p-3.5 text-sm font-semibold">
              <Icon name="eye" size={16} className="text-bad" /> You built it safely first time. See what an unguarded agent would have done →
            </summary>
            <div className="border-t border-line p-3.5">
              <ResultCard r={counterfactual} animate={false} />
            </div>
          </details>
        )}
      </div>

      <aside className="space-y-3 lg:sticky lg:top-4 lg:self-start">
        <div className="rounded-2xl border border-line bg-surface p-4">
          <div className="mb-1 flex items-center gap-2 text-sm font-bold"><Icon name="wrench" size={16} className="text-accent" /> Adjust your agent</div>
          <p className="mb-3 text-[11.5px] text-muted">Changes save instantly. Re-run to test them.</p>
          {(
            [
              ['Tools', 'tools', TOOLS.map((t) => ({ id: t.id, label: t.name, flag: t.sensitive ? 'sensitive' : t.outbound ? 'outbound' : '' }))],
              ['Skills', 'skills', SKILLS.map((s) => ({ id: s.id, label: s.name, flag: '' }))],
              ['Instructions', 'instructions', INSTRUCTIONS.map((s) => ({ id: s.id, label: s.label, flag: '' }))],
              ['Guardrails', 'guardrails', GUARDRAILS.map((s) => ({ id: s.id, label: s.label, flag: '' }))],
            ] as const
          ).map(([title, key, opts]) => (
            <div key={key} className="mb-3 last:mb-0">
              <div className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-subtle">{title}</div>
              <div className="flex flex-wrap gap-1.5">
                {opts.map((o) => {
                  const on = agent[key].includes(o.id)
                  return (
                    <button
                      key={o.id}
                      onClick={() => toggle(key, o.id)}
                      aria-pressed={on}
                      className={cn(
                        'rounded-lg border px-2 py-1 text-left text-[11.5px] font-medium transition-colors',
                        on ? 'border-accent/60 bg-accent-soft text-fg' : 'border-line text-muted hover:border-line-strong hover:text-fg',
                      )}
                    >
                      {on && '✓ '}
                      {o.label}
                      {o.flag && <span className={cn('ml-1 text-[9.5px] font-bold uppercase', o.flag === 'sensitive' ? 'text-bad' : 'text-warn')}>{o.flag}</span>}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </aside>
    </div>
  )
}
