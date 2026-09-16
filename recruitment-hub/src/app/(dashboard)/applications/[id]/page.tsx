import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getApplication, getStageHistory } from '@/lib/services/applications'
import { getInterviews } from '@/lib/services/interviews'
import { getPipelineStages, getRejectionReasons } from '@/lib/services/admin'
import {
  ApplicationDetail,
  type ScorecardRow,
  type RecruiterNoteRow,
} from '@/components/applications/application-detail'

interface ApplicationPageProps {
  params: Promise<{ id: string }>
}

export default async function ApplicationPage({ params }: ApplicationPageProps) {
  const { id } = await params
  const supabase = await createClient()

  let application
  try {
    application = await getApplication(supabase, id)
  } catch {
    notFound()
  }

  if (!application) {
    notFound()
  }

  const [stageHistory, interviewsResult, stages, rejectionReasons, notesResult] = await Promise.all([
    getStageHistory(supabase, id),
    getInterviews(supabase, { applicationId: id, pageSize: 100 }),
    getPipelineStages(supabase),
    getRejectionReasons(supabase),
    supabase
      .from('recruiter_notes')
      .select('id, note, created_at, author:users(id, first_name, last_name)')
      .eq('application_id', id)
      .order('created_at', { ascending: false }),
  ])

  const interviews = interviewsResult.data
  const interviewIds = interviews.map((interview: { id: string }) => interview.id)

  let scorecards: ScorecardRow[] = []
  if (interviewIds.length > 0) {
    const { data } = await supabase
      .from('interview_scorecards')
      .select(
        'id, interview_id, overall_recommendation, overall_score, strengths, concerns, status, submitted_at, reviewer:users(id, first_name, last_name)'
      )
      .in('interview_id', interviewIds)
      .order('submitted_at', { ascending: false })
    scorecards = (data ?? []) as unknown as ScorecardRow[]
  }

  return (
    <ApplicationDetail
      application={application}
      stageHistory={stageHistory}
      interviews={interviews}
      scorecards={scorecards}
      stages={stages}
      rejectionReasons={rejectionReasons}
      notes={(notesResult.data ?? []) as unknown as RecruiterNoteRow[]}
    />
  )
}
