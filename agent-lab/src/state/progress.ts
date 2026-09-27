import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { LEVELS, allSteps, getLevel, stepKey } from '@/content/course'
import { ACHIEVEMENTS, getAchievement } from '@/content/achievements'
import { XP, isChallenge } from '@/content/xp'
import type { LabGraph } from '@/engine/graph'
import { daysBetween, todayKey, uid } from '@/lib/cn'
import { localRepository, STORAGE_KEY, toStateStorage } from './storage'
import { useUi } from './ui'

export interface SavedAgent {
  id: string
  name: string
  role: string
  goal: string
  instructions: string[]
  tools: string[]
  skills: string[]
  inputs: string[]
  outputs: string[]
  guardrails: string[]
  updatedAt: string
}

export interface SavedSkill {
  id: string
  name: string
  useWhen: string
  inputs: string[]
  steps: string[]
  output: string
  updatedAt: string
}

export interface SavedArchitecture {
  id: string
  name: string
  graph: LabGraph
  updatedAt: string
}

export interface ActivityItem {
  id: string
  at: string
  label: string
  xp: number
  icon: string
}

export interface ProgressData {
  learnerName: string
  xp: number
  completedSteps: Record<string, string>
  completedLessons: Record<string, string>
  completedLevels: Record<string, string>
  badges: Record<string, string>
  agents: SavedAgent[]
  skills: SavedSkill[]
  architectures: SavedArchitecture[]
  counters: { simulations: number; faultsCaught: number; firstTry: number }
  streak: { count: number; best: number; lastDay: string | null }
  activity: ActivityItem[]
  settings: { theme: 'dark' | 'light'; reducedMotion: boolean; previewAll: boolean }
}

interface Actions {
  completeStep: (lessonId: string, stepId: string, xp: number, label: string, firstTry?: boolean) => void
  completeLesson: (lessonId: string) => void
  saveAgent: (a: Omit<SavedAgent, 'updatedAt'>) => void
  saveSkill: (s: Omit<SavedSkill, 'updatedAt'>) => void
  saveArchitecture: (a: { id?: string; name: string; graph: LabGraph }) => string
  deleteArchitecture: (id: string) => void
  bump: (counter: keyof ProgressData['counters']) => void
  touchStreak: () => void
  setSettings: (s: Partial<ProgressData['settings']>) => void
  setName: (n: string) => void
  reset: () => void
  importData: (d: ProgressData) => void
}

export const initialProgress = (): ProgressData => ({
  learnerName: '',
  xp: 0,
  completedSteps: {},
  completedLessons: {},
  completedLevels: {},
  badges: {},
  agents: [],
  skills: [],
  architectures: [],
  counters: { simulations: 0, faultsCaught: 0, firstTry: 0 },
  streak: { count: 0, best: 0, lastDay: null },
  activity: [],
  settings: { theme: 'dark', reducedMotion: false, previewAll: false },
})

const now = () => new Date().toISOString()

