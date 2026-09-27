import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react'
import { ReactFlowProvider, useReactFlow } from '@xyflow/react'
import type { PaletteItem } from '@/content/types'
import type { LabGraph } from '@/engine/graph'
import { reviewArchitecture } from '@/engine/evaluate'
import type { SimPlan } from '@/engine/simulation'
import { cn } from '@/lib/cn'
import { useProgress } from '@/state/progress'
import { Icon } from '@/components/ui/Icon'
import { FlowCanvas } from './FlowCanvas'
import { Inspector } from './Inspector'
import { Palette } from './Palette'
import { ReviewPanel } from './ReviewPanel'
import { SimPanel } from './SimPanel'
import { createFromPalette } from '@/engine/palette'
import { useSimPlayer, type PlayerStatus } from './useSimPlayer'

/** Nearest grid position to (x, y) that doesn't overlap an existing node. */
function freeSpot(g: LabGraph, x: number, y: number) {
  const W = 200
  const H = 80
  const taken = (px: number, py: number) => g.nodes.some((n) => Math.abs(n.x - px) < W && Math.abs(n.y - py) < H)
  const offsets: [number, number][] = []
  for (let dx = -3; dx <= 3; dx++) for (let dy = -5; dy <= 5; dy++) offsets.push([dx, dy])
  offsets.sort((a, b) => Math.hypot(a[0] * W, a[1] * H) - Math.hypot(b[0] * W, b[1] * H))
  for (const [dx, dy] of offsets) if (!taken(x + dx * W, y + dy * H)) return { x: x + dx * W, y: y + dy * H }
  return { x: x + 40, y: y + 40 }
}

export type PanelTab = 'mission' | 'inspect' | 'simulate' | 'review'

const TAB_META: Record<PanelTab, { label: string; icon: string }> = {
  mission: { label: 'Mission', icon: 'target' },
  inspect: { label: 'Inspect', icon: 'pencil' },
  simulate: { label: 'Simulate', icon: 'play' },
  review: { label: 'Review', icon: 'gauge' },
}

export interface WorkbenchProps {
  graph: LabGraph
  onChange: (g: LabGraph) => void
  palette: PaletteItem[]
  tabs: PanelTab[]
  missionPanel?: ReactNode
  defaultRequest?: string
  faultDefault?: boolean
  faultLocked?: boolean
  onSimFinish?: (plan: SimPlan, status: PlayerStatus, fault: boolean) => void
  className?: string
  canvasClassName?: string
  tab?: PanelTab
  onTabChange?: (t: PanelTab) => void
}

