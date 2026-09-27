import { type LabGraph, type LabNode, edgeId } from '@/engine/graph'
import { createAgent, createNode, createSkill, createTool, withId } from '@/engine/nodeFactory'

const link = (pairs: [string, string][]) => pairs.map(([s, t]) => ({ id: edgeId(s, t), source: s, target: t }))

export function attritionPipeline(): LabGraph {
  const nodes: LabNode[] = [
    withId(createNode('request', 300, 0), 'req'),
    withId(createNode('orchestrator', 300, 120, {}, 'HR Orchestrator'), 'orch'),
    createAgent('headcount', 20, 250, 'hc'),
    createAgent('leavers', 300, 250, 'lv'),
    createAgent('research', 580, 250, 'rs'),
    createTool('powerbi', -170, 390, 't_pbi'),
    createSkill('headcount-analysis', 0, 400, 't_hcs'),
    createTool('hr-db', 190, 400, 't_db'),
    createSkill('attrition-calc', 370, 400, 'sk_att'),
    createTool('web', 660, 390, 't_web'),
    withId(createNode('qa', 300, 520, {}, 'QA Gate'), 'qa'),
    createAgent('reporting', 300, 640, 'rep'),
    withId(createNode('approval', 300, 760), 'appr'),
    withId(createNode('output', 300, 880, {}, 'Executive Report'), 'out'),
  ]
  const edges = link([
    ['req', 'orch'], ['orch', 'hc'], ['orch', 'lv'], ['orch', 'rs'],
    ['hc', 't_pbi'], ['hc', 't_hcs'], ['lv', 't_db'], ['lv', 'sk_att'], ['rs', 't_web'],
    ['hc', 'qa'], ['lv', 'qa'], ['rs', 'qa'], ['qa', 'rep'], ['rep', 'appr'], ['appr', 'out'],
  ])
  return { nodes, edges }
}

export function singleAgent(): LabGraph {
  const nodes: LabNode[] = [
    withId(createNode('request', 200, 0, { text: 'What is our headcount by department?' }), 'req'),
    createAgent('headcount', 200, 130, 'hc'),
    createTool('powerbi', 60, 260, 't_pbi'),
    createSkill('headcount-analysis', 340, 260, 'sk'),
    withId(createNode('output', 200, 380, { format: 'Short answer + table' }, 'Answer'), 'out'),
  ]
  return { nodes, edges: link([['req', 'hc'], ['hc', 't_pbi'], ['hc', 'sk'], ['hc', 'out']]) }
}

export function blankGraph(): LabGraph {
  return {
    nodes: [withId(createNode('request', 250, 0), 'req'), withId(createNode('output', 250, 520, {}, 'Output'), 'out')],
    edges: [],
  }
}

export const TEMPLATES = [
  { id: 'attrition', name: 'Attrition investigation', icon: 'network', desc: 'Orchestrator, three specialists, QA, reporting and approval.', build: attritionPipeline },
  { id: 'single', name: 'Single agent', icon: 'bot', desc: 'One headcount agent with a tool and a skill.', build: singleAgent },
  { id: 'blank', name: 'Blank canvas', icon: 'plus', desc: 'Just a request and an output. Build from scratch.', build: blankGraph },
]
