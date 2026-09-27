import { SKILLS, TOOLS, byId } from '@/content/catalog'
import type { PaletteItem } from '@/content/types'
import type { LabNode, Specialty } from './graph'
import { KIND_META, SPECIALTY_PRESETS, createAgent, createNode, createSkill, createTool } from './nodeFactory'

export function paletteLabel(p: PaletteItem): { label: string; icon: string; sub: string } {
  if (p.kind === 'agent') return { label: SPECIALTY_PRESETS[p.specialty].label, icon: 'bot', sub: SPECIALTY_PRESETS[p.specialty].role }
  if (p.kind === 'tool') {
    const t = byId(TOOLS, p.toolId)!
    return { label: t.name, icon: t.icon, sub: t.permissions.join(' · ').toUpperCase() }
  }
  if (p.kind === 'skill') {
    const s = byId(SKILLS, p.skillId)!
    return { label: s.name, icon: s.icon, sub: 'Skill' }
  }
  return { label: KIND_META[p.kind].label, icon: KIND_META[p.kind].icon, sub: KIND_META[p.kind].blurb }
}

export function createFromPalette(p: PaletteItem, x: number, y: number): LabNode {
  if (p.kind === 'agent') return createAgent(p.specialty, x, y)
  if (p.kind === 'tool') return createTool(p.toolId, x, y)
  if (p.kind === 'skill') return createSkill(p.skillId, x, y)
  return createNode(p.kind, x, y)
}

const SPECIALTIES: Specialty[] = ['headcount', 'leavers', 'analysis', 'reporting', 'research', 'qa', 'general']

export const FULL_PALETTE: { group: string; items: PaletteItem[] }[] = [
  { group: 'Flow', items: [{ kind: 'request' }, { kind: 'orchestrator' }, { kind: 'qa' }, { kind: 'approval' }, { kind: 'output' }] },
  { group: 'Agents', items: SPECIALTIES.map((specialty) => ({ kind: 'agent' as const, specialty })) },
  { group: 'Skills', items: SKILLS.map((s) => ({ kind: 'skill' as const, skillId: s.id })) },
  { group: 'Tools', items: TOOLS.map((t) => ({ kind: 'tool' as const, toolId: t.id })) },
]

export function groupPalette(items: PaletteItem[]) {
  const groups: Record<string, PaletteItem[]> = {}
  items.forEach((p) => {
    const g = p.kind === 'agent' ? 'Agents' : p.kind === 'skill' ? 'Skills' : p.kind === 'tool' ? 'Tools' : 'Flow'
    ;(groups[g] ??= []).push(p)
  })
  return ['Flow', 'Agents', 'Skills', 'Tools'].filter((g) => groups[g]).map((g) => ({ group: g, items: groups[g] }))
}
