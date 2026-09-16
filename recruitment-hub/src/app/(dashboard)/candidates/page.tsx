import { createClient } from '@/lib/supabase/server'
import { getCandidates } from '@/lib/services/candidates'
import { getSources } from '@/lib/services/admin'
import { CandidateListPage } from '@/components/candidates/candidate-list-page'

interface CandidatesPageProps {
  searchParams: Promise<{
    search?: string
    source?: string
    page?: string
  }>
}

export default async function CandidatesPage({ searchParams }: CandidatesPageProps) {
  const params = await searchParams
  const supabase = await createClient()

  const page = params.page ? Math.max(1, parseInt(params.page, 10) || 1) : 1

  const [candidatesResult, sources] = await Promise.all([
    getCandidates(supabase, {
      search: params.search,
      sourceId: params.source,
      page,
      pageSize: 25,
    }),
    getSources(supabase),
  ])

  return (
    <CandidateListPage
      initialData={candidatesResult}
      sources={sources}
      initialSearch={params.search ?? ''}
      initialSourceId={params.source ?? ''}
    />
  )
}
