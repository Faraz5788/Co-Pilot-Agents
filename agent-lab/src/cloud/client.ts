import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined

/** Null when no backend is configured — the app then runs fully offline. */
export const supabase: SupabaseClient | null =
  url && key
    ? createClient(url, key, {
        auth: { flowType: 'pkce', persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
      })
    : null

export const cloudEnabled = !!supabase

export interface Profile {
  id: string
  display_name: string
  avatar_color: string
  family_id: string | null
  created_at: string
}

export interface Family {
  id: string
  name: string
  join_code: string
  created_by: string | null
}

export interface ProgressRow {
  user_id: string
  xp: number
  current_level: number
  levels_completed: number
  lessons_completed: number
  badges: number
  streak: number
  updated_at: string
}

export interface ActivityRow {
  id: number
  user_id: string
  family_id: string
  kind: string
  label: string
  xp: number
  created_at: string
}

export interface MessageRow {
  id: number
  family_id: string
  user_id: string
  channel: string
  body: string
  is_question: boolean
  answered: boolean
  created_at: string
}

export const AVATAR_COLORS: Record<string, string> = {
  violet: 'from-violet-500 to-fuchsia-500',
  cyan: 'from-cyan-500 to-sky-500',
  emerald: 'from-emerald-500 to-teal-500',
  amber: 'from-amber-500 to-orange-500',
  rose: 'from-rose-500 to-pink-500',
  indigo: 'from-indigo-500 to-blue-500',
}
