import { SKILLS, TOOLS, byId } from '@/content/catalog'
import { uid } from '@/lib/cn'
import type { ConfigByKind, LabNode, NodeKind, Specialty } from './graph'

export const KIND_META: Record<NodeKind, { label: string; icon: string; tone: string; blurb: string }> = {
  request: { label: 'User Request', icon: 'message-square', tone: 'slate', blurb: 'Where the work starts: the question or task.' },
  orchestrator: { label: 'Orchestrator', icon: 'network', tone: 'violet', blurb: 'Plans the work and delegates to specialists.' },
  agent: { label: 'Agent', icon: 'bot', tone: 'cyan', blurb: 'A specialist with one clear job.' },
  skill: { label: 'Skill', icon: 'sparkles', tone: 'amber', blurb: 'Reusable know-how: HOW to do a task.' },
  tool: { label: 'Tool', icon: 'wrench', tone: 'emerald', blurb: 'Equipment an agent can use: data, APIs, actions.' },
  qa: { label: 'QA Gate', icon: 'shield-check', tone: 'lime', blurb: 'Deterministic validation before results move on.' },
  approval: { label: 'Human Approval', icon: 'user-check', tone: 'rose', blurb: 'A person signs off before a risky action.' },
  output: { label: 'Output', icon: 'file-output', tone: 'sky', blurb: 'The final deliverable.' },
}

export const SPECIALTY_PRESETS: Record<Specialty, { label: string; role: string; goal: string; instructions: string; inputs: string; outputs: string; guardrails: string }> = {
  headcount: { label: 'Headcount Agent', role: 'Headcount specialist', goal: 'Return accurate headcount for any date and org filter.', instructions: 'Always use the workforce data tool. State the as-of date and filters.', inputs: 'Date, org filters', outputs: 'Headcount figures by requested dimension', guardrails: 'Aggregates only. Read-only.' },
  leavers: { label: 'Leavers Agent', role: 'Leavers specialist', goal: 'Return leaver counts split by voluntary / involuntary.', instructions: 'Use the HR data tool for terminations. Never estimate.', inputs: 'Period, org filters', outputs: 'Leaver counts and breakdowns', guardrails: 'No individual names. Read-only.' },
  analysis: { label: 'Analysis Agent', role: 'Workforce analyst', goal: 'Combine metrics and explain what is driving change.', instructions: 'Use approved skills for every calculation.', inputs: 'Headcount and leaver data', outputs: 'Rates, trends and drivers', guardrails: 'Flag low-confidence findings.' },
  reporting: { label: 'Reporting Agent', role: 'Executive report writer', goal: 'Turn validated analysis into a one-page executive brief.', instructions: 'Only use validated numbers. Plain English.', inputs: 'Validated analysis', outputs: 'Executive report', guardrails: 'No employee-level data in reports.' },
  research: { label: 'Research Agent', role: 'External research specialist', goal: 'Find public benchmarks and market context.', instructions: 'Cite sources. Mark anything unverified.', inputs: 'Topic', outputs: 'Benchmarks with sources', guardrails: 'Never send internal data to the web.' },
  qa: { label: 'QA Agent', role: 'Quality reviewer', goal: 'Check outputs for errors before they are used.', instructions: 'Reconcile numbers against the source of truth.', inputs: 'Draft results', outputs: 'Pass / fail with reasons', guardrails: 'Block anything that fails validation.' },
  general: { label: 'Agent', role: 'Assistant', goal: 'Complete the assigned task.', instructions: '', inputs: '', outputs: '', guardrails: '' },
}

function defaults<K extends NodeKind>(kind: K): { label: string; config: ConfigByKind[K] } {
  const d: { [P in NodeKind]: { label: string; config: ConfigByKind[P] } } = {
    request: { label: 'User Request', config: { text: 'Analyse voluntary attrition over the last 12 months and create an executive report.' } },
    orchestrator: { label: 'Orchestrator', config: { goal: 'Break the request into tasks and delegate to specialists.', strategy: 'parallel' } },
    agent: { label: 'Agent', config: { specialty: 'general', ...stripLabel(SPECIALTY_PRESETS.general) } },
    skill: { label: 'Skill', config: { skillId: '', description: '' } },
    tool: { label: 'Tool', config: { toolId: '', purpose: '', data: '', permissions: ['read'] } },
    qa: { label: 'QA Gate', config: { rule: 'Figures must reconcile to the source system (±0).', failureAction: 'retry', retries: 2 } },
    approval: { label: 'Human Approval', config: { reason: 'Report goes to the leadership team.', shows: 'Final report, data sources, QA result', action: 'Publish report' } },
    output: { label: 'Output', config: { format: 'Executive report', distribution: 'internal' } },
  }
  return d[kind] as { label: string; config: ConfigByKind[K] }
}

function stripLabel<T extends { label: string }>(p: T): Omit<T, 'label'> {
  const { label: _l, ...rest } = p
  return rest
}

export function createNode<K extends NodeKind>(kind: K, x = 0, y = 0, patch: Partial<ConfigByKind[K]> = {}, label?: string): LabNode<K> {
  const d = defaults(kind)
  return { id: uid(kind), kind, label: label ?? d.label, x, y, config: { ...d.config, ...patch } }
}

export function createAgent(specialty: Specialty, x = 0, y = 0, id?: string): LabNode<'agent'> {
  const p = SPECIALTY_PRESETS[specialty]
  const n = createNode('agent', x, y, { specialty, ...stripLabel(p) }, p.label)
  if (id) n.id = id
  return n
}

export function createTool(toolId: string, x = 0, y = 0, id?: string): LabNode<'tool'> {
  const t = byId(TOOLS, toolId)!
  const n = createNode('tool', x, y, { toolId, purpose: t.purpose, data: t.data, permissions: [...t.permissions] }, t.name)
  if (id) n.id = id
  return n
}

export function createSkill(skillId: string, x = 0, y = 0, id?: string): LabNode<'skill'> {
  const s = byId(SKILLS, skillId)!
  const n = createNode('skill', x, y, { skillId, description: s.description }, s.name)
  if (id) n.id = id
  return n
}

export function withId<N extends LabNode>(n: N, id: string): N {
  return { ...n, id }
}
