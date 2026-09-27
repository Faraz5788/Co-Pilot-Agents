/**
 * Turns an architecture graph into an ordered, explainable execution timeline.
 * Pure function: the UI just plays the steps back.
 */
import { TOOLS, byId } from '@/content/catalog'
import { attritionDrivers, metrics } from '@/content/hrData'
import { fmt } from '@/lib/cn'
import {
  type AgentNodeConfig, type ApprovalNodeConfig, type LabGraph, type LabNode, type QaNodeConfig,
  flowEdges, hasCycle, isFlow, nodeMap, predecessors, skillsOf, successors, toolsOf,
} from './graph'

export type Tone = 'info' | 'ok' | 'warn' | 'bad'
export interface LogLine { icon: string; text: string; tone: Tone }

export interface SimStep {
  id: string
  title: string
  nodeIds: string[]
  edgeIds: string[]
  logs: LogLine[]
  tone: Tone
  parallel?: boolean
  awaitApproval?: { nodeId: string; reason: string; shows: string; action: string }
}

export type SimOutcome = 'success' | 'caught' | 'failed' | 'incomplete' | 'blocked'

export interface SimPlan {
  steps: SimStep[]
  problems: string[]
  outcome: SimOutcome
  summary: string
  faultCaught: boolean
  report?: { title: string; lines: string[]; wrong: boolean }
}

export interface SimOptions { request?: string; injectFault?: boolean }

const M = metrics()
const TRUE_HC = M.headcountEnd
const FAULT_HC = TRUE_HC + 2000

