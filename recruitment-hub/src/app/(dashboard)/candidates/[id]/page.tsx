import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCandidate } from '@/lib/services/candidates'
import { getCandidateDocuments } from '@/lib/services/documents'
import { getAuditLogs } from '@/lib/services/audit'
import { getRequisitions } from '@/lib/services/requisitions'
import { getSources } from '@/lib/services/admin'
import { CandidateDetail } from '@/components/candidates/candidate-detail'

interface CandidatePageProps {
  params: Promise<{ id: string }>
}

export default async function CandidatePage({ params }: CandidatePageProps) {
  const { id } = await params
  const supabase = await createClient()

  let candidate
  try {
    candidate = await getCandidate(supabase, id)
  } catch {
    notFound()
  }

  if (!candidate) {
    notFound()
  }

  const [documents, activity, openRequisitions, sources] = await Promise.all([
    getCandidateDocuments(supabase, id),
    getAuditLogs(supabase, { entityType: 'candidate', entityId: id, pageSize: 50 }),
    getRequisitions(supabase, { status: 'open', pageSize: 100 }),
    getSources(supabase),
  ])

  return (
    <CandidateDetail
      candidate={candidate}
      documents={documents}
      activity={activity.data}
      openRequisitions={openRequisitions.data}
      sources={sources}
    />
  )
}
