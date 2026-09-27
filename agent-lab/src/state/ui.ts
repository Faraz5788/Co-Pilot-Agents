import { create } from 'zustand'
import { uid } from '@/lib/cn'

export interface Toast {
  id: string
  kind: 'xp' | 'badge' | 'info' | 'error'
  title: string
  detail?: string
  icon?: string
}

type LevelCelebration = { type: 'level'; levelNumber: number; title: string; unlocks: string; xp: number }
type BadgeCelebration = { type: 'badge'; badgeId: string }
export type CelebrationInput = LevelCelebration | BadgeCelebration
export type Celebration = CelebrationInput & { id: string }

interface UiState {
  toasts: Toast[]
  celebrations: Celebration[]
  mobileNavOpen: boolean
  pushToast: (t: Omit<Toast, 'id'>) => void
  dismissToast: (id: string) => void
  celebrate: (c: CelebrationInput) => void
  shiftCelebration: () => void
  setMobileNav: (open: boolean) => void
}

export const useUi = create<UiState>((set, get) => ({
  toasts: [],
  celebrations: [],
  mobileNavOpen: false,
  pushToast: (t) => {
    const id = uid('toast')
    set({ toasts: [...get().toasts.slice(-3), { ...t, id }] })
    setTimeout(() => get().dismissToast(id), t.kind === 'badge' ? 4200 : 2600)
  },
  dismissToast: (id) => set({ toasts: get().toasts.filter((t) => t.id !== id) }),
  celebrate: (c) => set({ celebrations: [...get().celebrations, { ...c, id: uid('cel') }] }),
  shiftCelebration: () => set({ celebrations: get().celebrations.slice(1) }),
  setMobileNav: (open) => set({ mobileNavOpen: open }),
}))
