import type { LabGraph, NodeKind } from '@/engine/graph'

export type Phase = 'learn' | 'see' | 'try' | 'build' | 'break' | 'fix' | 'reflect'

export interface LearnMore { label: string; href: string }

export interface MissionBrief {
  mission: string
  objective: string
  components?: string[]
  success: string
}

interface StepBase {
  id: string
  phase: Phase
  title: string
  mission?: MissionBrief
}

export type VisualId =
  | 'llm-vs-agent'
  | 'agent-loop'
  | 'agent-anatomy'
  | 'who-how-what-rules'
  | 'mega-vs-modular'
  | 'orchestration'
  | 'mcp'
  | 'permissions'
  | 'reliability-stack'
  | 'governance-gates'

export interface LearnStep extends StepBase {
  kind: 'learn'
  body: string[]
  points?: { icon: string; term: string; text: string }[]
  visual?: VisualId
  learnMore?: LearnMore
}

export interface CardsStep extends StepBase {
  kind: 'cards'
  intro: string
  cards: { icon: string; term: string; text: string; example: string }[]
}

export interface QuizOption { id: string; text: string; correct?: boolean; feedback: string }
export interface QuizStep extends StepBase {
  kind: 'quiz'
  question: string
  context?: string
  /** 'governance' renders options as ALLOW / DENY / APPROVAL decision tiles. */
  variant?: 'default' | 'governance' | 'scenario'
  scenario?: { actor: string; action: string; details: { label: string; value: string }[]; risk?: 'low' | 'medium' | 'high' }
  options: QuizOption[]
}

export interface SortStep extends StepBase {
  kind: 'sort'
  prompt: string
  source?: { title: string; text: string }
  buckets: { id: string; label: string; icon: string; hint: string }[]
  items: { id: string; text: string; bucket: string; why: string }[]
}

export interface SequenceStep extends StepBase {
  kind: 'sequence'
  prompt: string
  /** Listed in the correct order; shuffled for the learner. */
  items: { id: string; text: string; icon?: string }[]
  explanation: string
}

export interface MatchStep extends StepBase {
  kind: 'match'
  prompt: string
  choices: { id: string; label: string; icon: string; desc: string }[]
  rounds: { id: string; question: string; answer: string; why: string; wrong?: Record<string, string> }[]
}

export interface AgentBuilderStep extends StepBase { kind: 'agent-builder' }
export interface AgentRunStep extends StepBase { kind: 'agent-run' }
export interface SkillBuilderStep extends StepBase { kind: 'skill-builder' }

export interface BreakFixStep extends StepBase {
  kind: 'break-fix'
  scenario: string
  evidence: { label: string; value: string; tone?: 'bad' | 'ok' | 'neutral' }[]
  question: string
  options: QuizOption[]
  fixTitle: string
  fix: { before: string[]; after: string[]; note: string }
}

export interface ArchitectureCheck {
  id: string
  label: string
  test: (g: LabGraph) => boolean
  hint: string
}

export interface ArchitectureStep extends StepBase {
  kind: 'architecture'
  intro: string
  start: LabGraph
  palette: PaletteItem[]
  /** 'checks' = pass/fail checklist; 'score' = principle-based evaluation (final build). */
  grading: 'checks' | 'score'
  checks?: ArchitectureCheck[]
  passScore?: number
  simulate?: boolean
  /** Fault injection in the simulator: off by default, on by default, or forced on. */
  fault?: 'optional' | 'on' | 'locked'
}

export type PaletteItem =
  | { kind: Exclude<NodeKind, 'agent' | 'tool' | 'skill'> }
  | { kind: 'agent'; specialty: import('@/engine/graph').Specialty }
  | { kind: 'tool'; toolId: string }
  | { kind: 'skill'; skillId: string }

export interface ReflectStep extends StepBase {
  kind: 'reflect'
  takeaway: string
  instincts: string[]
  learnMore?: LearnMore
}

export type Step =
  | LearnStep
  | CardsStep
  | QuizStep
  | SortStep
  | SequenceStep
  | MatchStep
  | AgentBuilderStep
  | AgentRunStep
  | SkillBuilderStep
  | BreakFixStep
  | ArchitectureStep
  | ReflectStep

export interface Lesson {
  id: string
  title: string
  summary: string
  minutes: number
  steps: Step[]
}

export interface Level {
  id: string
  number: number
  pathLabel: string
  title: string
  theme: string
  description: string
  icon: string
  unlocks: string
  badgeId: string
  concepts: string[]
  lessons: Lesson[]
  learnMore?: LearnMore[]
}
