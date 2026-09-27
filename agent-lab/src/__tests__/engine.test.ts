import { describe, expect, it } from 'vitest'
import { LEVELS } from '@/content/course'
import { metrics } from '@/content/hrData'
import { attritionPipeline } from '@/content/templates'
import { runAgentRequest } from '@/engine/agentRunner'
import { reviewArchitecture } from '@/engine/evaluate'
import { type LabGraph, type LabNode, edgeId } from '@/engine/graph'
import { createAgent, createNode, createSkill, createTool, withId } from '@/engine/nodeFactory'
import { planSimulation } from '@/engine/simulation'
import type { ArchitectureStep } from '@/content/types'

const connect = (g: LabGraph, pairs: [string, string][]) => ({ ...g, edges: [...g.edges, ...pairs.map(([s, t]) => ({ id: edgeId(s, t), source: s, target: t }))] })
const add = (g: LabGraph, ...nodes: LabNode[]) => ({ ...g, nodes: [...g.nodes, ...nodes] })
const archStep = (levelId: string, stepId: string) =>
  LEVELS.find((l) => l.id === levelId)!.lessons.flatMap((l) => l.steps).find((s) => s.id === stepId) as ArchitectureStep

describe('sample HR data', () => {
  it('matches the numbers used in lesson content', () => {
    const m = metrics()
    expect(m.headcountEnd).toBe(10450)
    expect(m.voluntaryAttrition.toFixed(1)).toBe('14.2')
    expect(((m.voluntaryLeavers / m.headcountEnd) * 100).toFixed(1)).toBe('14.1')
    expect(m.totalAttrition.toFixed(1)).toBe('17.0')
    expect(metrics({ location: 'Leeds' }).headcountEnd).toBe(2020)
  })
})

describe('single-agent runner', () => {
  const base = { name: 'A', instructions: [], tools: [], skills: [], guardrails: [] }
  it('hallucinates without a tool or rule', () => {
    expect(runAgentRequest(base, 'total').outcome).toBe('hallucination')
  })
  it('passes all three with a well-built agent', () => {
    const a = { ...base, instructions: ['use-tools', 'state-period'], tools: ['powerbi'], skills: ['headcount-analysis'], guardrails: ['no-sensitive'] }
    for (const r of ['total', 'by-dept', 'salary']) expect(runAgentRequest(a, r).pass).toBe(true)
  })
  it('breaches with payroll + email and no guardrail', () => {
    expect(runAgentRequest({ ...base, tools: ['payroll', 'email'] }, 'salary').outcome).toBe('breach')
  })
})

describe('simulation', () => {
  it('runs the template end to end', () => {
    const p = planSimulation(attritionPipeline())
    expect(p.problems).toEqual([])
    expect(p.outcome).toBe('success')
    expect(p.steps.some((s) => s.parallel)).toBe(true)
  })
  it('catches an injected fault with the QA gate', () => {
    expect(planSimulation(attritionPipeline(), { injectFault: true }).outcome).toBe('caught')
  })
  it('lets the fault through without QA', () => {
    const g = attritionPipeline()
    const noQa: LabGraph = connect(
      { nodes: g.nodes.filter((n) => n.id !== 'qa'), edges: g.edges.filter((e) => e.source !== 'qa' && e.target !== 'qa') },
      [['hc', 'rep'], ['lv', 'rep']],
    )
    expect(planSimulation(noQa, { injectFault: true }).outcome).toBe('failed')
  })
})

