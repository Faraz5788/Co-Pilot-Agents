import type { SavedAgent } from '@/state/progress'

export const ANALYST_ID = 'hr-analyst'

export const blankAnalyst = (): Omit<SavedAgent, 'updatedAt'> => ({
  id: ANALYST_ID,
  name: 'HR Data Analyst',
  role: '',
  goal: '',
  instructions: [],
  tools: [],
  skills: [],
  inputs: ['question'],
  outputs: [],
  guardrails: [],
})
