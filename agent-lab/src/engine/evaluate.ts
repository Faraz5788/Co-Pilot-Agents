/**
 * Principle-based architecture review. There is no single right answer:
 * each dimension scores the design against a principle and explains why.
 */
import { TOOLS, byId } from '@/content/catalog'
import {
  type AgentNodeConfig, type LabGraph, type LabNode, type QaNodeConfig,
  agentsBySpecialty, downstream, flowEdges, hasCycle, isFlow, nodesOfKind, predecessors, skillsOf, successors, toolsOf,
} from './graph'

export interface Finding { tone: 'good' | 'tip' | 'issue'; text: string }
export interface Dimension { id: string; label: string; icon: string; score: number; findings: Finding[] }
export interface Review { overall: number; dimensions: Dimension[]; headline: string }

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)))

export function reviewArchitecture(g: LabGraph): Review {
  const agents = nodesOfKind(g, 'agent')
  const orchestrators = nodesOfKind(g, 'orchestrator')
  const qas = [...nodesOfKind(g, 'qa'), ...agentsBySpecialty(g, 'qa')]
  const approvals = nodesOfKind(g, 'approval')
  const outputs = nodesOfKind(g, 'output')
  const tools = nodesOfKind(g, 'tool')
  const hc = agentsBySpecialty(g, 'headcount')
  const lv = agentsBySpecialty(g, 'leavers')
  const reporting = agentsBySpecialty(g, 'reporting')
  const dataAgents = [...hc, ...lv]
  const toolDef = (t: LabNode<'tool'>) => byId(TOOLS, t.config.toolId)
  const hasSkill = (id: string) => agents.some((a) => skillsOf(g, a.id).some((s) => s.config.skillId === id)) || orchestrators.some((o) => skillsOf(g, o.id).some((s) => s.config.skillId === id))

  /* 1. Separation of responsibilities */
  const sep: Finding[] = []
  let s1 = 0
  if (orchestrators.length) { s1 += 30; sep.push({ tone: 'good', text: 'An orchestrator coordinates the work instead of one agent doing everything.' }) }
  else sep.push({ tone: 'issue', text: 'No orchestrator. Who decides which specialist does what, and in what order?' })
  if (hc.length && lv.length) { s1 += 30; sep.push({ tone: 'good', text: 'Headcount and leavers are handled by separate specialists.' }) }
  else sep.push({ tone: 'issue', text: 'Add dedicated Headcount and Leavers agents — each with one clear job.' })
  if (reporting.length) { s1 += 20; sep.push({ tone: 'good', text: 'Reporting is its own step, separate from data retrieval.' }) }
  else sep.push({ tone: 'tip', text: 'A Reporting agent keeps presentation separate from analysis.' })
  const overloaded = agents.filter((a) => toolsOf(g, a.id).length > 2)
  if (overloaded.length) sep.push({ tone: 'tip', text: `${overloaded.map((a) => a.label).join(', ')} has a lot of tools — is it doing more than one job?` })
  else s1 += 10
  const specs = agents.map((a) => (a.config as AgentNodeConfig).specialty).filter((s) => s !== 'general')
  if (specs.length === new Set(specs).size) s1 += 10
  else sep.push({ tone: 'tip', text: 'Two agents share the same specialty. Duplicate responsibilities cause conflicting answers.' })

  /* 2. Correct tool use */
  const tu: Finding[] = []
  let s2 = 0
  const dataAgentsWithTool = dataAgents.filter((a) => toolsOf(g, a.id).some((t) => toolDef(t)?.workforceData))
  if (dataAgents.length && dataAgentsWithTool.length === dataAgents.length) { s2 += 45; tu.push({ tone: 'good', text: 'Every data agent reads from an approved workforce source.' }) }
  else if (dataAgents.length) { s2 += 15 * dataAgentsWithTool.length; tu.push({ tone: 'issue', text: `${dataAgents.filter((a) => !dataAgentsWithTool.includes(a)).map((a) => a.label).join(', ')} has no workforce data tool — it will guess.` }) }
  else tu.push({ tone: 'issue', text: 'No agents retrieve workforce data.' })
  if (hasSkill('attrition-calc')) { s2 += 30; tu.push({ tone: 'good', text: 'Attrition uses the shared Attrition Calculation skill — one definition everywhere.' }) }
  else tu.push({ tone: 'issue', text: 'Attach the Attrition Calculation skill so the rate uses the approved formula.' })
  const webForData = dataAgents.filter((a) => toolsOf(g, a.id).some((t) => t.config.toolId === 'web'))
  if (webForData.length) tu.push({ tone: 'issue', text: 'Web Search is attached to a data agent. Internal metrics must come from internal systems.' })
  else s2 += 15
  const orphanTools = tools.filter((t) => !g.edges.some((e) => e.source === t.id || e.target === t.id))
  if (orphanTools.length) tu.push({ tone: 'tip', text: `${orphanTools.map((t) => t.label).join(', ')} isn’t connected to any agent.` })
  else s2 += 10

  /* 3. Reliability */
  const rel: Finding[] = []
  let s3 = 0
  const qaAfterData = qas.filter((q) => dataAgents.length > 0 && dataAgents.every((d) => downstream(g, d.id).has(q.id)))
  const qaBeforeOut = qaAfterData.filter((q) => outputs.some((o) => downstream(g, q.id).has(o.id)))
  if (qaBeforeOut.length) { s3 += 60; rel.push({ tone: 'good', text: 'A QA gate validates the data before anything is published.' }) }
  else if (qas.length) { s3 += 25; rel.push({ tone: 'issue', text: 'You have QA, but it isn’t between the data agents and the output — bad data can bypass it.' }) }
  else rel.push({ tone: 'issue', text: 'No QA gate. A wrong number would flow straight into the executive report.' })
  const qaCfg = nodesOfKind(g, 'qa').map((q) => q.config as QaNodeConfig)
  if (qaCfg.some((c) => c.failureAction === 'retry' && c.retries >= 1 && c.retries <= 3)) { s3 += 25; rel.push({ tone: 'good', text: 'Failures retry a bounded number of times.' }) }
  else if (qaCfg.length) { s3 += 10; rel.push({ tone: 'tip', text: 'Consider “retry” with 1–3 retries so transient errors fix themselves.' }) }
  else if (qas.length) s3 += 15
  if (hasCycle(g)) rel.push({ tone: 'issue', text: 'The flow contains a loop. Use QA retries rather than circular connections.' })
  else s3 += 15

  /* 4. Security */
  const sec: Finding[] = []
  let s4 = 40
  const sensitive = tools.filter((t) => toolDef(t)?.sensitive && g.edges.some((e) => e.source === t.id || e.target === t.id))
  if (sensitive.length) { s4 -= 30; sec.push({ tone: 'issue', text: 'Payroll data is connected, but this mission never needs individual pay. Least privilege: remove it.' }) }
  else { s4 += 20; sec.push({ tone: 'good', text: 'No access to sensitive pay data — least privilege.' }) }
  const writeData = tools.filter((t) => toolDef(t)?.workforceData && t.config.permissions.some((p) => p !== 'read'))
  if (writeData.length) { s4 -= 20; sec.push({ tone: 'issue', text: `${writeData.map((t) => t.label).join(', ')} has write/execute permission. Analysis only needs READ.` }) }
  else if (tools.some((t) => toolDef(t)?.workforceData)) { s4 += 20; sec.push({ tone: 'good', text: 'Data tools are read-only.' }) }
  const noGuard = agents.filter((a) => !(a.config as AgentNodeConfig).guardrails?.trim())
  if (noGuard.length) { s4 -= 10; sec.push({ tone: 'tip', text: `${noGuard.map((a) => a.label).join(', ')} has no guardrails.` }) }
  else if (agents.length) s4 += 20

  /* 5. Human oversight */
  const hum: Finding[] = []
  let s5 = 0
  const approvalBeforeOut = approvals.filter((a) => outputs.some((o) => downstream(g, a.id).has(o.id)))
  const outbound = tools.some((t) => toolDef(t)?.outbound)
  if (approvalBeforeOut.length) { s5 += 70; hum.push({ tone: 'good', text: 'A person approves the executive report before it goes out.' }) }
  else if (approvals.length) { s5 += 30; hum.push({ tone: 'issue', text: 'There’s an approval node, but it isn’t on the path to the output.' }) }
  else hum.push({ tone: 'issue', text: 'Executive reports should be approved by a person before they are published.' })
  if (approvals.length > 2) hum.push({ tone: 'tip', text: 'Lots of approvals slow everything down. Put humans where the consequences are.' })
  else s5 += 15
  if (outbound && !approvalBeforeOut.length) hum.push({ tone: 'issue', text: 'An Email tool can send data out with no one approving it.' })
  else s5 += 15

  /* 6. Efficiency */
  const eff: Finding[] = []
  let s6 = 40
  if (hc.length && lv.length) {
    const serial = downstream(g, hc[0].id).has(lv[0].id) || downstream(g, lv[0].id).has(hc[0].id)
    if (serial) eff.push({ tone: 'tip', text: 'Headcount and Leavers run one after the other. They’re independent — run them in parallel.' })
    else { s6 += 35; eff.push({ tone: 'good', text: 'Independent data tasks run in parallel.' }) }
  }
  const disconnected = g.nodes.filter((n) => isFlow(n) && n.kind !== 'request' && predecessors(g, n.id).length === 0 && successors(g, n.id).length === 0)
  if (disconnected.length) { eff.push({ tone: 'tip', text: `${disconnected.map((n) => n.label).join(', ')} isn’t connected — remove it or wire it in.` }) }
  else s6 += 15
  const research = agentsBySpecialty(g, 'research')
  if (research.length) eff.push({ tone: 'tip', text: 'A Research agent adds cost and time; only keep it if the mission needs external benchmarks.' })
  else s6 += 10
  if (flowEdges(g).length === 0) s6 = 0

  const dims: Dimension[] = [
    { id: 'separation', label: 'Separation of responsibilities', icon: 'split', score: clamp(s1), findings: sep },
    { id: 'tools', label: 'Correct tool use', icon: 'wrench', score: clamp(s2), findings: tu },
    { id: 'reliability', label: 'Reliability', icon: 'shield-check', score: clamp(s3), findings: rel },
    { id: 'security', label: 'Security', icon: 'lock', score: clamp(s4), findings: sec },
    { id: 'oversight', label: 'Human oversight', icon: 'user-check', score: clamp(s5), findings: hum },
    { id: 'efficiency', label: 'Efficiency', icon: 'gauge', score: clamp(s6), findings: eff },
  ]
  const overall = clamp(dims.reduce((a, d) => a + d.score, 0) / dims.length)
  const weakest = [...dims].sort((a, b) => a.score - b.score)[0]
  const headline =
    overall >= 85 ? 'Production-grade thinking. This is how real agent systems are designed.'
      : overall >= 70 ? `Solid architecture. Strengthen ${weakest.label.toLowerCase()} to make it excellent.`
        : overall >= 45 ? `Promising start. Your biggest gap is ${weakest.label.toLowerCase()}.`
          : 'Early sketch. Work through the issues below one at a time — each one teaches a principle.'
  return { overall, dimensions: dims, headline }
}
