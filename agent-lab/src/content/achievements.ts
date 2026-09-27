import type { ProgressData } from '@/state/progress'

export interface Achievement {
  id: string
  name: string
  icon: string
  description: string
  tier: 'bronze' | 'silver' | 'gold'
  /** Returns 0..1 progress. Awarded at 1. */
  progress: (s: ProgressData) => number
}

const lvl = (id: string) => (s: ProgressData) => (s.completedLevels[id] ? 1 : 0)

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first-steps', name: 'First Steps', icon: 'footprints', tier: 'bronze', description: 'Complete your first lesson.', progress: (s) => Math.min(1, Object.keys(s.completedLessons).length) },
  { id: 'agent-spotter', name: 'Agent Spotter', icon: 'scan-eye', tier: 'bronze', description: 'Complete Level 1 — Agent Basics.', progress: lvl('l1') },
  { id: 'first-agent', name: 'First Agent', icon: 'bot', tier: 'silver', description: 'Build and safely test your first agent.', progress: lvl('l2') },
  { id: 'skill-builder', name: 'Skill Builder', icon: 'sparkles', tier: 'silver', description: 'Build a reusable skill library.', progress: lvl('l3') },
  { id: 'orchestrator', name: 'Orchestrator', icon: 'network', tier: 'silver', description: 'Design a working multi-agent system.', progress: lvl('l4') },
  { id: 'tool-master', name: 'Tool Master', icon: 'plug', tier: 'silver', description: 'Match tools and permissions like a pro.', progress: lvl('l5') },
  { id: 'bug-hunter', name: 'Bug Hunter', icon: 'bug', tier: 'silver', description: 'Break and repair a failing workflow.', progress: lvl('l6') },
  { id: 'governance-guardian', name: 'Governance Guardian', icon: 'shield', tier: 'gold', description: 'Make the right call on high-risk agent actions.', progress: lvl('l7') },
  { id: 'agent-architect', name: 'Agent Architect', icon: 'crown', tier: 'gold', description: 'Pass the final build: an HR Intelligence System.', progress: lvl('l8') },
  { id: 'sharp-shooter', name: 'Sharp Shooter', icon: 'crosshair', tier: 'bronze', description: 'Get 10 challenges right on the first try.', progress: (s) => Math.min(1, s.counters.firstTry / 10) },
  { id: 'playground-pioneer', name: 'Playground Pioneer', icon: 'play-circle', tier: 'bronze', description: 'Run your first simulation in the Agent Playground.', progress: (s) => Math.min(1, s.counters.simulations) },
  { id: 'fault-finder', name: 'Fault Finder', icon: 'shield-alert', tier: 'silver', description: 'Catch an injected fault with a QA gate in the Playground.', progress: (s) => Math.min(1, s.counters.faultsCaught) },
  { id: 'architect-in-training', name: 'Blueprint Keeper', icon: 'save', tier: 'bronze', description: 'Save an architecture in the Playground.', progress: (s) => Math.min(1, s.architectures.length) },
  { id: 'on-a-roll', name: 'On a Roll', icon: 'flame', tier: 'silver', description: 'Keep a 3-day learning streak.', progress: (s) => Math.min(1, s.streak.best / 3) },
]

export const getAchievement = (id: string) => ACHIEVEMENTS.find((a) => a.id === id)
