import { useState, type ReactNode } from 'react'
import { SKILLS, TOOLS, byId, type Permission } from '@/content/catalog'
import {
  type AgentNodeConfig, type ApprovalNodeConfig, type LabGraph, type LabNode, type OrchestratorNodeConfig, type OutputNodeConfig,
  type QaNodeConfig, type RequestNodeConfig, type SkillNodeConfig, type Specialty, type ToolNodeConfig, nodeMap,
} from '@/engine/graph'
import { KIND_META, SPECIALTY_PRESETS } from '@/engine/nodeFactory'
import { cn } from '@/lib/cn'
import { useUi } from '@/state/ui'
import { Icon } from '@/components/ui/Icon'
import { Button } from '@/components/ui/primitives'
import { KIND_STYLE } from './kindStyles'
import { tryConnect } from './connect'

const input = 'w-full rounded-lg border border-line bg-surface-2 px-2.5 py-1.5 text-[13px] outline-none focus:border-accent disabled:opacity-60'

function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-subtle">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[11px] text-muted">{hint}</span>}
    </label>
  )
}

function Text({ value, onChange, area, disabled }: { value: string; onChange: (v: string) => void; area?: boolean; disabled?: boolean }) {
  return area ? (
    <textarea className={cn(input, 'min-h-[60px] resize-y')} value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled} />
  ) : (
    <input className={input} value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled} />
  )
}

