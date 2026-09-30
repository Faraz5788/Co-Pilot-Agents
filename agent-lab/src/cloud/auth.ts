import { create } from 'zustand'
import type { Session } from '@supabase/supabase-js'
import { supabase, type Family, type Profile } from './client'

const PENDING_JOIN = 'agent-lab:pending-join'
const GUEST = 'agent-lab:guest'

interface AuthState {
  ready: boolean
  session: Session | null
  profile: Profile | null
  family: Family | null
  guest: boolean
  init: () => void
  sendMagicLink: (email: string, displayName: string) => Promise<void>
  signOut: () => Promise<void>
  continueAsGuest: () => void
  refresh: () => Promise<void>
  updateProfile: (p: Partial<Pick<Profile, 'display_name' | 'avatar_color'>>) => Promise<void>
  createFamily: (name: string) => Promise<void>
  joinFamily: (code: string) => Promise<void>
  leaveFamily: () => Promise<void>
}

const readGuest = () => {
  try {
    return localStorage.getItem(GUEST) === '1'
  } catch {
    return false
  }
}

export const rememberJoinCode = (code: string) => {
  try {
    localStorage.setItem(PENDING_JOIN, code.toUpperCase())
  } catch { /* ignore */ }
}

let started = false

export const useAuth = create<AuthState>((set, get) => ({
  ready: !supabase,
  session: null,
  profile: null,
  family: null,
  guest: readGuest(),

  init: () => {
    if (!supabase || started) return
    started = true
    supabase.auth.getSession().then(({ data }) => {
      set({ session: data.session })
      if (data.session) get().refresh().finally(() => set({ ready: true }))
      else set({ ready: true })
    })
    supabase.auth.onAuthStateChange((_event, session) => {
      const prev = get().session?.user.id
      set({ session })
      if (session && session.user.id !== prev) get().refresh()
      if (!session) set({ profile: null, family: null })
    })
  },

  sendMagicLink: async (email, displayName) => {
    if (!supabase) throw new Error('Cloud sync is not configured')
    const redirect = window.location.origin + window.location.pathname
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: redirect, data: { display_name: displayName.trim() } },
    })
    if (error) throw error
  },

  signOut: async () => {
    await supabase?.auth.signOut()
    set({ session: null, profile: null, family: null })
  },

  continueAsGuest: () => {
    try {
      localStorage.setItem(GUEST, '1')
    } catch { /* ignore */ }
    set({ guest: true })
  },

  refresh: async () => {
    if (!supabase) return
    const uid = get().session?.user.id
    if (!uid) return
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', uid).maybeSingle()
    let family: Family | null = null
    if (profile?.family_id) {
      const { data } = await supabase.from('families').select('*').eq('id', profile.family_id).maybeSingle()
      family = data
    }
    set({ profile: profile ?? null, family })
    // Apply a join link that was opened before signing in.
    let pending: string | null = null
    try {
      pending = localStorage.getItem(PENDING_JOIN)
    } catch { /* ignore */ }
    if (pending && profile && !profile.family_id) {
      try {
        localStorage.removeItem(PENDING_JOIN)
        await get().joinFamily(pending)
      } catch { /* invalid code: user can retry on the Family page */ }
    }
  },

  updateProfile: async (p) => {
    const uid = get().session?.user.id
    if (!supabase || !uid) return
    const { error } = await supabase.from('profiles').update(p).eq('id', uid)
    if (error) throw error
    set({ profile: get().profile ? { ...get().profile!, ...p } : null })
  },

  createFamily: async (name) => {
    if (!supabase) return
    const { error } = await supabase.rpc('create_family', { family_name: name })
    if (error) throw error
    await get().refresh()
  },

  joinFamily: async (code) => {
    if (!supabase) return
    const { error } = await supabase.rpc('join_family', { code })
    if (error) throw new Error(error.message.includes('No family') ? 'No family found with that code.' : error.message)
    await get().refresh()
  },

  leaveFamily: async () => {
    if (!supabase) return
    const { error } = await supabase.rpc('leave_family')
    if (error) throw error
    await get().refresh()
  },
}))
