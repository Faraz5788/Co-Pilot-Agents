import { lazy, type ComponentType } from 'react'
import type { Step } from '@/content/types'
import { AgentBuilderStep } from './AgentBuilderStep'
import { AgentRunStep } from './AgentRunStep'
import { BreakFixStep } from './BreakFixStep'
import { CardsStep } from './CardsStep'
import { LearnStep } from './LearnStep'
import { MatchStep } from './MatchStep'
import { QuizStep } from './QuizStep'
import { ReflectStep } from './ReflectStep'
import { SequenceStep } from './SequenceStep'
import { SkillBuilderStep } from './SkillBuilderStep'
import { SortStep } from './SortStep'
import type { StepProps } from './shared'

// The canvas (React Flow) is only loaded when an architecture challenge opens.
const ArchitectureStep = lazy(() => import('./ArchitectureStep').then((m) => ({ default: m.ArchitectureStep })))

/** Add a new interaction type by adding a kind to `Step` and a component here. */
export const STEP_COMPONENTS: { [K in Step['kind']]: ComponentType<StepProps<Extract<Step, { kind: K }>>> } = {
  learn: LearnStep,
  cards: CardsStep,
  quiz: QuizStep,
  sort: SortStep,
  sequence: SequenceStep,
  match: MatchStep,
  'agent-builder': AgentBuilderStep,
  'agent-run': AgentRunStep,
  'skill-builder': SkillBuilderStep,
  'break-fix': BreakFixStep,
  architecture: ArchitectureStep as unknown as ComponentType<StepProps<Extract<Step, { kind: 'architecture' }>>>,
  reflect: ReflectStep,
}

export const PHASE_META: Record<Step['phase'], { label: string; icon: string; tone: string }> = {
  learn: { label: 'Learn', icon: 'book-open', tone: 'text-accent' },
  see: { label: 'See', icon: 'eye', tone: 'text-accent-2' },
  try: { label: 'Try', icon: 'pointer', tone: 'text-accent-2' },
  build: { label: 'Build', icon: 'hammer', tone: 'text-ok' },
  break: { label: 'Break', icon: 'bug', tone: 'text-bad' },
  fix: { label: 'Fix', icon: 'wrench', tone: 'text-warn' },
  reflect: { label: 'Reflect', icon: 'lightbulb', tone: 'text-gold' },
}
