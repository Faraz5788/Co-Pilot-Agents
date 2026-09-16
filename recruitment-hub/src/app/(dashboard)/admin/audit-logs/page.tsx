import { createClient } from '@/lib/supabase/server'
import { getAuditLogs } from '@/lib/services/audit'
import { getUsers } from '@/lib/services/admin'
import { AuditLogPage } from '@/components/admin/audit-log-page'
import type { AuditLogListResult, AdminUserRow } from '@/types/admin'

export const metadata = {
  title: 'Audit Logs',
}

export default async function AdminAuditLogsPage() {
  const supabase = await createClient()

  const [result, users] = await Promise.all([
    getAuditLogs(supabase, { page: 1, pageSize: 25 }),
    getUsers(supabase),
  ])

  return (
    <AuditLogPage
      initialResult={result as unknown as AuditLogListResult}
      users={users as unknown as AdminUserRow[]}
    />
  )
}
