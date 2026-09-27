import { useEffect, useState, type ReactNode } from 'react'
import type { VisualId } from '@/content/types'
import { cn } from '@/lib/cn'
import { Icon } from '@/components/ui/Icon'
import type { Tone } from '@/components/ui/primitives'

const toneCls: Record<Tone, string> = {
  accent: 'border-accent/40 bg-accent-soft text-accent',
  cyan: 'border-accent-2/40 bg-accent-2-soft text-accent-2',
  ok: 'border-ok/40 bg-ok-soft text-ok',
  warn: 'border-warn/40 bg-warn-soft text-warn',
  bad: 'border-bad/40 bg-bad-soft text-bad',
  neutral: 'border-line-strong bg-surface-2 text-muted',
  gold: 'border-gold/40 text-gold',
}

function Box({ icon, label, sub, tone = 'neutral', className, active }: { icon: string; label: string; sub?: string; tone?: Tone; className?: string; active?: boolean }) {
  return (
    <div className={cn('flex items-center gap-2 rounded-xl border px-3 py-2 transition-all duration-300', toneCls[tone], active && 'scale-105 shadow-[0_0_0_4px_var(--accent-soft)]', className)}>
      <Icon name={icon} size={16} className="shrink-0" />
      <div className="min-w-0 leading-tight">
        <div className="text-[13px] font-semibold text-fg">{label}</div>
        {sub && <div className="text-[11px] text-muted">{sub}</div>}
      </div>
    </div>
  )
}

const Arrow = ({ dir = 'right', className }: { dir?: 'right' | 'down'; className?: string }) => (
  <Icon name={dir === 'right' ? 'arrow-right' : 'arrow-down'} size={16} className={cn('shrink-0 text-subtle', className)} />
)

function Frame({ children, caption }: { children: ReactNode; caption?: string }) {
  return (
    <figure className="rounded-2xl border border-line bg-surface-2/60 p-4 dot-grid sm:p-5">
      {children}
      {caption && <figcaption className="mt-3 text-center text-xs text-subtle">{caption}</figcaption>}
    </figure>
  )
}

function useTicker(n: number, ms = 1100) {
  const [i, setI] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setI((x) => (x + 1) % n), ms)
    return () => clearInterval(t)
  }, [n, ms])
  return i
}

function LlmVsAgent() {
  return (
    <Frame caption="Same model inside. The agent adds a goal, tools and a loop.">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-line bg-surface p-3">
          <div className="mb-3 text-[11px] font-bold uppercase tracking-widest text-subtle">LLM on its own</div>
          <div className="flex flex-col items-stretch gap-2">
            <Box icon="message-square" label="Prompt" sub="“What’s our headcount?”" />
            <Arrow dir="down" className="self-center" />
            <Box icon="brain" label="Model" sub="Predicts text from training" tone="accent" />
            <Arrow dir="down" className="self-center" />
            <Box icon="alert-triangle" label="“Probably around 10,000”" sub="A guess — no data" tone="warn" />
          </div>
        </div>
        <div className="rounded-xl border border-accent/30 bg-surface p-3">
          <div className="mb-3 text-[11px] font-bold uppercase tracking-widest text-accent">Agent</div>
          <div className="flex flex-col items-stretch gap-2">
            <Box icon="target" label="Goal" sub="Answer with approved data" />
            <Arrow dir="down" className="self-center" />
            <div className="flex items-center gap-2">
              <Box icon="repeat" label="Model + loop" sub="Plan · act · check" tone="accent" className="flex-1" />
              <Icon name="repeat" size={14} className="text-subtle" />
              <Box icon="database" label="HR DB" tone="ok" />
            </div>
            <Arrow dir="down" className="self-center" />
            <Box icon="check-circle" label="“10,450 on 31 Aug 2026”" sub="Grounded in a tool result" tone="ok" />
          </div>
        </div>
      </div>
    </Frame>
  )
}

