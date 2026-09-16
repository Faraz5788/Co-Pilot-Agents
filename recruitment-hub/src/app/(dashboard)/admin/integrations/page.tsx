import { createClient } from '@/lib/supabase/server'
import { IntegrationsPage } from '@/components/admin/integrations-page'
import type { IntegrationEventRow } from '@/types/admin'

export const metadata = {
  title: 'Integrations',
}

export default async function AdminIntegrationsPage() {
  const supabase = await createClient()

  const { data: events } = await supabase
    .from('integration_events')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(25)

  return <IntegrationsPage events={(events ?? []) as unknown as IntegrationEventRow[]} />
}