export function planSimulation(g: LabGraph, opts: SimOptions = {}): SimPlan {
  const problems: string[] = []
  const flow = g.nodes.filter(isFlow)
  const m = nodeMap(g)
  if (!flow.some((n) => n.kind === 'agent' || n.kind === 'orchestrator')) problems.push('Add at least one Agent or Orchestrator to do the work.')
  if (hasCycle(g)) problems.push('Your workflow has a loop between nodes. Flows must move forward — use a QA gate’s retry setting for loops.')
  if (problems.length) return { steps: [], problems, outcome: 'incomplete', summary: problems[0], faultCaught: false }

  const starts = flow.filter((n) => n.kind === 'request')
  const roots = starts.length ? starts : flow.filter((n) => predecessors(g, n.id).length === 0)
  if (!roots.length) return { steps: [], problems: ['Add a User Request node as the starting point.'], outcome: 'incomplete', summary: 'No starting point.', faultCaught: false }

  // Longest-path depth from the roots gives waves; nodes in one wave run in parallel.
  const depth = new Map<string, number>()
  roots.forEach((r) => depth.set(r.id, 0))
  const order: string[] = []
  const indeg = new Map(flow.map((n) => [n.id, predecessors(g, n.id).length]))
  const queue = flow.filter((n) => indeg.get(n.id) === 0).map((n) => n.id)
  while (queue.length) {
    const id = queue.shift()!
    order.push(id)
    for (const s of successors(g, id)) {
      if (depth.has(id)) depth.set(s.id, Math.max(depth.get(s.id) ?? 0, depth.get(id)! + 1))
      indeg.set(s.id, indeg.get(s.id)! - 1)
      if (indeg.get(s.id) === 0) queue.push(s.id)
    }
  }
  const reachable = flow.filter((n) => depth.has(n.id))
  flow.filter((n) => !depth.has(n.id)).forEach((n) => problems.push(`“${n.label}” isn’t connected to the request, so it never runs.`))

  const waves: LabNode[][] = []
  reachable.forEach((n) => {
    const d = depth.get(n.id)!
    ;(waves[d] ??= []).push(n)
  })

  // Simulation state
  const request = opts.request?.trim() || (starts[0]?.config as { text?: string })?.text || 'Analyse voluntary attrition over the last 12 months and create an executive report.'
  const state = {
    headcount: undefined as number | undefined,
    leavers: undefined as number | undefined,
    attrition: undefined as number | undefined,
    corruptedBy: undefined as string | undefined,
    faultInjected: false,
    faultCaught: false,
    blocked: false,
    sentExternally: false,
    approvedSeen: false,
    reportDrafted: false,
    formulaDrift: false,
    attritionBySkill: false,
  }
  const steps: SimStep[] = []
  const fe = flowEdges(g)
  const incoming = (ids: string[]) => fe.filter((e) => ids.includes(e.target) && depth.has(e.source)).map((e) => e.id)
  const ancestors = (id: string): Set<string> => {
    const seen = new Set<string>()
    const st = [id]
    while (st.length) {
      const c = st.pop()!
      predecessors(g, c).forEach((p) => { if (!seen.has(p.id)) { seen.add(p.id); st.push(p.id) } })
    }
    return seen
  }
  const workforceTool = (n: LabNode) => toolsOf(g, n.id).find((t) => byId(TOOLS, t.config.toolId)?.workforceData)

  let stepNo = 0
  const push = (s: Omit<SimStep, 'id'>) => steps.push({ ...s, id: `s${stepNo++}` })

  for (const wave of waves) {
    if (!wave) continue
    const parallel = wave.filter((n) => n.kind === 'agent').length > 1
    const waveLogs: LogLine[] = []
    let waveTone: Tone = 'info'
    const lit: string[] = []
    let awaitApproval: SimStep['awaitApproval']
    const worst = (t: Tone) => {
      const rank = { info: 0, ok: 1, warn: 2, bad: 3 }
      if (rank[t] > rank[waveTone]) waveTone = t
    }

    for (const n of wave) {
      lit.push(n.id)
      switch (n.kind) {
        case 'request':
          waveLogs.push({ icon: 'message-square', tone: 'info', text: `Request received: “${request}”` })
          break
        case 'orchestrator': {
          const kids = successors(g, n.id)
          const agents = kids.filter((k) => k.kind === 'agent')
          waveLogs.push({ icon: 'network', tone: 'info', text: kids.length ? `${n.label} plans the work and delegates to ${kids.map((k) => k.label).join(', ')}${agents.length > 1 ? ' — in parallel' : ''}.` : `${n.label} has no one to delegate to.` })
          if (!kids.length) worst('warn')
          break
        }
        case 'agent': {
          const c = n.config as AgentNodeConfig
          const tools = toolsOf(g, n.id)
          tools.forEach((t) => lit.push(t.id))
          const wf = workforceTool(n)
          const toolName = wf?.label
          tools.forEach((t) => {
            const def = byId(TOOLS, t.config.toolId)
            if (def?.sensitive) { waveLogs.push({ icon: 'shield-alert', tone: 'warn', text: `${n.label} reads ${t.label} — sensitive pay data it doesn’t need for this task.` }); worst('warn') }
            if (def?.outbound) state.sentExternally = true
          })
          if (c.specialty === 'headcount') {
            if (wf) {
              const faulty = opts.injectFault && !state.faultInjected
              state.headcount = faulty ? FAULT_HC : TRUE_HC
              if (faulty) { state.faultInjected = true; state.corruptedBy = n.id }
              waveLogs.push({ icon: 'database', tone: faulty ? 'bad' : 'ok', text: `${n.label} → ${toolName}.read(Headcount, 31 Aug 2026) = ${fmt(state.headcount)}${faulty ? '  ⚡ injected fault: transcription error' : ''}` })
              if (faulty) worst('bad')
            } else {
              state.headcount = 12000
              state.corruptedBy = n.id
              waveLogs.push({ icon: 'alert-triangle', tone: 'bad', text: `${n.label} has no workforce data tool — estimates headcount at “about 12,000”.` })
              worst('bad')
            }
          } else if (c.specialty === 'leavers') {
            if (wf) {
              state.leavers = M.voluntaryLeavers
              waveLogs.push({ icon: 'door-open', tone: 'ok', text: `${n.label} → ${toolName}.read(Terminations, 12 months) = ${fmt(M.voluntaryLeavers)} voluntary · ${fmt(M.involuntaryLeavers)} involuntary` })
            } else {
              state.leavers = 1500
              state.corruptedBy ??= n.id
              waveLogs.push({ icon: 'alert-triangle', tone: 'bad', text: `${n.label} has no data tool — guesses “around 1,500 leavers”.` })
              worst('bad')
            }
          } else if (c.specialty === 'research') {
            const web = tools.some((t) => t.config.toolId === 'web')
            waveLogs.push({ icon: 'globe', tone: web ? 'info' : 'warn', text: web ? `${n.label} → Web Search: public benchmarks for UK contact-centre attrition (unverified, cited).` : `${n.label} has no search tool — nothing to research with.` })
          } else if (c.specialty === 'analysis') {
            waveLogs.push({ icon: 'activity', tone: 'info', text: `${n.label} combines headcount and leaver data to look for drivers.` })
          } else if (c.specialty === 'qa') {
            runQa(n, { rule: 'Figures reconcile to source', failureAction: 'retry', retries: 2 })
          } else if (c.specialty === 'reporting') {
            state.reportDrafted = true
            if (state.attrition === undefined && state.headcount && state.leavers) {
              const avg = (M.headcountStart + (state.headcount ?? TRUE_HC)) / 2
              state.attrition = (state.leavers / (state.headcount ?? TRUE_HC)) * 100
              state.formulaDrift = true
              waveLogs.push({ icon: 'alert-triangle', tone: 'warn', text: `${n.label} has no Attrition skill — improvises: leavers ÷ closing headcount = ${state.attrition.toFixed(1)}% (approved method uses average headcount ${fmt(Math.round(avg))}).` })
              worst('warn')
            }
            waveLogs.push({ icon: 'file-text', tone: 'info', text: `${n.label} drafts the executive report${state.attrition !== undefined ? ` — voluntary attrition ${state.attrition.toFixed(1)}%` : ''}.` })
          } else {
            waveLogs.push({ icon: 'bot', tone: 'info', text: `${n.label} completes its task: ${c.goal || 'no goal defined'}.` })
          }
          if (!c.guardrails?.trim()) { waveLogs.push({ icon: 'shield', tone: 'warn', text: `${n.label} has no guardrails defined.` }); worst('warn') }
          break
        }
        case 'qa':
          runQa(n, n.config as QaNodeConfig)
          break
        case 'approval': {
          const c = n.config as ApprovalNodeConfig
          state.approvedSeen = true
          awaitApproval = { nodeId: n.id, reason: c.reason, shows: c.shows, action: c.action }
          waveLogs.push({ icon: 'user-check', tone: 'warn', text: `Paused for human approval: ${c.reason || 'no reason given'}` })
          break
        }
        case 'output':
          break
      }
    }

    function runQa(n: LabNode, c: QaNodeConfig) {
      const anc = ancestors(n.id)
      const corrupted = state.corruptedBy && anc.has(state.corruptedBy)
      if (corrupted) {
        waveLogs.push({ icon: 'shield-x', tone: 'bad', text: `${n.label} ✗ ${c.rule || 'Validation'}: headcount ${fmt(state.headcount!)} ≠ source ${fmt(TRUE_HC)}.` })
        if (c.failureAction === 'retry' && c.retries > 0) {
          const origin = m.get(state.corruptedBy!)!
          const hasTool = workforceTool(origin)
          if (hasTool) {
            state.headcount = TRUE_HC
            state.corruptedBy = undefined
            state.faultCaught = true
            waveLogs.push({ icon: 'repeat', tone: 'ok', text: `↻ Retry 1/${c.retries}: ${origin.label} re-queries ${hasTool.label} → ${fmt(TRUE_HC)} ✓ reconciles.` })
            if (state.attritionBySkill) {
              state.attrition = ((state.leavers ?? M.voluntaryLeavers) / M.averageHeadcount) * 100
              waveLogs.push({ icon: 'percent', tone: 'ok', text: `Attrition recalculated with the corrected headcount: ${state.attrition.toFixed(1)}%.` })
            } else state.attrition = undefined
            worst('warn')
          } else {
            waveLogs.push({ icon: 'repeat', tone: 'bad', text: `↻ Retries exhausted: ${origin.label} has no data tool, so it guesses again. Escalating.` })
            state.blocked = true
            worst('bad')
          }
        } else if (c.failureAction === 'fallback') {
          state.headcount = TRUE_HC
          state.corruptedBy = undefined
          state.faultCaught = true
          if (state.attritionBySkill) state.attrition = ((state.leavers ?? M.voluntaryLeavers) / M.averageHeadcount) * 100
          waveLogs.push({ icon: 'route', tone: 'ok', text: `Fallback: uses the last validated figure (${fmt(TRUE_HC)}) and flags the discrepancy.` })
          worst('warn')
        } else {
          state.blocked = true
          state.faultCaught = true
          waveLogs.push({ icon: 'ban', tone: 'warn', text: c.failureAction === 'escalate' ? 'Stopped and escalated to an analyst with the evidence.' : 'Output blocked until the data is fixed.' })
          worst('warn')
        }
      } else {
        const bits = [state.headcount && `headcount ${fmt(state.headcount)}`, state.leavers && `leavers ${fmt(state.leavers)}`].filter(Boolean).join(', ')
        waveLogs.push({ icon: 'shield-check', tone: 'ok', text: `${n.label} ✓ ${c.rule || 'checks'} passed${bits ? ` (${bits} reconcile to source)` : ''}.` })
        worst('ok')
      }
    }

    const outputs = wave.filter((n) => n.kind === 'output')
    const nonOutput = lit.filter((id) => m.get(id)?.kind !== 'output')
    if (nonOutput.length) {
      push({
        title: wave.filter((n) => n.kind !== 'output').map((n) => n.label).join(' + '),
        nodeIds: nonOutput,
        edgeIds: incoming(wave.map((n) => n.id).filter((id) => m.get(id)?.kind !== 'output')),
        logs: waveLogs,
        tone: waveTone,
        parallel,
        awaitApproval,
      })
    }

    // Skills run after their agent in the same wave.
    for (const n of wave.filter((x) => x.kind === 'agent')) {
      for (const s of skillsOf(g, n.id)) {
        const logs: LogLine[] = []
        let tone: Tone = 'info'
        if (s.config.skillId === 'attrition-calc') {
          const hc = state.headcount ?? TRUE_HC
          const lv = state.leavers ?? M.voluntaryLeavers
          const avg = (M.headcountStart + hc) / 2
          state.attrition = (lv / avg) * 100
          state.attritionBySkill = true
          const wrong = hc !== TRUE_HC
          logs.push({ icon: 'percent', tone: wrong ? 'bad' : 'ok', text: `${s.label}: ${fmt(lv)} ÷ ${fmt(Math.round(avg))} avg headcount × 100 = ${state.attrition.toFixed(1)}%${wrong ? '  (built on a bad headcount)' : ` (prior year ${M.priorVoluntaryAttrition.toFixed(1)}%)`}` })
          tone = wrong ? 'bad' : 'ok'
        } else if (s.config.skillId === 'exec-summary') {
          logs.push({ icon: 'file-text', tone: 'info', text: `${s.label}: headline first, then three drivers, one page.` })
        } else if (s.config.skillId === 'headcount-analysis') {
          logs.push({ icon: 'users', tone: 'info', text: `${s.label}: breaks headcount down by department, largest first.` })
        } else if (s.config.skillId === 'leaver-analysis') {
          logs.push({ icon: 'door-open', tone: 'info', text: `${s.label}: splits voluntary vs involuntary, suppresses groups under 5.` })
        } else {
          logs.push({ icon: 'sparkles', tone: 'info', text: `${s.label} applied.` })
        }
        push({ title: `${s.label} (via ${n.label})`, nodeIds: [s.id, n.id], edgeIds: [], logs, tone })
      }
    }

    if (awaitApproval && state.corruptedBy) {
      steps[steps.length - 1].logs.push({ icon: 'eye', tone: 'warn', text: 'Reviewer sees the draft — can they spot a wrong headcount by eye? Often not.' })
    }

    for (const o of outputs) {
      const wrong = !!state.corruptedBy
      const logs: LogLine[] = []
      let tone: Tone = wrong ? 'bad' : 'ok'
      if (state.blocked) {
        logs.push({ icon: 'ban', tone: 'warn', text: 'Output withheld — the QA gate stopped bad data reaching leadership.' })
        tone = 'warn'
      } else if (wrong) {
        logs.push({ icon: 'x-circle', tone: 'bad', text: `✗ ${o.label} delivered with a wrong headcount (${fmt(state.headcount!)} instead of ${fmt(TRUE_HC)}). Nothing checked it.` })
      } else {
        logs.push({ icon: 'check-circle', tone: 'ok', text: `✓ ${o.label} generated${state.attrition !== undefined ? `: voluntary attrition ${state.attrition.toFixed(1)}%` : ''}.` })
      }
      if (state.sentExternally && !state.approvedSeen) {
        logs.push({ icon: 'mail', tone: 'warn', text: 'An agent with Email access could send this with no human approval.' })
        if (tone === 'ok') tone = 'warn'
      }
      push({ title: o.label, nodeIds: [o.id], edgeIds: incoming([o.id]), logs, tone })
    }
  }

  const reachedOutput = reachable.some((n) => n.kind === 'output')
  const drivers = attritionDrivers(2)
  const wrong = !!state.corruptedBy
  const report = state.reportDrafted || reachedOutput
    ? {
        title: 'Voluntary attrition — last 12 months',
        wrong,
        lines: [
          `Headcount (31 Aug 2026): ${fmt(state.headcount ?? TRUE_HC)}${wrong ? ' ⚠' : ''}`,
          `Voluntary leavers: ${fmt(state.leavers ?? M.voluntaryLeavers)}`,
          state.attrition !== undefined ? `Voluntary attrition: ${state.attrition.toFixed(1)}% (prior year ${M.priorVoluntaryAttrition.toFixed(1)}%)` : 'Attrition rate: not calculated',
          `Biggest increases: ${drivers.map((d) => `${d.label} (+${d.delta.toFixed(1)} pts)`).join('; ')}`,
        ],
      }
    : undefined

  let outcome: SimOutcome
  let summary: string
  if (!reachedOutput) {
    outcome = 'incomplete'
    summary = 'The workflow never reaches an Output node. Connect your last step to an Output.'
  } else if (state.blocked) {
    outcome = 'blocked'
    summary = state.faultCaught ? 'Your QA gate caught bad data and stopped it. Safe — but a retry would have fixed it automatically.' : 'The workflow stopped before producing output.'
  } else if (wrong) {
    outcome = 'failed'
    summary = 'A wrong number reached the final output. Nothing in the workflow validated the data. Add a QA gate after the data agents.'
  } else if (state.faultCaught) {
    outcome = 'caught'
    summary = 'Fault injected and caught! The QA gate detected the bad headcount and the retry fixed it before anyone saw it.'
  } else {
    outcome = 'success'
    summary = state.formulaDrift ? 'Report produced — but attrition was calculated with an improvised formula. Attach the Attrition Calculation skill.' : 'Report produced from validated data.'
  }
  return { steps, problems, outcome, summary, faultCaught: state.faultCaught, report }
}