function AgentLoop() {
  const steps = [
    { icon: 'eye', label: 'Perceive' },
    { icon: 'list-checks', label: 'Plan' },
    { icon: 'wrench', label: 'Act' },
    { icon: 'scan-search', label: 'Observe' },
    { icon: 'check-circle', label: 'Check' },
  ]
  const i = useTicker(steps.length)
  return (
    <Frame caption="The loop repeats until the goal is met — or the agent decides it needs help.">
      <div className="relative mx-auto aspect-square w-full max-w-[300px]">
        <div className="absolute inset-[18%] rounded-full border-2 border-dashed border-line-strong" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center rounded-2xl border border-accent/40 bg-surface px-4 py-3 text-center shadow-card">
            <Icon name="target" size={20} className="text-accent" />
            <div className="mt-1 text-sm font-bold">Goal</div>
            <div className="text-[11px] text-muted">Is it done?</div>
          </div>
        </div>
        {steps.map((s, k) => {
          const a = (k / steps.length) * Math.PI * 2 - Math.PI / 2
          const x = 50 + Math.cos(a) * 40
          const y = 50 + Math.sin(a) * 40
          return (
            <div key={s.label} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${x}%`, top: `${y}%` }}>
              <Box icon={s.icon} label={s.label} tone={k === i ? 'cyan' : 'neutral'} active={k === i} className="px-2.5 py-1.5" />
            </div>
          )
        })}
      </div>
    </Frame>
  )
}

function AgentAnatomy() {
  const rows: [string, string, string][] = [
    ['user', 'Name & role', 'HR Data Analyst'],
    ['target', 'Goal', 'Accurate workforce answers'],
    ['scroll-text', 'Instructions', 'Always cite date & filters'],
    ['wrench', 'Tools', 'Power BI model (read)'],
    ['sparkles', 'Skills', 'Headcount Analysis'],
    ['arrow-right', 'Inputs → Outputs', 'Question → short answer'],
    ['shield', 'Guardrails', 'No personal data'],
  ]
  return (
    <Frame caption="Like a job description: every field is something you can test.">
      <div className="mx-auto max-w-md overflow-hidden rounded-xl border border-line bg-surface">
        <div className="flex items-center gap-2 border-b border-line bg-accent-soft px-3 py-2">
          <Icon name="bot" size={16} className="text-accent" />
          <span className="text-sm font-bold">agent.spec</span>
        </div>
        {rows.map(([icon, k, v]) => (
          <div key={k} className="flex items-center gap-3 border-b border-line px-3 py-2 last:border-0">
            <Icon name={icon} size={14} className="text-subtle" />
            <span className="w-32 shrink-0 text-xs font-semibold text-muted">{k}</span>
            <span className="text-[13px]">{v}</span>
          </div>
        ))}
      </div>
    </Frame>
  )
}

function WhoHowWhatRules() {
  const q = [
    { icon: 'bot', k: 'WHO', t: 'Agent', ex: 'Leavers Specialist', tone: 'cyan' as Tone },
    { icon: 'sparkles', k: 'HOW', t: 'Skill', ex: 'Attrition Calculation', tone: 'warn' as Tone },
    { icon: 'wrench', k: 'WHAT IT CAN USE', t: 'Tool', ex: 'Power BI model', tone: 'ok' as Tone },
    { icon: 'scroll-text', k: 'RULES', t: 'Instruction', ex: 'Round to 1 decimal place', tone: 'accent' as Tone },
  ]
  return (
    <Frame>
      <div className="grid grid-cols-2 gap-3">
        {q.map((x) => (
          <div key={x.k} className={cn('rounded-xl border p-3', toneCls[x.tone])}>
            <div className="flex items-center gap-2">
              <Icon name={x.icon} size={18} />
              <span className="text-[11px] font-bold tracking-widest">{x.k}</span>
            </div>
            <div className="mt-2 font-display text-lg font-bold text-fg">{x.t}</div>
            <div className="text-xs text-muted">e.g. {x.ex}</div>
          </div>
        ))}
      </div>
    </Frame>
  )
}

function MegaVsModular() {
  return (
    <Frame caption="Same content — but now each part can be tested, reused and changed on its own.">
      <div className="flex flex-col items-center gap-3 sm:flex-row">
        <div className="w-full flex-1 rounded-xl border border-bad/30 bg-surface p-3">
          <div className="mb-2 flex items-center gap-2 text-xs font-bold text-bad"><Icon name="file-warning" size={14} /> mega_prompt.txt</div>
          {[92, 100, 84, 97, 70, 95, 88, 60].map((w, i) => (
            <div key={i} className="mb-1.5 h-1.5 rounded-full bg-surface-3" style={{ width: `${w}%` }} />
          ))}
        </div>
        <Arrow className="rotate-90 sm:rotate-0" />
        <div className="grid w-full flex-1 grid-cols-2 gap-2">
          <Box icon="bot" label="Agent" tone="cyan" />
          <Box icon="scroll-text" label="Instructions" tone="accent" />
          <Box icon="sparkles" label="Skills" tone="warn" />
          <Box icon="wrench" label="Tools" tone="ok" />
        </div>
      </div>
    </Frame>
  )
}

function Orchestration() {
  const i = useTicker(4, 900)
  return (
    <Frame caption="The orchestrator plans and delegates. Independent tasks run in parallel.">
      <div className="flex flex-col items-center gap-2">
        <Box icon="network" label="Orchestrator" tone="accent" active={i === 0} />
        <Arrow dir="down" />
        <div className="flex flex-wrap justify-center gap-2">
          <Box icon="users" label="Headcount" tone={i === 1 ? 'cyan' : 'neutral'} active={i === 1} />
          <Box icon="door-open" label="Leavers" tone={i === 1 ? 'cyan' : 'neutral'} active={i === 1} />
        </div>
        <Arrow dir="down" />
        <Box icon="shield-check" label="QA" tone={i === 2 ? 'ok' : 'neutral'} active={i === 2} />
        <Arrow dir="down" />
        <Box icon="file-text" label="Reporting" tone={i === 3 ? 'cyan' : 'neutral'} active={i === 3} />
      </div>
    </Frame>
  )
}

function Mcp() {
  return (
    <Frame caption="MCP is the standard socket: any agent can discover and use any compatible tool.">
      <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <Box icon="bot" label="Agent" sub="The worker" tone="cyan" />
        <Arrow className="rotate-90 sm:rotate-0" />
        <div className="rounded-xl border-2 border-dashed border-accent/50 bg-accent-soft px-4 py-3 text-center">
          <Icon name="plug" size={20} className="mx-auto text-accent" />
          <div className="mt-1 text-sm font-bold">MCP</div>
          <div className="text-[11px] text-muted">“What equipment is here?<br />How do I use it?”</div>
        </div>
        <Arrow className="rotate-90 sm:rotate-0" />
        <div className="flex flex-col gap-2">
          <Box icon="database" label="HR Database" tone="ok" />
          <Box icon="bar-chart" label="Power BI" tone="ok" />
          <Box icon="folder" label="SharePoint" tone="ok" />
        </div>
      </div>
    </Frame>
  )
}

function Permissions() {
  const layers = [
    { icon: 'scroll-text', t: 'Instructions', d: '“Never share salaries.” Shapes behaviour.', s: 'Soft', tone: 'accent' as Tone },
    { icon: 'lock', t: 'Permissions', d: 'No payroll access at all. Removes capability.', s: 'Hard', tone: 'ok' as Tone },
    { icon: 'user-check', t: 'Approval gate', d: 'A person signs off on sending.', s: 'Human', tone: 'warn' as Tone },
  ]
  return (
    <Frame caption="Defence in depth: each layer catches what the one above can miss.">
      <div className="flex flex-col gap-2">
        {layers.map((l, k) => (
          <div key={l.t} className={cn('flex items-center gap-3 rounded-xl border p-3', toneCls[l.tone])} style={{ marginLeft: k * 14, marginRight: k * 14 }}>
            <Icon name={l.icon} size={18} />
            <div className="flex-1">
              <div className="text-sm font-bold text-fg">{l.t}</div>
              <div className="text-xs text-muted">{l.d}</div>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest">{l.s}</span>
          </div>
        ))}
      </div>
    </Frame>
  )
}

function ReliabilityStack() {
  const items = [
    { icon: 'shield-check', t: 'Validate', d: 'Deterministic checks against the source' },
    { icon: 'repeat', t: 'Retry', d: 'Try again — a limited number of times' },
    { icon: 'route', t: 'Fallback', d: 'A safe alternative path' },
    { icon: 'alert-triangle', t: 'Escalate', d: 'Hand to a human with context' },
    { icon: 'activity', t: 'Observe', d: 'Log every step so failures are visible' },
  ]
  return (
    <Frame>
      <div className="grid gap-2 sm:grid-cols-5">
        {items.map((x, k) => (
          <div key={x.t} className="rounded-xl border border-line bg-surface p-3 text-center">
            <div className="mx-auto mb-1 flex h-8 w-8 items-center justify-center rounded-lg bg-ok-soft text-ok"><Icon name={x.icon} size={16} /></div>
            <div className="text-[11px] font-bold text-subtle">{k + 1}</div>
            <div className="text-sm font-bold">{x.t}</div>
            <div className="text-[11px] text-muted">{x.d}</div>
          </div>
        ))}
      </div>
    </Frame>
  )
}

function GovernanceGates() {
  const r = [
    { risk: 'Low', ex: 'Summarise aggregate headcount for a manager', d: 'ALLOW', tone: 'ok' as Tone, icon: 'check' },
    { risk: 'Medium', ex: 'Email a report to the leadership team', d: 'REQUIRE APPROVAL', tone: 'warn' as Tone, icon: 'user-check' },
    { risk: 'High', ex: 'Send employee-level pay data to a mailing list', d: 'DENY', tone: 'bad' as Tone, icon: 'ban' },
  ]
  return (
    <Frame caption="Match the control to the consequence — not every action needs a human, but some must never happen.">
      <div className="flex flex-col gap-2">
        {r.map((x) => (
          <div key={x.risk} className="flex items-center gap-3 rounded-xl border border-line bg-surface p-3">
            <span className={cn('w-16 shrink-0 rounded-md border px-2 py-1 text-center text-[11px] font-bold', toneCls[x.tone])}>{x.risk}</span>
            <span className="flex-1 text-sm">{x.ex}</span>
            <span className={cn('flex items-center gap-1 text-[11px] font-bold', toneCls[x.tone], 'border-0 bg-transparent')}><Icon name={x.icon} size={14} />{x.d}</span>
          </div>
        ))}
      </div>
    </Frame>
  )
}

const MAP: Record<VisualId, () => ReactNode> = {
  'llm-vs-agent': LlmVsAgent,
  'agent-loop': AgentLoop,
  'agent-anatomy': AgentAnatomy,
  'who-how-what-rules': WhoHowWhatRules,
  'mega-vs-modular': MegaVsModular,
  orchestration: Orchestration,
  mcp: Mcp,
  permissions: Permissions,
  'reliability-stack': ReliabilityStack,
  'governance-gates': GovernanceGates,
}

export function Visual({ id }: { id: VisualId }) {
  const C = MAP[id]
  return <C />
}