function Inner(p: WorkbenchProps) {
  const { graph, onChange, palette, tabs } = p
  const [selected, setSelected] = useState<string | null>(null)
  const [localTab, setLocalTab] = useState<PanelTab>(tabs[0])
  const tab = p.tab ?? localTab
  const setTab = (t: PanelTab) => (p.onTabChange ? p.onTabChange(t) : setLocalTab(t))
  const [fault, setFault] = useState(!!p.faultDefault)
  const faultRef = useRef(fault)
  faultRef.current = fault
  const bump = useProgress((s) => s.bump)
  const rf = useReactFlow()
  const canvasRef = useRef<HTMLDivElement>(null)

  const finish = useCallback(
    (plan: SimPlan, status: PlayerStatus) => {
      bump('simulations')
      if (faultRef.current && plan.faultCaught) bump('faultsCaught')
      p.onSimFinish?.(plan, status, faultRef.current)
    },
    [bump, p],
  )
  const sim = useSimPlayer(graph, finish)
  const review = useMemo(() => (tabs.includes('review') ? reviewArchitecture(graph) : null), [graph, tabs])

  const select = (id: string | null) => {
    setSelected(id)
    if (id && tabs.includes('inspect') && tab !== 'simulate' && id !== selected) setTab('inspect')
  }

  const add = (item: PaletteItem) => {
    const rect = canvasRef.current?.getBoundingClientRect()
    const center = rect ? rf.screenToFlowPosition({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }) : { x: 0, y: 0 }
    const { x, y } = freeSpot(graph, center.x - 80, center.y - 20)
    const n = createFromPalette(item, x, y)
    onChange({ ...graph, nodes: [...graph.nodes, n] })
    setSelected(n.id)
    // Keep the mission checklist in view while building; otherwise show the new node's settings.
    if (tabs.includes('inspect') && tab !== 'mission' && tab !== 'simulate') setTab('inspect')
  }

  const running = sim.status === 'running' || sim.status === 'awaiting'

  return (
    <div className={cn('flex flex-col gap-3 lg:flex-row', p.className)}>
      {/* Palette */}
      <details className="group rounded-2xl border border-line bg-surface/70 lg:hidden">
        <summary className="flex cursor-pointer list-none items-center gap-2 px-3 py-2.5 text-sm font-bold">
          <Icon name="plus" size={16} className="text-accent" /> Add components
          <Icon name="chevron-down" size={16} className="ml-auto text-subtle transition-transform group-open:rotate-180" />
        </summary>
        <div className="border-t border-line p-3">
          <Palette items={palette} onAdd={add} horizontal />
        </div>
      </details>
      <aside className="hidden w-52 shrink-0 overflow-y-auto rounded-2xl border border-line bg-surface/70 p-3 scrollbar-thin lg:block" aria-label="Components">
        <div className="mb-3 flex items-center gap-1.5 text-xs font-bold"><Icon name="layers" size={14} className="text-accent" /> Components</div>
        <Palette items={palette} onAdd={add} />
        <p className="mt-3 text-[11px] leading-snug text-subtle">Click or drag to add. Connect nodes by dragging from the bottom handle to another node’s top handle (or tap one handle, then the other).</p>
      </aside>

      {/* Canvas */}
      <div ref={canvasRef} className={cn('relative min-h-[420px] flex-1 overflow-hidden rounded-2xl border border-line bg-surface/40', p.canvasClassName)}>
        <div className="absolute inset-0">
          <FlowCanvas graph={graph} onChange={running ? () => undefined : onChange} selectedId={selected} onSelect={select} highlight={sim.highlight} readOnly={running} />
        </div>
        {running && (
          <div className="pointer-events-none absolute left-3 top-3 flex items-center gap-2 rounded-full border border-accent-2/40 bg-surface/90 px-3 py-1 text-xs font-semibold text-accent-2 shadow-card">
            <span className="h-2 w-2 animate-pulse rounded-full bg-accent-2" /> Simulating…
          </div>
        )}
      </div>

      {/* Side panel */}
      <aside className="flex w-full shrink-0 flex-col rounded-2xl border border-line bg-surface lg:w-[340px]">
        <div className="flex border-b border-line p-1.5" role="tablist">
          {tabs.map((t) => (
            <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)}
              className={cn('flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-[12.5px] font-semibold transition-colors', tab === t ? 'bg-accent-soft text-fg' : 'text-muted hover:text-fg')}>
              <Icon name={TAB_META[t].icon} size={14} /> {TAB_META[t].label}
            </button>
          ))}
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-4 scrollbar-thin">
          {tab === 'mission' && p.missionPanel}
          {tab === 'inspect' &&
            (selected && graph.nodes.some((n) => n.id === selected) ? (
              <Inspector graph={graph} nodeId={selected} onChange={onChange} onClose={() => setSelected(null)} readOnly={running} />
            ) : (
              <div className="py-8 text-center text-sm text-muted">
                <Icon name="pointer" size={28} className="mx-auto mb-2 text-accent" />
                Select a node on the canvas to configure it.
              </div>
            ))}
          {tab === 'simulate' && (
            <SimPanel
              plan={sim.plan}
              index={sim.index}
              status={sim.status}
              onRun={(req, f) => { setSelected(null); sim.run({ request: req, injectFault: f }) }}
              onApprove={sim.approve}
              onReject={sim.reject}
              onReset={sim.reset}
              defaultRequest={p.defaultRequest ?? (graph.nodes.find((n) => n.kind === 'request')?.config as { text?: string })?.text ?? ''}
              fault={fault}
              onFaultChange={setFault}
              faultLocked={p.faultLocked}
            />
          )}
          {tab === 'review' && review && <ReviewPanel review={review} />}
        </div>
      </aside>
    </div>
  )
}

export function Workbench(props: WorkbenchProps) {
  return (
    <ReactFlowProvider>
      <Inner {...props} />
    </ReactFlowProvider>
  )
}