function Select<T extends string>({ value, options, onChange, disabled }: { value: T; options: { v: T; l: string }[]; onChange: (v: T) => void; disabled?: boolean }) {
  return (
    <select className={input} value={value} onChange={(e) => onChange(e.target.value as T)} disabled={disabled}>
      {options.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
    </select>
  )
}

export function Inspector({ graph, nodeId, onChange, onClose, readOnly }: { graph: LabGraph; nodeId: string; onChange: (g: LabGraph) => void; onClose: () => void; readOnly?: boolean }) {
  const pushToast = useUi((s) => s.pushToast)
  const [connectTo, setConnectTo] = useState('')
  const [dir, setDir] = useState<'out' | 'in'>('out')
  const m = nodeMap(graph)
  const n = m.get(nodeId)
  if (!n) return null
  const meta = KIND_META[n.kind]
  const ro = readOnly

  const patch = (p: Partial<LabNode>) => onChange({ ...graph, nodes: graph.nodes.map((x) => (x.id === n.id ? ({ ...x, ...p } as LabNode) : x)) })
  const cfg = <C,>(p: Partial<C>) => patch({ config: { ...(n.config as object), ...p } as never })

  const links = graph.edges.filter((e) => e.source === n.id || e.target === n.id).map((e) => ({ e, other: m.get(e.source === n.id ? e.target : e.source)!, out: e.source === n.id }))
  const candidates = graph.nodes.filter((x) => x.id !== n.id && !links.some((l) => l.other.id === x.id))

  const connect = () => {
    if (!connectTo) return
    const r = dir === 'out' ? tryConnect(graph, n.id, connectTo) : tryConnect(graph, connectTo, n.id)
    if (r.error) pushToast({ kind: 'info', title: 'Can’t connect those', detail: r.error, icon: 'info' })
    else if (r.edge) {
      onChange({ ...graph, edges: [...graph.edges, r.edge] })
      setConnectTo('')
    }
  }
  const remove = () => {
    onChange({ nodes: graph.nodes.filter((x) => x.id !== n.id), edges: graph.edges.filter((e) => e.source !== n.id && e.target !== n.id) })
    onClose()
  }

  let body: ReactNode = null
  if (n.kind === 'agent') {
    const c = n.config as AgentNodeConfig
    const tools = links.filter((l) => l.other.kind === 'tool').map((l) => l.other.label)
    const skills = links.filter((l) => l.other.kind === 'skill').map((l) => l.other.label)
    body = (
      <>
        <Field label="Specialty">
          <Select<Specialty>
            value={c.specialty}
            disabled={ro}
            options={(Object.keys(SPECIALTY_PRESETS) as Specialty[]).map((s) => ({ v: s, l: SPECIALTY_PRESETS[s].label }))}
            onChange={(s) => {
              const { label, ...p } = SPECIALTY_PRESETS[s]
              patch({ label, config: { specialty: s, ...p } })
            }}
          />
        </Field>
        <Field label="Role"><Text value={c.role} onChange={(v) => cfg<AgentNodeConfig>({ role: v })} disabled={ro} /></Field>
        <Field label="Goal"><Text area value={c.goal} onChange={(v) => cfg<AgentNodeConfig>({ goal: v })} disabled={ro} /></Field>
        <Field label="Instructions"><Text area value={c.instructions} onChange={(v) => cfg<AgentNodeConfig>({ instructions: v })} disabled={ro} /></Field>
        <div className="grid grid-cols-2 gap-2">
          <Field label="Skills"><div className="min-h-[30px] rounded-lg border border-dashed border-line px-2 py-1.5 text-[12px] text-muted">{skills.join(', ') || 'Connect a skill'}</div></Field>
          <Field label="Tools"><div className="min-h-[30px] rounded-lg border border-dashed border-line px-2 py-1.5 text-[12px] text-muted">{tools.join(', ') || 'Connect a tool'}</div></Field>
        </div>
        <Field label="Inputs"><Text value={c.inputs} onChange={(v) => cfg<AgentNodeConfig>({ inputs: v })} disabled={ro} /></Field>
        <Field label="Outputs"><Text value={c.outputs} onChange={(v) => cfg<AgentNodeConfig>({ outputs: v })} disabled={ro} /></Field>
        <Field label="Guardrails"><Text area value={c.guardrails} onChange={(v) => cfg<AgentNodeConfig>({ guardrails: v })} disabled={ro} /></Field>
      </>
    )
  } else if (n.kind === 'tool') {
    const c = n.config as ToolNodeConfig
    const def = byId(TOOLS, c.toolId)
    const perms: Permission[] = ['read', 'write', 'execute']
    body = (
      <>
        <Field label="Tool">
          <Select value={c.toolId} disabled={ro} options={TOOLS.map((t) => ({ v: t.id, l: t.name }))} onChange={(id) => {
            const t = byId(TOOLS, id)!
            patch({ label: t.name, config: { toolId: id, purpose: t.purpose, data: t.data, permissions: [...t.permissions] } })
          }} />
        </Field>
        <Field label="Purpose"><Text area value={c.purpose} onChange={(v) => cfg<ToolNodeConfig>({ purpose: v })} disabled={ro} /></Field>
        <Field label="Data accessed"><Text value={c.data} onChange={(v) => cfg<ToolNodeConfig>({ data: v })} disabled={ro} /></Field>
        <Field label="Permissions" hint="Least privilege: grant only what the job needs.">
          <div className="flex gap-1.5">
            {perms.map((p) => {
              const on = c.permissions.includes(p)
              return (
                <button key={p} disabled={ro} aria-pressed={on}
                  onClick={() => cfg<ToolNodeConfig>({ permissions: on ? c.permissions.filter((x) => x !== p) : [...c.permissions, p] })}
                  className={cn('flex-1 rounded-lg border px-2 py-1.5 text-[11px] font-bold uppercase tracking-wide transition-colors',
                    on ? (p === 'read' ? 'border-ok/50 bg-ok-soft text-ok' : 'border-warn/50 bg-warn-soft text-warn') : 'border-line text-subtle hover:text-fg')}>
                  {p}
                </button>
              )
            })}
          </div>
        </Field>
        <div className="rounded-lg bg-surface-2 px-3 py-2 text-[12px] text-muted">
          <span className="font-semibold text-fg">Read/write: </span>
          {c.permissions.length === 0 ? 'No access' : c.permissions.includes('write') ? 'Can change data' : c.permissions.includes('execute') ? 'Can trigger actions' : 'Read-only'}
          {def?.sensitive && <span className="mt-1 block text-bad">Contains sensitive personal data.</span>}
        </div>
      </>
    )
  } else if (n.kind === 'skill') {
    const c = n.config as SkillNodeConfig
    body = (
      <>
        <Field label="Skill">
          <Select value={c.skillId} disabled={ro} options={SKILLS.map((s) => ({ v: s.id, l: s.name }))} onChange={(id) => {
            const s = byId(SKILLS, id)!
            patch({ label: s.name, config: { skillId: id, description: s.description } })
          }} />
        </Field>
        <Field label="What it does"><Text area value={c.description} onChange={(v) => cfg<SkillNodeConfig>({ description: v })} disabled={ro} /></Field>
        <div className="rounded-lg bg-surface-2 px-3 py-2 text-[12px] text-muted"><span className="font-semibold text-fg">Use when: </span>{byId(SKILLS, c.skillId)?.useWhen}</div>
      </>
    )
  } else if (n.kind === 'qa') {
    const c = n.config as QaNodeConfig
    body = (
      <>
        <Field label="Validation rule" hint="Deterministic checks beat asking a model “does this look right?”."><Text area value={c.rule} onChange={(v) => cfg<QaNodeConfig>({ rule: v })} disabled={ro} /></Field>
        <Field label="Failure action">
          <Select<QaNodeConfig['failureAction']> value={c.failureAction} disabled={ro} onChange={(v) => cfg<QaNodeConfig>({ failureAction: v })}
            options={[{ v: 'retry', l: 'Retry the failing step' }, { v: 'fallback', l: 'Use fallback (last validated value)' }, { v: 'escalate', l: 'Escalate to a human' }, { v: 'block', l: 'Block the output' }]} />
        </Field>
        <Field label={`Retry behaviour · ${c.retries} ${c.retries === 1 ? 'retry' : 'retries'}`} hint="Bounded retries avoid infinite loops and runaway cost.">
          <input type="range" min={0} max={5} value={c.retries} disabled={ro} onChange={(e) => cfg<QaNodeConfig>({ retries: Number(e.target.value) })} className="w-full accent-[var(--accent)]" />
        </Field>
      </>
    )
  } else if (n.kind === 'approval') {
    const c = n.config as ApprovalNodeConfig
    body = (
      <>
        <Field label="Approval reason"><Text area value={c.reason} onChange={(v) => cfg<ApprovalNodeConfig>({ reason: v })} disabled={ro} /></Field>
        <Field label="Shown to reviewer"><Text area value={c.shows} onChange={(v) => cfg<ApprovalNodeConfig>({ shows: v })} disabled={ro} /></Field>
        <Field label="Approved action"><Text value={c.action} onChange={(v) => cfg<ApprovalNodeConfig>({ action: v })} disabled={ro} /></Field>
      </>
    )
  } else if (n.kind === 'orchestrator') {
    const c = n.config as OrchestratorNodeConfig
    body = (
      <>
        <Field label="Goal"><Text area value={c.goal} onChange={(v) => cfg<OrchestratorNodeConfig>({ goal: v })} disabled={ro} /></Field>
        <div className="rounded-lg bg-surface-2 px-3 py-2 text-[12px] text-muted">
          Agents connected directly below the orchestrator run <span className="font-semibold text-fg">in parallel</span>. Chain them to make them <span className="font-semibold text-fg">sequential</span>.
        </div>
      </>
    )
  } else if (n.kind === 'request') {
    body = <Field label="Request text"><Text area value={(n.config as RequestNodeConfig).text} onChange={(v) => cfg<RequestNodeConfig>({ text: v })} disabled={ro} /></Field>
  } else if (n.kind === 'output') {
    const c = n.config as OutputNodeConfig
    body = (
      <>
        <Field label="Format"><Text value={c.format} onChange={(v) => cfg<OutputNodeConfig>({ format: v })} disabled={ro} /></Field>
        <Field label="Distribution">
          <Select<OutputNodeConfig['distribution']> value={c.distribution} disabled={ro} onChange={(v) => cfg<OutputNodeConfig>({ distribution: v })}
            options={[{ v: 'none', l: 'Shown to requester only' }, { v: 'internal', l: 'Published internally' }, { v: 'email', l: 'Emailed out' }]} />
        </Field>
      </>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-2.5">
        <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-xl', KIND_STYLE[n.kind].tile)}><Icon name={meta.icon} size={18} /></span>
        <div className="min-w-0 flex-1">
          <input className="w-full bg-transparent font-display text-[15px] font-semibold outline-none focus:underline" value={n.label} disabled={ro || n.locked} onChange={(e) => patch({ label: e.target.value })} aria-label="Node name" />
          <div className="text-[11.5px] text-muted">{meta.blurb}</div>
        </div>
        <button onClick={onClose} className="rounded-lg p-1 text-muted hover:bg-surface-2" aria-label="Close inspector"><Icon name="x" size={16} /></button>
      </div>
      {body}
      <div className="border-t border-line pt-3">
        <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-subtle">Connections</div>
        <div className="space-y-1">
          {links.length === 0 && <div className="text-[12px] text-muted">Not connected yet. Drag from a handle, or use the picker below.</div>}
          {links.map((l) => (
            <div key={l.e.id} className="flex items-center gap-2 rounded-lg bg-surface-2 px-2 py-1 text-[12px]">
              <Icon name={l.out ? 'arrow-right' : 'arrow-left'} size={12} className="text-subtle" />
              <span className="flex-1 truncate">{l.other.label}</span>
              {!ro && (
                <button onClick={() => onChange({ ...graph, edges: graph.edges.filter((e) => e.id !== l.e.id) })} className="text-subtle hover:text-bad" aria-label={`Disconnect ${l.other.label}`}>
                  <Icon name="x" size={12} />
                </button>
              )}
            </div>
          ))}
        </div>
        {!ro && candidates.length > 0 && (
          <div className="mt-2 flex gap-1.5">
            <button onClick={() => setDir(dir === 'out' ? 'in' : 'out')} className="shrink-0 rounded-lg border border-line px-2 text-[11px] font-semibold text-muted hover:text-fg" title="Toggle direction" aria-label={dir === 'out' ? 'Direction: sends to' : 'Direction: receives from'}>
              {dir === 'out' ? 'to →' : '← from'}
            </button>
            <select className={input} value={connectTo} onChange={(e) => setConnectTo(e.target.value)} aria-label="Connect to node">
              <option value="">{dir === 'out' ? 'Send to…' : 'Receive from…'}</option>
              {candidates.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
            <Button size="sm" variant="secondary" onClick={connect} disabled={!connectTo} icon="plus">Link</Button>
          </div>
        )}
      </div>
      {!ro && !n.locked && (
        <Button variant="danger" size="sm" icon="trash" onClick={remove} className="w-full">Remove node</Button>
      )}
    </div>
  )
}
