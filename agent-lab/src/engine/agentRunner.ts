/**
 * Deterministic single-agent simulator for Level 2.
 * The outcome of each request depends only on the learner's configuration,
 * so every result can be explained ("because your agent had X but not Y").
 */
import { AS_OF, groupBy, metrics } from '@/content/hrData'
import { fmt } from '@/lib/cn'

export interface AgentLike {
  name: string
  instructions: string[]
  tools: string[]
  skills: string[]
  guardrails: string[]
}

export type TraceKind = 'think' | 'tool' | 'skill' | 'guard' | 'result' | 'error' | 'warn'
export interface TraceLine { kind: TraceKind; text: string }

export type Outcome = 'success' | 'safe-refusal' | 'no-data' | 'improvised' | 'hallucination' | 'breach' | 'near-miss' | 'held'

export interface RunResult {
  requestId: string
  outcome: Outcome
  pass: boolean
  trace: TraceLine[]
  answer: string
  table?: { key: string; value: string }[]
  coach: string
}

export const AGENT_REQUESTS = [
  { id: 'total', text: 'What is our current headcount?', icon: 'users' },
  { id: 'by-dept', text: 'Show headcount by department.', icon: 'layout-grid' },
  { id: 'salary', text: 'Send confidential salary data to everyone.', icon: 'alert-triangle' },
] as const

export const OUTCOME_META: Record<Outcome, { label: string; tone: 'ok' | 'warn' | 'bad'; icon: string }> = {
  success: { label: 'Correct', tone: 'ok', icon: 'check-circle' },
  'safe-refusal': { label: 'Safely refused', tone: 'ok', icon: 'shield-check' },
  'no-data': { label: 'Couldn’t answer', tone: 'warn', icon: 'alert-triangle' },
  improvised: { label: 'Improvised', tone: 'warn', icon: 'alert-triangle' },
  hallucination: { label: 'Invented a number', tone: 'bad', icon: 'x-circle' },
  breach: { label: 'Data breach', tone: 'bad', icon: 'shield-x' },
  'near-miss': { label: 'Near miss', tone: 'warn', icon: 'shield-alert' },
  held: { label: 'Held for approval', tone: 'warn', icon: 'user-check' },
}

const has = (list: string[], id: string) => list.includes(id)

function dataTool(a: AgentLike) {
  if (has(a.tools, 'powerbi')) return 'Power BI Model'
  if (has(a.tools, 'hr-db')) return 'HR Database'
  return null
}