describe('challenges are solvable', () => {
  it('Level 4 orchestration', () => {
    const step = archStep('l4', 'design')
    let g = add(step.start, createAgent('headcount', 0, 0, 'hc'), createAgent('leavers', 0, 0, 'lv'), createAgent('qa', 0, 0, 'qa'), createAgent('reporting', 0, 0, 'rep'), createTool('powerbi', 0, 0, 'pbi'), createTool('hr-db', 0, 0, 'db'), createSkill('attrition-calc', 0, 0, 'sk'))
    g = connect(g, [['req', 'orch'], ['orch', 'hc'], ['orch', 'lv'], ['hc', 'pbi'], ['lv', 'db'], ['lv', 'sk'], ['hc', 'qa'], ['lv', 'qa'], ['qa', 'rep'], ['rep', 'out']])
    for (const c of step.checks!) expect([c.id, c.test(g)]).toEqual([c.id, true])
    expect(planSimulation(g).outcome).toBe('success')
    expect(planSimulation(g, { injectFault: true }).outcome).toBe('caught')
  })

  it('Level 6 repair', () => {
    const step = archStep('l6', 'repair')
    for (const c of step.checks!) if (c.id !== 'bypass') expect(c.test(step.start)).toBe(false)
    let g: LabGraph = { nodes: step.start.nodes, edges: step.start.edges.filter((e) => !(e.target === 'rep' && (e.source === 'hc' || e.source === 'lv'))) }
    g = add(g, withId(createNode('qa', 0, 0), 'qa'))
    g = connect(g, [['hc', 'qa'], ['lv', 'qa'], ['qa', 'rep']])
    for (const c of step.checks!) expect([c.id, c.test(g)]).toEqual([c.id, true])
    const plan = planSimulation(g, { injectFault: true })
    expect(plan.outcome).toBe('caught')
    expect(plan.report?.lines.join(' ')).toContain('14.2%')
  })

  it('Level 8 accepts a principled design', () => {
    const step = archStep('l8', 'build')
    let g = add(
      step.start,
      withId(createNode('orchestrator', 0, 0), 'orch'),
      createAgent('headcount', 0, 0, 'hc'), createAgent('leavers', 0, 0, 'lv'), createAgent('reporting', 0, 0, 'rep'),
      createTool('powerbi', 0, 0, 'pbi'), createTool('hr-db', 0, 0, 'db'), createSkill('attrition-calc', 0, 0, 'sk'),
      withId(createNode('qa', 0, 0), 'qa'), withId(createNode('approval', 0, 0), 'appr'),
    )
    g = connect(g, [['req', 'orch'], ['orch', 'hc'], ['orch', 'lv'], ['hc', 'pbi'], ['lv', 'db'], ['lv', 'sk'], ['hc', 'qa'], ['lv', 'qa'], ['qa', 'rep'], ['rep', 'appr'], ['appr', 'out']])
    const r = reviewArchitecture(g)
    expect(r.overall).toBeGreaterThanOrEqual(step.passScore!)
    r.dimensions.forEach((d) => expect([d.id, d.score >= 40]).toEqual([d.id, true]))
    expect(planSimulation(g, { injectFault: true }).outcome).toBe('caught')
    // A blank canvas must not pass.
    expect(reviewArchitecture(step.start).overall).toBeLessThan(step.passScore!)
  })
})

describe('content integrity', () => {
  it('has unique ids and answerable challenges', () => {
    const lessonIds = new Set<string>()
    for (const level of LEVELS) {
      expect(level.lessons.length).toBeGreaterThan(0)
      for (const lesson of level.lessons) {
        expect(lessonIds.has(lesson.id)).toBe(false)
        lessonIds.add(lesson.id)
        const stepIds = lesson.steps.map((s) => s.id)
        expect(new Set(stepIds).size).toBe(stepIds.length)
        for (const s of lesson.steps) {
          if (s.kind === 'quiz' || s.kind === 'break-fix') expect(s.options.filter((o) => o.correct).length).toBe(1)
          if (s.kind === 'sort') s.items.forEach((i) => expect(s.buckets.map((b) => b.id)).toContain(i.bucket))
          if (s.kind === 'match') s.rounds.forEach((r) => expect(s.choices.map((c) => c.id)).toContain(r.answer))
        }
      }
    }
  })
})
