import type { Level } from '../types'
import { LINKS } from '../resources'
import { edgeId, flowEdges, type LabGraph, type LabNode } from '@/engine/graph'
import { createAgent, createNode, createSkill, createTool, withId } from '@/engine/nodeFactory'
import { any, qaBeforeReporting, qaGuardsData, qaRetries } from './checks'

const lock = <N extends LabNode>(n: N): N => ({ ...n, locked: true })

function brokenPipeline(): LabGraph {
  const nodes: LabNode[] = [
    lock(withId(createNode('request', 300, 0, { text: 'What was voluntary attrition over the last 12 months?' }), 'req')),
    lock(withId(createNode('orchestrator', 300, 120, {}, 'HR Orchestrator'), 'orch')),
    lock(createAgent('headcount', 60, 250, 'hc')),
    lock(createAgent('leavers', 540, 250, 'lv')),
    lock(createTool('powerbi', -80, 380, 't_pbi')),
    lock(createTool('hr-db', 440, 390, 't_db')),
    lock(createSkill('attrition-calc', 640, 390, 'sk')),
    lock(createAgent('reporting', 300, 600, 'rep')),
    lock(withId(createNode('approval', 300, 720), 'appr')),
    lock(withId(createNode('output', 300, 840, {}, 'Executive Report'), 'out')),
  ]
  const pairs: [string, string][] = [['req', 'orch'], ['orch', 'hc'], ['orch', 'lv'], ['hc', 't_pbi'], ['lv', 't_db'], ['lv', 'sk'], ['hc', 'rep'], ['lv', 'rep'], ['rep', 'appr'], ['appr', 'out']]
  return { nodes, edges: pairs.map(([s, t]) => ({ id: edgeId(s, t), source: s, target: t })) }
}

const noBypass = (g: LabGraph) => {
  const data = new Set([...any(g, 'headcount'), ...any(g, 'leavers')].map((n) => n.id))
  const rep = new Set(any(g, 'reporting').map((n) => n.id))
  return !flowEdges(g).some((e) => data.has(e.source) && rep.has(e.target))
}

