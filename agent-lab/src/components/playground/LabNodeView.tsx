import { memo } from 'react'
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react'
import { TOOLS, byId } from '@/content/catalog'
import type { AgentNodeConfig, LabNode, QaNodeConfig, ToolNodeConfig } from '@/engine/graph'
import { KIND_META, SPECIALTY_PRESETS } from '@/engine/nodeFactory'
import { cn } from '@/lib/cn'
import { Icon } from '@/components/ui/Icon'
import { KIND_STYLE } from './kindStyles'

export type SimStatus = 'active' | 'done' | 'fail' | 'warn' | 'waiting'
export type LabFlowNode = Node<{ lab: LabNode; status?: SimStatus }, 'lab'>

function subtitle(n: LabNode) {
  switch (n.kind) {
    case 'agent': {
      const c = n.config as AgentNodeConfig
      return c.specialty === 'general' ? c.role || 'Agent' : SPECIALTY_PRESETS[c.specialty].role
    }
    case 'tool': {
      const c = n.config as ToolNodeConfig
      return c.permissions.map((p) => p.toUpperCase()).join(' · ') || 'no permissions'
    }
    case 'qa':
      return `On fail: ${(n.config as QaNodeConfig).failureAction}`
    case 'skill':
      return 'Skill'
    default:
      return KIND_META[n.kind].label
  }
}

export const LabNodeView = memo(function LabNodeView({ data, selected }: NodeProps<LabFlowNode>) {
  const n = data.lab
  const meta = KIND_META[n.kind]
  const style = KIND_STYLE[n.kind]
  const small = n.kind === 'tool' || n.kind === 'skill'
  const status = data.status
  const sensitive = n.kind === 'tool' && byId(TOOLS, (n.config as ToolNodeConfig).toolId)?.sensitive

  return (
    <div
      className={cn(
        'relative rounded-2xl border-2 bg-surface shadow-card transition-all duration-300',
        small ? 'min-w-[130px] px-2.5 py-1.5' : 'min-w-[176px] px-3 py-2.5',
        style.ring,
        selected && 'ring-2 ring-accent ring-offset-2 ring-offset-[var(--bg)]',
        status === 'active' && 'scale-[1.06] border-accent-2 shadow-[0_0_0_6px_var(--accent-2-soft),0_10px_30px_-8px_var(--accent-2)]',
        status === 'waiting' && 'scale-[1.06] border-warn shadow-[0_0_0_6px_var(--warn-soft)] animate-pulse',
        status === 'done' && 'border-ok/70',
        status === 'warn' && 'border-warn/70',
        status === 'fail' && 'border-bad shadow-[0_0_0_5px_var(--bad-soft)]',
      )}
    >
      <Handle type="target" position={Position.Top} />
      <div className="flex items-center gap-2">
        <span className={cn('flex shrink-0 items-center justify-center rounded-lg', small ? 'h-6 w-6' : 'h-8 w-8', style.tile)}>
          <Icon name={n.kind === 'tool' ? byId(TOOLS, (n.config as ToolNodeConfig).toolId)?.icon ?? meta.icon : meta.icon} size={small ? 13 : 16} />
        </span>
        <div className="min-w-0 leading-tight">
          <div className={cn('truncate font-semibold text-fg', small ? 'max-w-[120px] text-[11.5px]' : 'max-w-[150px] text-[13px]')}>{n.label}</div>
          <div className={cn('truncate text-[10px] font-medium uppercase tracking-wide', style.text)}>{subtitle(n)}</div>
        </div>
        {n.locked && <Icon name="lock" size={11} className="ml-auto shrink-0 text-subtle" />}
        {sensitive && <span className="ml-auto rounded bg-bad-soft px-1 text-[9px] font-bold text-bad">PII</span>}
      </div>
      {status && status !== 'active' && status !== 'waiting' && (
        <span
          className={cn(
            'absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full text-white shadow',
            status === 'done' && 'bg-ok',
            status === 'warn' && 'bg-warn',
            status === 'fail' && 'bg-bad',
          )}
        >
          <Icon name={status === 'done' ? 'check' : status === 'fail' ? 'x' : 'alert-triangle'} size={11} strokeWidth={3} />
        </span>
      )}
      <Handle type="source" position={Position.Bottom} />
    </div>
  )
})
