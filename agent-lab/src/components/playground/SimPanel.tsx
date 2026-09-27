import { useEffect, useRef, useState } from 'react'
import type { SimPlan } from '@/engine/simulation'
import { cn } from '@/lib/cn'
import { Icon } from '@/components/ui/Icon'
import { Button } from '@/components/ui/primitives'
import type { PlayerStatus } from './useSimPlayer'

const toneText = { info: 'text-muted', ok: 'text-ok', warn: 'text-warn', bad: 'text-bad' }
const toneDot = { info: 'bg-accent-2', ok: 'bg-ok', warn: 'bg-warn', bad: 'bg-bad' }

export function SimPanel({
  plan, index, status, onRun, onApprove, onReject, onReset, defaultRequest, fault, onFaultChange, faultLocked,
}: {
  plan: SimPlan | null
  index: number
  status: PlayerStatus
  onRun: (request: string, fault: boolean) => void
  onApprove: () => void
  onReject: () => void
  onReset: () => void
  defaultRequest: string
  fault: boolean
  onFaultChange: (v: boolean) => void
  faultLocked?: boolean
}) {
  const [request, setRequest] = useState(defaultRequest)
  const logRef = useRef<HTMLDivElement>(null)
  useEffect(() => setRequest(defaultRequest), [defaultRequest])
  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: 'smooth' })
  }, [index, status])

  const busy = status === 'running' || status === 'awaiting'
  const current = plan?.steps[index]
  const finished = status === 'done' || status === 'rejected'
  const outcomeTone = status === 'rejected' ? 'warn' : plan?.outcome === 'success' || plan?.outcome === 'caught' ? 'ok' : plan?.outcome === 'blocked' ? 'warn' : 'bad'

  return (
    <div className="flex h-full flex-col gap-3">
      <label className="block">
        <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-subtle">Request</span>
        <textarea value={request} onChange={(e) => setRequest(e.target.value)} disabled={busy} className="min-h-[56px] w-full resize-none rounded-lg border border-line bg-surface-2 px-2.5 py-1.5 text-[13px] outline-none focus:border-accent" />
      </label>
      <label className={cn('flex items-center gap-2.5 rounded-lg border px-3 py-2 text-[12.5px]', fault ? 'border-bad/40 bg-bad-soft' : 'border-line')}>
        <input type="checkbox" checked={fault} disabled={busy || faultLocked} onChange={(e) => onFaultChange(e.target.checked)} className="h-4 w-4 accent-[var(--bad)]" />
        <span className="flex-1">
          <span className="font-semibold">Inject a fault</span>
          <span className="block text-[11px] text-muted">The Headcount Agent returns a wrong number. Will your design catch it?</span>
        </span>
        <Icon name="bug" size={16} className={fault ? 'text-bad' : 'text-subtle'} />
      </label>
      <div className="flex gap-2">
        <Button size="lg" className="flex-1" icon={busy ? 'pause' : 'play'} onClick={() => onRun(request, fault)} disabled={busy}>
          {busy ? 'Running…' : finished ? 'Run again' : 'Run simulation'}
        </Button>
        {(finished || status === 'invalid') && <Button size="lg" variant="secondary" icon="rotate-ccw" onClick={onReset} aria-label="Reset simulation" />}
      </div>

      {status === 'invalid' && plan && (
        <div className="rounded-xl border border-warn/40 bg-warn-soft p-3 text-[13px]">
          <div className="mb-1 font-bold text-warn">Can’t run yet</div>
          <ul className="list-disc space-y-1 pl-4">{plan.problems.map((p) => <li key={p}>{p}</li>)}</ul>
        </div>
      )}

      {status === 'awaiting' && current?.awaitApproval && (
        <div className="rounded-xl border-2 border-warn/60 bg-warn-soft p-3 animate-pop">
          <div className="mb-1 flex items-center gap-2 text-sm font-bold"><Icon name="user-check" size={16} className="text-warn" /> Human approval needed</div>
          <dl className="mb-3 space-y-1 text-[12px]">
            <div><dt className="inline font-semibold">Why: </dt><dd className="inline">{current.awaitApproval.reason || '—'}</dd></div>
            <div><dt className="inline font-semibold">Reviewer sees: </dt><dd className="inline">{current.awaitApproval.shows || '—'}</dd></div>
            <div><dt className="inline font-semibold">Action: </dt><dd className="inline">{current.awaitApproval.action || '—'}</dd></div>
          </dl>
          <div className="flex gap-2">
            <Button size="sm" variant="success" icon="check" onClick={onApprove} className="flex-1">Approve</Button>
            <Button size="sm" variant="danger" icon="x" onClick={onReject} className="flex-1">Reject</Button>
          </div>
        </div>
      )}

      {plan && plan.steps.length > 0 && (
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="mb-1.5 flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-subtle">
            <span>Execution timeline</span>
            <span>{Math.min(index + 1, plan.steps.length)}/{plan.steps.length}</span>
          </div>
          <div ref={logRef} className="min-h-[160px] flex-1 space-y-2 overflow-y-auto rounded-xl border border-line bg-surface-2/50 p-2.5 scrollbar-thin" aria-live="polite">
            {plan.steps.slice(0, index + 1).map((s, i) => (
              <div key={s.id} className={cn('rounded-lg border bg-surface p-2 animate-fade-up', i === index && busy ? 'border-accent-2/60' : 'border-line')}>
                <div className="mb-1 flex items-center gap-2 text-[12px] font-bold">
                  <span className={cn('flex h-5 w-5 items-center justify-center rounded-full text-[10px] text-white', toneDot[s.tone])}>{i + 1}</span>
                  <span className="truncate">{s.title}</span>
                  {s.parallel && <span className="ml-auto shrink-0 rounded bg-accent-2-soft px-1.5 py-0.5 text-[9.5px] font-bold uppercase text-accent-2">parallel</span>}
                </div>
                {s.logs.map((l, k) => (
                  <div key={k} className={cn('flex items-start gap-1.5 font-mono text-[11px] leading-snug', toneText[l.tone])}>
                    <Icon name={l.icon} size={11} className="mt-0.5 shrink-0" />
                    <span className={l.tone === 'info' ? 'text-fg/80' : ''}>{l.text}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {finished && plan && (
        <div className={cn('rounded-xl border p-3 animate-fade-up', outcomeTone === 'ok' ? 'border-ok/40 bg-ok-soft' : outcomeTone === 'warn' ? 'border-warn/40 bg-warn-soft' : 'border-bad/40 bg-bad-soft')}>
          <div className="mb-1 flex items-center gap-2 text-sm font-bold">
            <Icon name={outcomeTone === 'ok' ? 'check-circle' : outcomeTone === 'warn' ? 'alert-triangle' : 'x-circle'} size={16} />
            {status === 'rejected' ? 'Rejected by reviewer' : { success: 'Success', caught: 'Fault caught', failed: 'Bad output', incomplete: 'Incomplete', blocked: 'Stopped safely' }[plan.outcome]}
          </div>
          <p className="text-[12.5px]">{status === 'rejected' ? 'The reviewer said no, so nothing was published. That’s the approval gate doing its job.' : plan.summary}</p>
          {plan.problems.length > 0 && <ul className="mt-2 list-disc pl-4 text-[11.5px] text-muted">{plan.problems.map((p) => <li key={p}>{p}</li>)}</ul>}
          {status === 'done' && plan.report && (
            <div className="mt-3 rounded-lg border border-line bg-surface p-2.5">
              <div className="mb-1 flex items-center gap-1.5 text-[12px] font-bold"><Icon name="file-text" size={13} /> {plan.report.title}</div>
              {plan.report.lines.map((l) => <div key={l} className="text-[11.5px] text-muted">{l}</div>)}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
