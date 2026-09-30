/**
 * Keeps the local progress store and the Supabase `progress` row in step.
 * The local store stays the source of truth while playing (works offline);
 * changes are pushed a moment later, and milestones go to the family feed.
 */
import { getAchievement } from '@/content/achievements'
import { LEVELS } from '@/content/course'
import { currentLevel, initialProgress, useProgress, type ProgressData } from '@/state/progress'
import { useAuth } from './auth'
import { supabase } from './client'

const OWNER = 'agent-lab:owner'
const lsGet = (k: string) => {
  try {
    return localStorage.getItem(k)
  } catch {
    return null
  }
}
const lsSet = (k: string, v: string | null) => {
  try {
    if (v === null) localStorage.removeItem(k)
    else localStorage.setItem(k, v)
  } catch { /* ignore */ }
}

export function snapshot(): ProgressData {
  const s = useProgress.getState()
  const base = initialProgress()
  const out = {} as Record<string, unknown>
  for (const k of Object.keys(base)) out[k] = (s as unknown as Record<string, unknown>)[k]
  return out as unknown as ProgressData
}

const byId = <T extends { id: string }>(a: T[], b: T[]) => {
  const m = new Map<string, T>()
  for (const x of [...b, ...a]) m.set(x.id, x)
  return [...m.values()]
}

/** Union of two progress states — nothing either device earned is lost. */
export function mergeProgress(a: ProgressData, b: Partial<ProgressData>): ProgressData {
  const base = initialProgress()
  const r = { ...base, ...b } as ProgressData
  return {
    ...a,
    learnerName: a.learnerName || r.learnerName,
    xp: Math.max(a.xp, r.xp ?? 0),
    completedSteps: { ...r.completedSteps, ...a.completedSteps },
    completedLessons: { ...r.completedLessons, ...a.completedLessons },
    completedLevels: { ...r.completedLevels, ...a.completedLevels },
    badges: { ...r.badges, ...a.badges },
    agents: byId(a.agents, r.agents ?? []),
    skills: byId(a.skills, r.skills ?? []),
    architectures: byId(a.architectures, r.architectures ?? []),
    counters: {
      simulations: Math.max(a.counters.simulations, r.counters?.simulations ?? 0),
      faultsCaught: Math.max(a.counters.faultsCaught, r.counters?.faultsCaught ?? 0),
      firstTry: Math.max(a.counters.firstTry, r.counters?.firstTry ?? 0),
    },
    streak: (r.streak?.lastDay ?? '') > (a.streak.lastDay ?? '') ? { ...r.streak, best: Math.max(r.streak.best, a.streak.best) } : { ...a.streak, best: Math.max(a.streak.best, r.streak?.best ?? 0) },
    activity: byId(a.activity, r.activity ?? []).sort((x, y) => y.at.localeCompare(x.at)).slice(0, 40),
    settings: a.settings,
  }
}

function summary(s: ProgressData) {
  return {
    xp: s.xp,
    current_level: currentLevel(s).number,
    levels_completed: LEVELS.filter((l) => s.completedLevels[l.id]).length,
    lessons_completed: Object.keys(s.completedLessons).length,
    badges: Object.keys(s.badges).length,
    streak: s.streak.count,
  }
}

let uid: string | null = null
let applying = false
let timer: ReturnType<typeof setTimeout> | null = null
let seenActivity = new Set<string>()
let seenBadges = new Set<string>()
export type SyncStatus = 'off' | 'syncing' | 'saved' | 'error'
let status: SyncStatus = 'off'
const listeners = new Set<(s: SyncStatus) => void>()
const setStatus = (s: SyncStatus) => {
  status = s
  listeners.forEach((l) => l(s))
}
export const onSyncStatus = (l: (s: SyncStatus) => void) => {
  listeners.add(l)
  l(status)
  return () => listeners.delete(l)
}

async function push() {
  if (!supabase || !uid) return
  const s = snapshot()
  setStatus('syncing')
  const { error } = await supabase.from('progress').upsert({ user_id: uid, data: s, ...summary(s), updated_at: new Date().toISOString() })
  setStatus(error ? 'error' : 'saved')
  await postMilestones(s)
}

async function postMilestones(s: ProgressData) {
  const familyId = useAuth.getState().profile?.family_id
  const rows: { user_id: string; family_id: string; kind: string; label: string; xp: number }[] = []
  for (const a of s.activity) {
    if (seenActivity.has(a.id)) continue
    seenActivity.add(a.id)
    if (a.icon === 'book-check') rows.push({ user_id: uid!, family_id: familyId!, kind: 'lesson', label: a.label.replace('Lesson complete: ', 'completed the lesson '), xp: a.xp })
    else if (a.icon === 'trophy') rows.push({ user_id: uid!, family_id: familyId!, kind: 'level', label: `completed ${a.label.replace(' complete', '')}`, xp: a.xp })
  }
  for (const id of Object.keys(s.badges)) {
    if (seenBadges.has(id)) continue
    seenBadges.add(id)
    const b = getAchievement(id)
    if (b) rows.push({ user_id: uid!, family_id: familyId!, kind: 'badge', label: `earned the ${b.name} badge`, xp: 0 })
  }
  if (familyId && rows.length && supabase) await supabase.from('activity').insert(rows)
}

function schedule() {
  if (applying || !uid) return
  if (timer) clearTimeout(timer)
  timer = setTimeout(push, 1200)
}

async function onSignedIn(userId: string) {
  if (!supabase || uid === userId) return
  uid = userId
  setStatus('syncing')
  const { data, error } = await supabase.from('progress').select('data').eq('user_id', userId).maybeSingle()
  if (error) {
    setStatus('error')
    return
  }
  const remote = (data?.data ?? {}) as Partial<ProgressData>
  const owner = lsGet(OWNER)
  const local = snapshot()
  // Progress on this device belongs to someone else: don't mix it in.
  const merged = owner && owner !== userId ? mergeProgress({ ...initialProgress(), settings: local.settings }, remote) : mergeProgress(local, remote)
  applying = true
  useProgress.getState().importData(merged)
  applying = false
  lsSet(OWNER, userId)
  seenActivity = new Set(merged.activity.map((a) => a.id))
  seenBadges = new Set(Object.keys(merged.badges))
  const profile = useAuth.getState().profile
  if (profile && !merged.learnerName) useProgress.getState().setName(profile.display_name)
  await push()
}

function onSignedOut() {
  if (!uid) return
  uid = null
  applying = true
  const settings = useProgress.getState().settings
  useProgress.getState().importData({ ...initialProgress(), settings })
  applying = false
  lsSet(OWNER, null)
  setStatus('off')
}

let wired = false
export function startCloudSync() {
  if (!supabase || wired) return
  wired = true
  useProgress.subscribe(schedule)
  useAuth.subscribe((s, prev) => {
    const id = s.session?.user.id ?? null
    const prevId = prev.session?.user.id ?? null
    if (id && id !== prevId) onSignedIn(id)
    if (!id && prevId) onSignedOut()
    // Joining a family later: nothing to replay, just future milestones.
  })
  const id = useAuth.getState().session?.user.id
  if (id) onSignedIn(id)
  window.addEventListener('beforeunload', () => {
    if (timer) push()
  })
}
