import type { Step } from './types'

export const XP = {
  lesson: 50,
  challenge: 25,
  build: 100,
  fix: 75,
  level: 250,
} as const

/** XP awarded the first time a step is completed. */
export function stepXp(step: Step): number {
  switch (step.kind) {
    case 'quiz':
    case 'match':
    case 'sort':
    case 'sequence':
      return XP.challenge
    case 'agent-builder':
    case 'skill-builder':
    case 'architecture':
      return XP.build
    case 'break-fix':
    case 'agent-run':
      return XP.fix
    default:
      return 0
  }
}

export const isChallenge = (step: Step) => stepXp(step) > 0

/** Learner rank shown next to their level. */
export const RANKS = [
  { xp: 0, title: 'Curious Observer' },
  { xp: 300, title: 'Agent Apprentice' },
  { xp: 900, title: 'Agent Builder' },
  { xp: 1600, title: 'Skill Crafter' },
  { xp: 2400, title: 'Systems Thinker' },
  { xp: 3300, title: 'Agent Architect' },
]

export function rankFor(xp: number) {
  let r = RANKS[0]
  for (const x of RANKS) if (xp >= x.xp) r = x
  const next = RANKS[RANKS.indexOf(r) + 1]
  return { ...r, next, progress: next ? (xp - r.xp) / (next.xp - r.xp) : 1 }
}
