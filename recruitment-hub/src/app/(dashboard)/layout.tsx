import type { ReactNode } from 'react'
import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'
import { getUnreadCount } from '@/lib/services/notifications'
import { AppShell } from '@/components/layout/app-shell'
import type { Role, User } from '@/types/database'

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient()

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()

  if (!authUser) {
    redirect('/login')
  }

  const [{ data: profileRow }, { data: roleRows }, unreadCount] = await Promise.all([
    supabase.from('users').select('*').eq('id', authUser.id).maybeSingle(),
    supabase.from('user_roles').select('role:roles(*)').eq('user_id', authUser.id),
    getUnreadCount(supabase, authUser.id).catch(() => 0),
  ])

  const profile = profileRow as User | null

  const roles = (roleRows ?? [])
    .map((row) => (row as unknown as { role: Role | null }).role)
    .filter((role): role is Role => role !== null)

  const userRoles = roles.map((role) => role.name)

  const displayName = profile
    ? `${profile.first_name} ${profile.last_name}`.trim()
    : (authUser.email ?? 'User')

  return (
    <AppShell
      user={{
        id: authUser.id,
        name: displayName || authUser.email || 'User',
        email: authUser.email ?? profile?.email ?? '',
        avatar_url: profile?.avatar_url ?? null,
        role: roles[0]?.name,
      }}
      userRoles={userRoles}
      notificationCount={unreadCount}
    >
      {children}
    </AppShell>
  )
}
