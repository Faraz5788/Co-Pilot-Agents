import { type LabEdge, type LabGraph, edgeId, isAttachment, nodeMap } from '@/engine/graph'

/** Validates a proposed connection and explains why it isn't allowed. */
export function tryConnect(g: LabGraph, source: string, target: string): { edge?: LabEdge; error?: string } {
  if (source === target) return { error: 'A node can’t connect to itself.' }
  const m = nodeMap(g)
  let s = m.get(source)
  let t = m.get(target)
  if (!s || !t) return { error: 'Unknown node.' }
  // Attachments always hang off the agent that uses them.
  if (isAttachment(s) && !isAttachment(t)) [s, t] = [t, s]
  if (isAttachment(s) && isAttachment(t)) return { error: 'Skills and tools attach to an agent, not to each other.' }
  if (isAttachment(t) && !(s.kind === 'agent' || s.kind === 'orchestrator'))
    return { error: `${t.kind === 'tool' ? 'Tools' : 'Skills'} are used by agents. Connect ${t.label} to an Agent or Orchestrator.` }
  if (t.kind === 'request') return { error: 'The User Request is the starting point — nothing flows into it.' }
  if (s.kind === 'output') return { error: 'Output is the end of the flow — nothing comes after it.' }
  if (g.edges.some((e) => (e.source === s!.id && e.target === t!.id) || (e.source === t!.id && e.target === s!.id)))
    return { error: 'Those nodes are already connected.' }
  return { edge: { id: edgeId(s.id, t.id), source: s.id, target: t.id } }
}
