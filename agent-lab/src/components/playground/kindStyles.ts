import type { NodeKind } from '@/engine/graph'

export const KIND_STYLE: Record<NodeKind, { ring: string; tile: string; text: string }> = {
  request: { ring: 'border-slate-400/40', tile: 'bg-slate-500/15 text-slate-600 dark:text-slate-300', text: 'text-slate-600 dark:text-slate-300' },
  orchestrator: { ring: 'border-violet-500/50', tile: 'bg-violet-500/15 text-violet-600 dark:text-violet-300', text: 'text-violet-600 dark:text-violet-300' },
  agent: { ring: 'border-cyan-500/50', tile: 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300', text: 'text-cyan-700 dark:text-cyan-300' },
  skill: { ring: 'border-amber-500/50', tile: 'bg-amber-500/15 text-amber-700 dark:text-amber-300', text: 'text-amber-700 dark:text-amber-300' },
  tool: { ring: 'border-emerald-500/50', tile: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300', text: 'text-emerald-700 dark:text-emerald-300' },
  qa: { ring: 'border-lime-500/50', tile: 'bg-lime-500/15 text-lime-700 dark:text-lime-300', text: 'text-lime-700 dark:text-lime-300' },
  approval: { ring: 'border-rose-500/50', tile: 'bg-rose-500/15 text-rose-600 dark:text-rose-300', text: 'text-rose-600 dark:text-rose-300' },
  output: { ring: 'border-sky-500/50', tile: 'bg-sky-500/15 text-sky-700 dark:text-sky-300', text: 'text-sky-700 dark:text-sky-300' },
}
