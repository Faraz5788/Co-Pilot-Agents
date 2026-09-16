import { createClient } from '@/lib/supabase/server'
import { getUsers, getRoles } from '@/lib/services/admin'
import { UserManagementPage } from '@/components/admin/user-management-page'
import type { AdminUserRow, RoleRow } from '@/types/admin'

export const metadata = {
  title: 'Users',
}

export default async function AdminUsersPage() {
  const supabase = await createClient()

  const [users, roles] = await Promise.all([getUsers(supabase), getRoles(supabase)])

  return (
    <UserManagementPage
      users={users as unknown as AdminUserRow[]}
      roles={roles as unknown as RoleRow[]}
    />
  )
}