export const level6: Level = {
  id: 'l6',
  number: 6,
  pathLabel: 'Reliability',
  title: 'Reliability',
  theme: 'AI systems will fail. Design for failure.',
  description: 'Validation, deterministic checks, retries, fallbacks and observability. Then break a workflow on purpose — and repair it.',
  icon: 'shield-check',
  unlocks: 'Agent Reliability',
  badgeId: 'bug-hunter',
  concepts: ['Validation', 'Deterministic checks', 'Retries', 'Fallbacks', 'Error handling', 'Hallucination prevention', 'Observability'],
  learnMore: [LINKS.hooks],
  lessons: [
    {
      id: 'l6-failure',
      title: 'Design for failure',
      summary: 'Validate, retry, fall back, escalate — and log everything.',
      minutes: 6,
      steps: [
        {
          id: 'learn',
          kind: 'learn',
          phase: 'learn',
          title: 'Assume something will go wrong',
          body: [
            'Tools time out. Data arrives late. Models occasionally produce a confident wrong number. None of that is rare at scale — so reliable systems plan for it.',
            'The strongest pattern is a deterministic check: code that compares results to a source of truth, with no model involved. When a check fails, the system retries, falls back to a safe alternative or escalates to a person — and every step is logged so you can see what happened.',
          ],
          visual: 'reliability-stack',
        },
        {
          id: 'deterministic',
          kind: 'quiz',
          phase: 'try',
          title: 'The best check',
          question: 'What’s the most reliable way to validate a headcount figure before it goes into a report?',
          options: [
            { id: 'a', text: 'Ask another model “does this number look right?”', feedback: 'A second model can be fooled the same way. It’s an opinion, not a check.' },
            { id: 'b', text: 'Re-query the source total and compare exactly', correct: true, feedback: 'Deterministic: same input, same answer, every time. No judgement required.' },
            { id: 'c', text: 'Use a bigger model to generate the number', feedback: 'Bigger models still hallucinate. Validate against the source.' },
          ],
        },
        {
          id: 'patterns',
          kind: 'sort',
          phase: 'try',
          title: 'Name the pattern',
          prompt: 'Match each situation to the reliability pattern it describes.',
          buckets: [
            { id: 'validate', label: 'Validate', icon: 'shield-check', hint: 'check results against rules or a source' },
            { id: 'retry', label: 'Retry', icon: 'repeat', hint: 'try the same step again, a limited number of times' },
            { id: 'fallback', label: 'Fallback', icon: 'route', hint: 'switch to a safe alternative' },
            { id: 'escalate', label: 'Escalate', icon: 'user-check', hint: 'hand to a human with context' },
          ],
          items: [
            { id: 'a', text: 'Check the report’s headcount matches the source system', bucket: 'validate', why: 'A deterministic comparison against the source of truth.' },
            { id: 'b', text: 'Check the attrition rate is between 0% and 100%', bucket: 'validate', why: 'A sanity rule that catches impossible outputs.' },
            { id: 'c', text: 'Power BI timed out — try again in 5 seconds', bucket: 'retry', why: 'Transient errors often fix themselves. Keep retries bounded.' },
            { id: 'd', text: 'Power BI is down — use last night’s validated snapshot and label it', bucket: 'fallback', why: 'A safe, clearly-labelled alternative beats failing outright.' },
            { id: 'e', text: 'Still doesn’t reconcile after 2 retries — send to an analyst with the evidence', bucket: 'escalate', why: 'When automation can’t resolve it, a person decides.' },
          ],
        },
        {
          id: 'observe',
          kind: 'quiz',
          phase: 'try',
          title: 'Why did it say that?',
          question: 'Leadership asks why last month’s report said 11.9%. What lets you answer confidently?',
          options: [
            { id: 'a', text: 'Re-running the agent and seeing what it says now', feedback: 'Data and models change. Today’s answer doesn’t explain last month’s.' },
            { id: 'b', text: 'A trace of every step: tool calls, inputs, outputs and QA results', correct: true, feedback: 'Observability. With a trace you can replay exactly what happened and why.' },
            { id: 'c', text: 'Asking the agent to explain its reasoning', feedback: 'A model’s after-the-fact explanation isn’t evidence. Logs are.' },
          ],
        },
        {
          id: 'reflect',
          kind: 'reflect',
          phase: 'reflect',
          title: 'Takeaway',
          takeaway: 'Reliability isn’t a smarter model — it’s the checks and recovery paths around it. Validate deterministically, recover gracefully, log everything.',
          instincts: ['“That output needs deterministic validation.”', '“That should be logged.”'],
          learnMore: LINKS.hooks,
        },
      ],
    },
    {
      id: 'l6-break',
      title: 'Break the agent',
      summary: 'Find what should have caught a wrong number — then fix it.',
      minutes: 8,
      steps: [
        {
          id: 'diagnose',
          kind: 'break-fix',
          phase: 'break',
          title: 'The phantom 2,000',
          mission: {
            mission: 'An executive report went out with the wrong headcount.',
            objective: 'Work out what should have caught it.',
            success: 'Identify the missing safeguard.',
          },
          scenario: 'The Headcount Agent reported 12,450 employees. The report went to leadership, who started planning around it. Nobody noticed until Finance queried it a week later.',
          evidence: [
            { label: 'Headcount Agent returned', value: '12,450 employees', tone: 'bad' },
            { label: 'HR database actually returned', value: '10,450 employees', tone: 'ok' },
            { label: 'Checks between them', value: 'none', tone: 'neutral' },
          ],
          question: 'What should have caught this?',
          options: [
            { id: 'a', text: 'A better prompt', feedback: 'Prompts reduce errors; they don’t detect them. The number still needed checking.' },
            { id: 'b', text: 'QA validation', correct: true, feedback: 'A deterministic QA gate comparing the figure to the source would have failed instantly — and retried.' },
            { id: 'c', text: 'A bigger model', feedback: 'Bigger models still make transcription errors. You need detection, not hope.' },
            { id: 'd', text: 'More agents', feedback: 'More agents means more places for errors — unless one of them validates.' },
          ],
          fixTitle: 'Add a QA gate',
          fix: {
            before: ['Headcount Agent ─▶ Reporting ─▶ Leadership', '   12,450 (unchecked)'],
            after: ['Headcount Agent ─▶ QA Gate ─▶ Reporting', '   12,450 ≠ 10,450 ✗ → retry → 10,450 ✓'],
            note: 'Every number that reaches people should pass a deterministic check first.',
          },
        },
        {
          id: 'repair',
          kind: 'architecture',
          phase: 'fix',
          title: 'Repair the workflow',
          mission: {
            mission: 'This workflow will produce the wrong headcount again — a fault is injected on every run.',
            objective: 'Add a QA gate so the bad number is caught and corrected before it reaches the report.',
            components: ['QA Gate', 'Connections'],
            success: 'The checklist passes and the simulation shows the fault being caught.',
          },
          intro: 'Add a QA Gate. Remove the direct connections from the data agents to Reporting (select a connection and press Delete, or use the Inspect tab), and route both through the gate. Set its failure action to Retry.',
          start: brokenPipeline(),
          palette: [{ kind: 'qa' }, { kind: 'agent', specialty: 'qa' }],
          grading: 'checks',
          simulate: true,
          fault: 'locked',
          checks: [
            { id: 'qa', label: 'A QA gate checks both data agents', test: qaGuardsData, hint: 'Connect Headcount Agent → QA Gate and Leavers Agent → QA Gate.' },
            { id: 'before', label: 'Reporting only runs after QA', test: qaBeforeReporting, hint: 'Connect QA Gate → Reporting Agent.' },
            { id: 'bypass', label: 'Nothing bypasses the gate', test: noBypass, hint: 'Delete the direct Headcount → Reporting and Leavers → Reporting connections. A gate with a way around it isn’t a gate.' },
            { id: 'retry', label: 'Failures retry automatically', test: qaRetries, hint: 'Select the QA Gate and set its failure action to “Retry” with at least 1 retry.' },
          ],
        },
        {
          id: 'reflect',
          kind: 'reflect',
          phase: 'reflect',
          title: 'Takeaway',
          takeaway: 'You didn’t make the agent smarter — you made the system safer. A deterministic gate with a bounded retry turns a silent error into a self-correcting one.',
          instincts: ['“That output needs deterministic validation.”', '“What happens when this step fails?”'],
        },
      ],
    },
  ],
}