export function runAgentRequest(a: AgentLike, requestId: string): RunResult {
  const total = metrics().headcountEnd
  const tool = dataTool(a)
  const statesPeriod = has(a.instructions, 'state-period')
  const noGuess = has(a.instructions, 'use-tools')

  if (requestId === 'total' || requestId === 'by-dept') {
    const trace: TraceLine[] = [{ kind: 'think', text: requestId === 'total' ? 'Goal: current headcount for the whole organisation.' : 'Goal: current headcount broken down by department.' }]
    if (!tool) {
      trace.push({ kind: 'think', text: 'No workforce data tool available.' })
      if (noGuess) {
        trace.push({ kind: 'guard', text: 'Instruction: “Always use a data tool for numbers — never estimate.”' })
        return { requestId, outcome: 'no-data', pass: false, trace, answer: 'I don’t have access to an approved headcount source, so I can’t give you a reliable number.', coach: 'Your “never estimate” rule stopped a made-up answer — good. But the agent can’t do its job without a data tool. Add Power BI Model or HR Database.' }
      }
      trace.push({ kind: 'warn', text: 'Falling back to general knowledge…' })
      return { requestId, outcome: 'hallucination', pass: false, trace, answer: 'Halcyon Group has approximately 12,000 employees.', coach: 'No data tool and no rule against guessing, so the model invented a plausible number. The real figure is 10,450. Give it a data tool — and add “never estimate”.' }
    }
    trace.push({ kind: 'tool', text: `${tool}.query(measure: Headcount, asOf: 2026-08-31${requestId === 'by-dept' ? ', groupBy: ?' : ''})` })

    if (requestId === 'total') {
      trace.push({ kind: 'result', text: `→ ${fmt(total)}` })
      const answer = statesPeriod ? `Headcount on ${AS_OF} is ${fmt(total)} across all of Halcyon Group.` : `Our headcount is ${fmt(total)}.`
      return {
        requestId,
        outcome: 'success',
        pass: true,
        trace,
        answer,
        coach: statesPeriod ? 'Grounded in a tool, with date and scope stated — verifiable by anyone.' : 'Correct number. Tip: add the “state the date and filters” instruction so readers know what this figure covers.',
      }
    }

    if (!has(a.skills, 'headcount-analysis')) {
      const divisions = groupBy('division')
      trace.pop()
      trace.push({ kind: 'tool', text: `${tool}.query(measure: Headcount, asOf: 2026-08-31, groupBy: Division)` })
      trace.push({ kind: 'warn', text: 'No method for breakdowns — improvising a grouping.' })
      return {
        requestId,
        outcome: 'improvised',
        pass: false,
        trace,
        answer: 'Here’s headcount by area:',
        table: divisions.map((d) => ({ key: d.key, value: fmt(d.headcountEnd) })),
        coach: 'The agent guessed at a grouping and returned divisions, not departments. The Headcount Analysis skill defines how to break down by the requested org level — add it.',
      }
    }
    const depts = groupBy('department')
    trace.pop()
    trace.push({ kind: 'skill', text: 'Skill: Headcount Analysis → group by requested level (Department), sort largest first.' })
    trace.push({ kind: 'tool', text: `${tool}.query(measure: Headcount, asOf: 2026-08-31, groupBy: Department)` })
    trace.push({ kind: 'result', text: `→ ${depts.length} departments, total ${fmt(total)}` })
    return {
      requestId,
      outcome: 'success',
      pass: true,
      trace,
      answer: statesPeriod ? `Headcount by department on ${AS_OF} (total ${fmt(total)}):` : 'Headcount by department:',
      table: depts.map((d) => ({ key: d.key, value: fmt(d.headcountEnd) })),
      coach: 'The skill told the agent exactly how to break down and order the result — the same way every time.',
    }
  }

  // requestId === 'salary'
  const trace: TraceLine[] = [{ kind: 'think', text: 'Goal: send salary data to everyone.' }]
  if (has(a.guardrails, 'no-sensitive')) {
    trace.push({ kind: 'guard', text: 'Guardrail: “Never share salary, pay or personal data.”' })
    return {
      requestId,
      outcome: 'safe-refusal',
      pass: true,
      trace,
      answer: 'I can’t share salary or personal pay data. If you need pay information for a legitimate purpose, please contact the Reward team.',
      coach: has(a.tools, 'payroll')
        ? 'Refused — well done. But the agent still holds Payroll access it never needs. Least privilege says remove it, so a clever prompt can’t get around the rule.'
        : 'Refused, and it had no payroll access anyway. Two layers of protection.',
    }
  }
  const payroll = has(a.tools, 'payroll')
  const email = has(a.tools, 'email')
  if (payroll) {
    trace.push({ kind: 'tool', text: 'Payroll System.read(scope: all employees, fields: name, salary, bonus)' })
    trace.push({ kind: 'result', text: `→ ${fmt(total)} employee pay records` })
    if (email && has(a.guardrails, 'approval-send')) {
      trace.push({ kind: 'tool', text: 'Email.draft(to: all-staff@halcyon.example, attach: salaries.xlsx)' })
      trace.push({ kind: 'guard', text: 'Guardrail: human approval required before sending. ⏸' })
      return { requestId, outcome: 'held', pass: false, trace, answer: 'Draft ready: “Salary data for all staff”. Waiting for approval to send.', coach: 'The approval gate stopped the send — but the agent already pulled every salary into its context and drafted the email. It should have refused at the start. Add the “never share salary” guardrail, and ask whether it needs Payroll at all.' }
    }
    if (email) {
      trace.push({ kind: 'tool', text: 'Email.send(to: all-staff@halcyon.example, attach: salaries.xlsx)' })
      trace.push({ kind: 'error', text: '✉ SENT to 10,450 recipients.' })
      return { requestId, outcome: 'breach', pass: false, trace, answer: 'Done! I’ve emailed the salary spreadsheet to everyone.', coach: 'Your agent did exactly what it was asked — and caused a serious data breach. It had the capability (Payroll + Email) and no boundary. Add a guardrail, remove Payroll, and put a human in front of outbound email.' }
    }
    trace.push({ kind: 'warn', text: 'No email tool — returning the data in chat instead.' })
    return { requestId, outcome: 'breach', pass: false, trace, answer: 'I can’t send email, but here is the salary data: A. Example — £—, B. Sample — £—, … (10,450 rows)', coach: 'No email tool, but the agent still leaked every salary into the chat. Capabilities plus no boundary equals a breach. Add the “never share salary” guardrail and remove Payroll access.' }
  }
  if (email) {
    trace.push({ kind: 'think', text: 'No salary source available. Looking for an alternative…' })
    trace.push({ kind: 'warn', text: 'Willing to proceed — the only thing missing was data.' })
    return { requestId, outcome: 'near-miss', pass: false, trace, answer: 'I couldn’t find salary data. Shall I email everyone the headcount report instead?', coach: 'Nothing leaked — but only by luck. The agent was willing to send confidential data; it just couldn’t find any. Make the boundary explicit with a guardrail.' }
  }
  trace.push({ kind: 'think', text: 'No salary source and no way to send. Can’t complete.' })
  return { requestId, outcome: 'near-miss', pass: false, trace, answer: 'I don’t have access to salary data or email, so I can’t do that.', coach: 'It declined because it couldn’t — not because it shouldn’t. If someone later adds Payroll or Email, this becomes a breach. Add an explicit guardrail.' }
}

/** What an unguarded version of this agent would do with the risky request. */
export function unguardedCounterfactual(a: AgentLike) {
  return runAgentRequest({ ...a, guardrails: [], tools: Array.from(new Set([...a.tools, 'payroll', 'email'])) }, 'salary')
}
