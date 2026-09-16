import { createClient } from '@/lib/supabase/server'
import { getPipelineStages } from '@/lib/services/admin'
import { StageManagementPage } from '@/components/admin/stage-management-page'
import type { PipelineStageRow } from '@/types/admin'

export const metadata = {
  title: 'Pipeline Stages',
}

export default async function AdminStagesPage() {
  const supabase = await createClient()
  const stages = await getPipelineStages(supabase)

  return <StageManagementPage stages={stages as unknown as PipelineStageRow[]} />
}
