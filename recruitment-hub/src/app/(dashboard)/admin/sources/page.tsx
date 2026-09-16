import { createClient } from '@/lib/supabase/server'
import { getSources } from '@/lib/services/admin'
import { SourceManagementPage } from '@/components/admin/source-management-page'
import type { SourceRow } from '@/types/admin'

export const metadata = {
  title: 'Sources',
}

export default async function AdminSourcesPage() {
  const supabase = await createClient()
  const sources = await getSources(supabase)

  return <SourceManagementPage sources={sources as unknown as SourceRow[]} />
}
