import { useCallback, useMemo, type DragEvent } from 'react'
import {
  Background, BackgroundVariant, Controls, MarkerType, MiniMap, ReactFlow, useReactFlow,
  type Connection, type Edge, type EdgeChange, type NodeChange,
} from '@xyflow/react'
import '@xyflow/react/dist/base.css'
import type { PaletteItem } from '@/content/types'
import { type LabGraph, isAttachment, nodeMap } from '@/engine/graph'
import { useUi } from '@/state/ui'
import { LabNodeView, type LabFlowNode, type SimStatus } from './LabNodeView'
import { tryConnect } from './connect'
import { createFromPalette } from '@/engine/palette'

const nodeTypes = { lab: LabNodeView }

export interface Highlight {
  nodes: Record<string, SimStatus>
  activeEdges: Set<string>
  doneEdges: Set<string>
}

export function FlowCanvas({
  graph,
  onChange,
  selectedId,
  onSelect,
  highlight,
  readOnly,
}: {
  graph: LabGraph
  onChange: (g: LabGraph) => void
  selectedId: string | null
  onSelect: (id: string | null) => void
  highlight?: Highlight
  readOnly?: boolean
}) {
  const { screenToFlowPosition } = useReactFlow()
  const pushToast = useUi((s) => s.pushToast)

  const nodes: LabFlowNode[] = useMemo(
    () =>
      graph.nodes.map((n) => ({
        id: n.id,
        type: 'lab',
        position: { x: n.x, y: n.y },
        data: { lab: n, status: highlight?.nodes[n.id] },
        selected: n.id === selectedId,
        deletable: !n.locked && !readOnly,
        draggable: !readOnly,
      })),
    [graph.nodes, highlight, selectedId, readOnly],
  )

  const edges: Edge[] = useMemo(() => {
    const m = nodeMap(graph)
    return graph.edges.map((e) => {
      const attach = isAttachment(m.get(e.target)!) || isAttachment(m.get(e.source)!)
      const cls = [attach ? 'edge-attach' : '', highlight?.activeEdges.has(e.id) ? 'edge-active' : highlight?.doneEdges.has(e.id) ? 'edge-done' : ''].join(' ')
      return {
        id: e.id,
        source: e.source,
        target: e.target,
        className: cls,
        style: attach ? { strokeDasharray: '4 4', opacity: 0.7 } : undefined,
        deletable: !readOnly,
        markerEnd: attach ? undefined : { type: MarkerType.ArrowClosed, width: 16, height: 16, color: 'var(--subtle)' },
      }
    })
  }, [graph, highlight, readOnly])

  const onNodesChange = useCallback(
    (changes: NodeChange<LabFlowNode>[]) => {
      let next = graph
      let changed = false
      for (const c of changes) {
        if (c.type === 'position' && c.position) {
          next = { ...next, nodes: next.nodes.map((n) => (n.id === c.id ? { ...n, x: c.position!.x, y: c.position!.y } : n)) }
          changed = true
        } else if (c.type === 'remove') {
          const n = next.nodes.find((x) => x.id === c.id)
          if (n?.locked) continue
          next = { nodes: next.nodes.filter((x) => x.id !== c.id), edges: next.edges.filter((e) => e.source !== c.id && e.target !== c.id) }
          if (selectedId === c.id) onSelect(null)
          changed = true
        } else if (c.type === 'select' && c.selected) {
          onSelect(c.id)
        }
      }
      if (changed) onChange(next)
    },
    [graph, onChange, onSelect, selectedId],
  )

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      const removed = new Set(changes.filter((c) => c.type === 'remove').map((c) => c.id))
      if (removed.size) onChange({ ...graph, edges: graph.edges.filter((e) => !removed.has(e.id)) })
    },
    [graph, onChange],
  )

  const onConnect = useCallback(
    (c: Connection) => {
      const r = tryConnect(graph, c.source, c.target)
      if (r.error) pushToast({ kind: 'info', title: 'Can’t connect those', detail: r.error, icon: 'info' })
      else if (r.edge) onChange({ ...graph, edges: [...graph.edges, r.edge] })
    },
    [graph, onChange, pushToast],
  )

  const onDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault()
      const raw = e.dataTransfer.getData('application/agent-lab')
      if (!raw || readOnly) return
      const item = JSON.parse(raw) as PaletteItem
      const pos = screenToFlowPosition({ x: e.clientX, y: e.clientY })
      const n = createFromPalette(item, pos.x - 80, pos.y - 20)
      onChange({ ...graph, nodes: [...graph.nodes, n] })
      onSelect(n.id)
    },
    [graph, onChange, onSelect, readOnly, screenToFlowPosition],
  )

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onPaneClick={() => onSelect(null)}
      onDrop={onDrop}
      onDragOver={(e) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = 'move'
      }}
      connectOnClick
      fitView
      fitViewOptions={{ padding: 0.2, maxZoom: 1.1 }}
      minZoom={0.3}
      maxZoom={1.8}
      deleteKeyCode={readOnly ? null : ['Backspace', 'Delete']}
      nodesConnectable={!readOnly}
    >
      <Background variant={BackgroundVariant.Dots} gap={20} size={1.2} color="var(--grid-dot)" />
      <Controls showInteractive={false} position="bottom-left" />
      <MiniMap pannable zoomable style={{ width: 150, height: 100 }} className="!hidden xl:!block" nodeColor={() => 'var(--surface-3)'} maskColor="color-mix(in oklab, var(--bg) 70%, transparent)" />
    </ReactFlow>
  )
}
