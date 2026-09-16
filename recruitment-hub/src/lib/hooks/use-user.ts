'use client'

import { useCallback, useEffect, useState } from 'react'
import type { User as SupabaseAuthUser } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import type { Role, User } from '@/types/database'
import type { RoleName } from '@/types'

export interface UseUserResult {
  /** The Supabase auth user, if signed in. */
  authUser: SupabaseAuthUser | null
  /** The application's `users` table row for the signed-in user. */
  profile: User | null
  /** Roles assigned to the signed-in user. */
  roles: Role[]
  loading: boolean
  error: string | null
  isAdmin: boolean
  isRecruiter: boolean
  isHiringManager: boolean
  isInterviewer: boolean
  /** Case-insensitive check against the user's assigned role names. */
  hasRole: (role: RoleName | string) => boolean
  refresh: () => Promise<void>
}

/**
 * Client-side hook that resolves the currently signed-in user along with
 * their application profile and role assignments. Intended for use in
 * Client Components that need to branch on the user's identity or
 * permissions (nav visibility, guarded actions, etc.).
 */
export function useUser(): UseUserResult {
  const [authUser, setAuthUser] = useState<SupabaseAuthUser | null>(null)
  const [profile, setProfile] = useState<User | null>(null)
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError) throw authError

      setAuthUser(user)

      if (!user) {
        setProfile(null)
        setRoles([])
        return
      }

      const [{ data: profileData, error: profileError }, { data: userRoleRows, error: userRoleError }] =
        await Promise.all([
          supabase.from('users').select('*').eq('id', user.id).maybeSingle(),
          supabase.from('user_roles').select('role_id').eq('user_id', user.id),
        ])

      if (profileError) throw profileError
      if (userRoleError) throw userRoleError

      setProfile((profileData as User | null) ?? null)

      const roleIds = ((userRoleRows ?? []) as Array<{ role_id: string }>).map((row) => row.role_id)

      if (roleIds.length === 0) {
        setRoles([])
      } else {
        const { data: roleRows, error: roleError } = await supabase
          .from('roles')
          .select('*')
          .in('id', roleIds)

        if (roleError) throw roleError
        setRoles((roleRows ?? []) as Role[])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load current user')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // Defer to a microtask so the initial fetch (and its setState calls)
    // never runs synchronously within the effect body itself.
    void Promise.resolve().then(() => load())

    const supabase = createClient()
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void load()
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [load])

  const hasRole = useCallback(
    (role: RoleName | string) => roles.some((r) => r.name.toLowerCase() === role.toLowerCase()),
    [roles]
  )

  return {
    authUser,
    profile,
    roles,
    loading,
    error,
    isAdmin: hasRole('admin'),
    isRecruiter: hasRole('recruiter'),
    isHiringManager: hasRole('hiring_manager'),
    isInterviewer: hasRole('interviewer'),
    hasRole,
    refresh: load,
  }
}