export const useProgress = create<ProgressData & Actions>()(
  persist(
    (set, get) => {
      /** Add XP, log it and show a toast. */
      const grant = (xp: number, label: string, icon = 'zap') => {
        if (xp <= 0) return
        set((s) => ({
          xp: s.xp + xp,
          activity: [{ id: uid('act'), at: now(), label, xp, icon }, ...s.activity].slice(0, 40),
        }))
        useUi.getState().pushToast({ kind: 'xp', title: `+${xp} XP`, detail: label, icon })
      }

      const checkAchievements = () => {
        const s = get()
        const earned = ACHIEVEMENTS.filter((a) => !s.badges[a.id] && a.progress(s) >= 1)
        if (!earned.length) return
        const badges = { ...s.badges }
        earned.forEach((a) => (badges[a.id] = now()))
        set({ badges })
        const isLevelBadge = new Set(LEVELS.map((l) => l.badgeId))
        earned.forEach((a) => {
          if (!isLevelBadge.has(a.id)) {
            useUi.getState().pushToast({ kind: 'badge', title: `Achievement unlocked`, detail: a.name, icon: a.icon })
          }
        })
      }

      return {
        ...initialProgress(),

        completeStep: (lessonId, stepId, xp, label, firstTry) => {
          const key = stepKey(lessonId, stepId)
          if (get().completedSteps[key]) return
          set((s) => ({
            completedSteps: { ...s.completedSteps, [key]: now() },
            counters: firstTry ? { ...s.counters, firstTry: s.counters.firstTry + 1 } : s.counters,
          }))
          get().touchStreak()
          grant(xp, label, 'target')
          checkAchievements()
        },

        completeLesson: (lessonId) => {
          if (get().completedLessons[lessonId]) return
          set((s) => ({ completedLessons: { ...s.completedLessons, [lessonId]: now() } }))
          get().touchStreak()
          const level = LEVELS.find((l) => l.lessons.some((x) => x.id === lessonId))
          const lesson = level?.lessons.find((x) => x.id === lessonId)
          grant(XP.lesson, `Lesson complete: ${lesson?.title ?? ''}`, 'book-check')
          if (level && !get().completedLevels[level.id] && level.lessons.every((l) => get().completedLessons[l.id])) {
            set((s) => ({ completedLevels: { ...s.completedLevels, [level.id]: now() } }))
            grant(XP.level, `Level ${level.number} complete`, 'trophy')
            useUi.getState().celebrate({ type: 'level', levelNumber: level.number, title: level.title, unlocks: level.unlocks, xp: XP.level })
          }
          checkAchievements()
        },

        saveAgent: (a) => {
          set((s) => ({ agents: [{ ...a, updatedAt: now() }, ...s.agents.filter((x) => x.id !== a.id)] }))
          checkAchievements()
        },

        saveSkill: (sk) => {
          set((s) => ({ skills: [...s.skills.filter((x) => x.id !== sk.id), { ...sk, updatedAt: now() }] }))
          checkAchievements()
        },

        saveArchitecture: ({ id, name, graph }) => {
          const archId = id ?? uid('arch')
          set((s) => ({
            architectures: [{ id: archId, name, graph, updatedAt: now() }, ...s.architectures.filter((x) => x.id !== archId)],
          }))
          checkAchievements()
          return archId
        },

        deleteArchitecture: (id) => set((s) => ({ architectures: s.architectures.filter((a) => a.id !== id) })),

        bump: (counter) => {
          set((s) => ({ counters: { ...s.counters, [counter]: s.counters[counter] + 1 } }))
          get().touchStreak()
          checkAchievements()
        },

        touchStreak: () => {
          const today = todayKey()
          const { streak } = get()
          if (streak.lastDay === today) return
          const gap = streak.lastDay ? daysBetween(streak.lastDay, today) : Infinity
          const count = gap === 1 ? streak.count + 1 : 1
          set({ streak: { count, best: Math.max(streak.best, count), lastDay: today } })
        },

        setSettings: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),
        setName: (learnerName) => set({ learnerName }),
        reset: () => set({ ...initialProgress(), settings: get().settings }),
        importData: (d) => set({ ...initialProgress(), ...d }),
      }
    },
    {
      name: STORAGE_KEY,
      version: 1,
      storage: createJSONStorage(() => toStateStorage(localRepository)),
      partialize: (s) => {
        const { completeStep: _a, completeLesson: _b, saveAgent: _c, saveSkill: _d, saveArchitecture: _e, deleteArchitecture: _f, bump: _g, touchStreak: _h, setSettings: _i, setName: _j, reset: _k, importData: _l, ...data } = s
        return data
      },
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<ProgressData>
        const base = initialProgress()
        return {
          ...current,
          ...p,
          counters: { ...base.counters, ...p.counters },
          streak: { ...base.streak, ...p.streak },
          settings: { ...base.settings, ...p.settings },
        }
      },
    },
  ),
)

/* ───────── Selectors & helpers ───────── */

export function isLevelUnlocked(s: ProgressData, levelId: string) {
  const idx = LEVELS.findIndex((l) => l.id === levelId)
  if (idx <= 0) return idx === 0
  return s.settings.previewAll || !!s.completedLevels[LEVELS[idx - 1].id]
}

export function isLessonUnlocked(s: ProgressData, levelId: string, lessonId: string) {
  if (!isLevelUnlocked(s, levelId)) return false
  const level = getLevel(levelId)!
  const idx = level.lessons.findIndex((l) => l.id === lessonId)
  return idx <= 0 || s.settings.previewAll || !!s.completedLessons[level.lessons[idx - 1].id]
}

export function levelProgress(s: ProgressData, levelId: string) {
  const level = getLevel(levelId)!
  const done = level.lessons.filter((l) => s.completedLessons[l.id]).length
  return { done, total: level.lessons.length, ratio: done / level.lessons.length }
}

/** The level the learner is currently working on (first incomplete & unlocked). */
export function currentLevel(s: ProgressData) {
  return LEVELS.find((l) => !s.completedLevels[l.id] && isLevelUnlocked(s, l.id)) ?? LEVELS[LEVELS.length - 1]
}

/** The next lesson to do, if any. */
export function nextLesson(s: ProgressData) {
  for (const level of LEVELS) {
    if (!isLevelUnlocked(s, level.id)) continue
    for (const lesson of level.lessons) {
      if (!s.completedLessons[lesson.id] && isLessonUnlocked(s, level.id, lesson.id)) return { level, lesson }
    }
  }
  return undefined
}

export function missionsCompleted(s: ProgressData) {
  return allSteps().filter(({ lesson, step }) => isChallenge(step) && s.completedSteps[stepKey(lesson.id, step.id)]).length
}

export const totalMissions = () => allSteps().filter(({ step }) => isChallenge(step)).length

export { getAchievement }
