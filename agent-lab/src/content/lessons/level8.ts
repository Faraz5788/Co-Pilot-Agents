import type { Level } from '../types'
import { LINKS } from '../resources'
import { createNode, withId } from '@/engine/nodeFactory'
import { FULL_PALETTE } from '@/engine/palette'

export const level8: Level = {
  id: 'l8',
  number: 8,
  pathLabel: 'Final build',
  title: 'Final Boss',
  theme: 'Build an HR Intelligence System.',
  description: 'A blank canvas and everything you’ve learned. Design a system that answers workforce questions safely — scored on principles, not one right answer.',
  icon: 'crown',
  unlocks: 'Agent Architect',
  badgeId: 'agent-architect',
  concepts: ['Orchestration', 'Specialist agents', 'Skills', 'Data tools', 'QA', 'Reporting', 'Governance', 'Human approval'],
  learnMore: [LINKS.customAgents, LINKS.subagents, LINKS.skills, LINKS.mcp, LINKS.hooks],
  lessons: [
    {
      id: 'l8-final',
      title: 'HR Intelligence System',
      summary: 'Design, submit, improve, prove.',
      minutes: 15,
      steps: [
        {
          id: 'brief',
          kind: 'learn',
          phase: 'learn',
          title: 'The brief',
          body: [
            'Halcyon Group wants an AI system that can answer workforce questions, analyse headcount and leavers, calculate attrition, validate its analysis and produce executive reports — safely.',
            'There’s no single right answer. Your design is reviewed against six principles. Aim for 70+ overall with nothing below 40 — then prove it by running it with a fault injected.',
          ],
          points: [
            { icon: 'split', term: 'Separation', text: 'Specialists with clear jobs.' },
            { icon: 'wrench', term: 'Tools & skills', text: 'Right sources, shared methods.' },
            { icon: 'shield-check', term: 'Reliability', text: 'Validation before output.' },
            { icon: 'lock', term: 'Security', text: 'Least privilege, no needless PII.' },
            { icon: 'user-check', term: 'Oversight', text: 'Humans where it matters.' },
            { icon: 'gauge', term: 'Efficiency', text: 'Parallel, lean, connected.' },
          ],
        },
        {
          id: 'build',
          kind: 'architecture',
          phase: 'build',
          title: 'Build the HR Intelligence System',
          mission: {
            mission: '“Create an AI system capable of answering workforce questions, analysing headcount and leavers, calculating attrition, validating its analysis and producing executive reports safely.”',
            objective: 'Design the architecture from a blank canvas, submit it for review, then run it with a fault injected.',
            components: ['Orchestrator', 'Agents', 'Skills', 'Tools', 'QA Gate', 'Human Approval', 'Output'],
            success: 'Review score 70+ with every principle at 40+, and a successful simulation.',
          },
          intro: 'Start from the request and work down to the output. Configure nodes in the Inspect tab — permissions, QA retry behaviour and guardrails all count.',
          start: {
            nodes: [
              { ...withId(createNode('request', 320, 0, { text: 'Analyse voluntary attrition over the last 12 months and create an executive report.' }), 'req'), locked: true },
              { ...withId(createNode('output', 320, 900, { format: 'Executive report' }, 'Executive Report'), 'out'), locked: true },
            ],
            edges: [],
          },
          palette: FULL_PALETTE.flatMap((g) => g.items).filter((p) => p.kind !== 'request' && p.kind !== 'output'),
          grading: 'score',
          passScore: 70,
          simulate: true,
          fault: 'on',
        },
        {
          id: 'reflect',
          kind: 'reflect',
          phase: 'reflect',
          title: 'You think like an architect now',
          takeaway: 'You started by asking what an agent is. Now you design systems: specialists with clear jobs, shared skills, least-privilege tools, deterministic checks, humans where it matters — and logs for everything.',
          instincts: [
            '“That belongs in instructions.”',
            '“That should be a reusable skill.”',
            '“That requires a specialised agent.”',
            '“Those two tasks can run in parallel.”',
            '“That tool should only have read permission.”',
            '“That output needs deterministic validation.”',
            '“That action requires human approval.”',
            '“That should be logged.”',
          ],
        },
      ],
    },
  ],
}
