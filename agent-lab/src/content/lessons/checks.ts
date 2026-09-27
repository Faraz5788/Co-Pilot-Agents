/** Reusable architecture checks for challenge definitions. */
import { TOOLS, byId } from '../catalog'
import {
  type LabGraph, type LabNode, type QaNodeConfig, type Specialty,
  agentsBySpecialty, downstream, flowEdges, nodesOfKind, skillsOf, successors, toolsOf,
} from '@/engine/graph'

export const any = (g: LabGraph, s: Specialty) => agentsBySpecialty(g, s)
export const qaNodes = (g: LabGraph): LabNode[] => [...nodesOfKind(g, 'qa'), ...agentsBySpecialty(g, 'qa')]

export const isBefore = (g: LabGraph, a: LabNode[], b: LabNode[]) => a.length > 0 && b.length > 0 && a.some((x) => b.some((y) => downstream(g, x.id).has(y.id)))

export function parallelData(g: LabGraph) {
  const hc = any(g, 'headcount')
  const lv = any(g, 'leavers')
  if (!hc.length || !lv.length) return false
  return !downstream(g, hc[0].id).has(lv[0].id) && !downstream(g, lv[0].id).has(hc[0].id)
}

export function qaGuardsData(g: LabGraph) {
  const data = [...any(g, 'headcount'), ...any(g, 'leavers')]
  return qaNodes(g).some((q) => data.length >= 2 && data.every((d) => downstream(g, d.id).has(q.id)))
}

export function qaBeforeReporting(g: LabGraph) {
  const rep = any(g, 'reporting')
  return qaNodes(g).some((q) => rep.some((r) => downstream(g, q.id).has(r.id)))
}

export function dataAgentsHaveTools(g: LabGraph) {
  const data = [...any(g, 'headcount'), ...any(g, 'leavers')]
  return data.length >= 2 && data.every((d) => toolsOf(g, d.id).some((t) => byId(TOOLS, t.config.toolId)?.workforceData))
}

export function usesSkill(g: LabGraph, skillId: string) {
  return nodesOfKind(g, 'agent').some((a) => skillsOf(g, a.id).some((s) => s.config.skillId === skillId))
}

export function orchestratorDelegates(g: LabGraph) {
  return nodesOfKind(g, 'orchestrator').some((o) => {
    const kids = successors(g, o.id).filter((k) => k.kind === 'agent').map((k) => (k.config as { specialty: Specialty }).specialty)
    return kids.includes('headcount') && kids.includes('leavers')
  })
}

export function requestToOrchestrator(g: LabGraph) {
  const req = nodesOfKind(g, 'request')
  const orch = nodesOfKind(g, 'orchestrator')
  return flowEdges(g).some((e) => req.some((r) => r.id === e.source) && orch.some((o) => o.id === e.target))
}

export function reachesOutput(g: LabGraph, from: LabNode[]) {
  const out = nodesOfKind(g, 'output')
  return from.some((f) => out.some((o) => downstream(g, f.id).has(o.id)))
}

export function qaRetries(g: LabGraph) {
  return nodesOfKind(g, 'qa').some((q) => (q.config as QaNodeConfig).failureAction === 'retry' && (q.config as QaNodeConfig).retries >= 1)
}
