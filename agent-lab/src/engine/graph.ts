/**
 * Framework-agnostic model of an agent architecture. The canvas (React Flow)
 * converts to/from this shape so simulation and evaluation stay pure & testable.
 */
import type { Permission } from '@/content/catalog'

export type NodeKind = 'request' | 'orchestrator' | 'agent' | 'skill' | 'tool' | 'qa' | 'approval' | 'output'

export type Specialty = 'headcount' | 'leavers' | 'analysis' | 'reporting' | 'research' | 'qa' | 'general'

export interface AgentNodeConfig {
  specialty: Specialty
  role: string
  goal: string
  instructions: string
  inputs: string
  outputs: string
  guardrails: string
}
export interface ToolNodeConfig {
  toolId: string
  purpose: string
  data: string
  permissions: Permission[]
}
export interface SkillNodeConfig { skillId: string; description: string }
export interface QaNodeConfig { rule: string; failureAction: 'retry' | 'fallback' | 'escalate' | 'block'; retries: number }
export interface ApprovalNodeConfig { reason: string; shows: string; action: string }
export interface OrchestratorNodeConfig { goal: string; strategy: 'parallel' | 'sequential' }
export interface RequestNodeConfig { text: string }
export interface OutputNodeConfig { format: string; distribution: 'none' | 'internal' | 'email' }

export interface ConfigByKind {
  request: RequestNodeConfig
  orchestrator: OrchestratorNodeConfig
  agent: AgentNodeConfig
  skill: SkillNodeConfig
  tool: ToolNodeConfig
  qa: QaNodeConfig
  approval: ApprovalNodeConfig
  output: OutputNodeConfig
}

export interface LabNode<K extends NodeKind = NodeKind> {
  id: string
  kind: K
  label: string
  x: number
  y: number
  config: ConfigByKind[K]
  /** Starter nodes in a challenge can be locked in place. */
  locked?: boolean
}

export interface LabEdge {
  id: string
  source: string
  target: string
}

export interface LabGraph {
  nodes: LabNode[]
  edges: LabEdge[]
}

export const FLOW_KINDS: NodeKind[] = ['request', 'orchestrator', 'agent', 'qa', 'approval', 'output']
export const ATTACH_KINDS: NodeKind[] = ['skill', 'tool']

export const isFlow = (n: LabNode) => FLOW_KINDS.includes(n.kind)
export const isAttachment = (n: LabNode) => ATTACH_KINDS.includes(n.kind)

export const edgeId = (s: string, t: string) => `e_${s}__${t}`

export function nodeMap(g: LabGraph) {
  return new Map(g.nodes.map((n) => [n.id, n]))
}

/** Edges between flow nodes only, i.e. the execution path. */
export function flowEdges(g: LabGraph) {
  const m = nodeMap(g)
  return g.edges.filter((e) => {
    const s = m.get(e.source)
    const t = m.get(e.target)
    return s && t && isFlow(s) && isFlow(t)
  })
}

/** Skills and tools connected (either direction) to a given node. */
export function attachmentsOf(g: LabGraph, nodeId: string) {
  const m = nodeMap(g)
  const ids = g.edges.flatMap((e) => (e.source === nodeId ? [e.target] : e.target === nodeId ? [e.source] : []))
  return ids.map((id) => m.get(id)).filter((n): n is LabNode => !!n && isAttachment(n))
}

export function toolsOf(g: LabGraph, nodeId: string) {
  return attachmentsOf(g, nodeId).filter((n): n is LabNode<'tool'> => n.kind === 'tool')
}
export function skillsOf(g: LabGraph, nodeId: string) {
  return attachmentsOf(g, nodeId).filter((n): n is LabNode<'skill'> => n.kind === 'skill')
}

export function successors(g: LabGraph, id: string) {
  const m = nodeMap(g)
  return flowEdges(g).filter((e) => e.source === id).map((e) => m.get(e.target)!)
}
export function predecessors(g: LabGraph, id: string) {
  const m = nodeMap(g)
  return flowEdges(g).filter((e) => e.target === id).map((e) => m.get(e.source)!)
}

/** All flow nodes reachable downstream of `id` (excluding itself). */
export function downstream(g: LabGraph, id: string): Set<string> {
  const seen = new Set<string>()
  const stack = [id]
  while (stack.length) {
    const cur = stack.pop()!
    for (const n of successors(g, cur)) {
      if (!seen.has(n.id)) {
        seen.add(n.id)
        stack.push(n.id)
      }
    }
  }
  return seen
}

export function hasCycle(g: LabGraph) {
  const edges = flowEdges(g)
  const indeg = new Map<string, number>()
  const flowNodes = g.nodes.filter(isFlow)
  flowNodes.forEach((n) => indeg.set(n.id, 0))
  edges.forEach((e) => indeg.set(e.target, (indeg.get(e.target) ?? 0) + 1))
  const q = flowNodes.filter((n) => indeg.get(n.id) === 0).map((n) => n.id)
  let visited = 0
  while (q.length) {
    const id = q.shift()!
    visited++
    edges.filter((e) => e.source === id).forEach((e) => {
      indeg.set(e.target, indeg.get(e.target)! - 1)
      if (indeg.get(e.target) === 0) q.push(e.target)
    })
  }
  return visited !== flowNodes.length
}

export const agentsBySpecialty = (g: LabGraph, s: Specialty) =>
  g.nodes.filter((n): n is LabNode<'agent'> => n.kind === 'agent' && (n.config as AgentNodeConfig).specialty === s)

export const nodesOfKind = <K extends NodeKind>(g: LabGraph, k: K) => g.nodes.filter((n): n is LabNode<K> => n.kind === k)
