import { SupabaseClient } from '@supabase/supabase-js'
import { createAuditLog } from './audit'

const INTERVIEW_SELECT = `
  *,
  application:applications(
    id,
    candidate:candidates(id, first_name, last_name, email, candidate_number),
    requisition:requisitions(id, title, reference_number)
  ),
  interviewers:interviewers(
    user:users(id, first_name, last_name, email)
  ),
  scorecards:interview_scorecards(
    id,
    reviewer:users(id, first_name, last_name),
    overall_recommendation,
    overall_score,
    status,
    submitted_at
  )
`

export async function getInterviews(
  supabase: SupabaseClient,
  params: {
    applicationId?: string
    interviewerId?: string
    status?: string
    fromDate?: string
    toDate?: string
    page?: number
    pageSize?: number
  } = {}
) {
  const page = params.page ?? 1
  const pageSize = params.pageSize ?? 25
  const offset = (page - 1) * pageSize

  let query = supabase
    .from('interviews')
    .select(INTERVIEW_SELECT, { count: 'exact' })

  if (params.applicationId) query = query.eq('application_id', params.applicationId)
  if (params.status) query = query.eq('status', params.status)
  if (params.fromDate) query = query.gte('scheduled_start', params.fromDate)
  if (params.toDate) query = query.lte('scheduled_start', params.toDate)

  const { data, error, count } = await query
    .order('scheduled_start', { ascending: true })
    .range(offset, offset + pageSize - 1)

  if (error) throw error

  let filtered = data ?? []
  if (params.interviewerId) {
    filtered = filtered.filter((interview: Record<string, unknown>) => {
      const interviewers = interview.interviewers as Array<{ user: { id: string } }>
      return interviewers?.some(i => i.user?.id === params.interviewerId)
    })
  }

  return {
    data: filtered,
    total: count ?? 0,
    page,
    pageSize,
    totalPages: Math.ceil((count ?? 0) / pageSize),
  }
}

export async function getInterview(supabase: SupabaseClient, id: string) {
  const { data, error } = await supabase
    .from('interviews')
    .select(INTERVIEW_SELECT)
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function createInterview(
  supabase: SupabaseClient,
  values: {
    application_id: string
    interview_type: string
    scheduled_start: string
    scheduled_end: string
    location_type?: string
    location?: string
    meeting_url?: string
    notes?: string
    interviewer_ids: string[]
  },
  userId: string
) {
  const { interviewer_ids, ...interviewData } = values

  const { data, error } = await supabase
    .from('interviews')
    .insert({
      ...interviewData,
      created_by: userId,
    })
    .select('id')
    .single()

  if (error) throw error

  if (interviewer_ids.length > 0) {
    const interviewerRows = interviewer_ids.map(uid => ({
      interview_id: data.id,
      user_id: uid,
    }))
    await supabase.from('interviewers').insert(interviewerRows)
  }

  for (const interviewerId of interviewer_ids) {
    await supabase.from('notifications').insert({
      user_id: interviewerId,
      type: 'interview_scheduled',
      title: 'Interview Scheduled',
      message: `You have been assigned to an interview`,
      object_type: 'interview',
      object_id: data.id,
    })
  }

  await createAuditLog(supabase, {
    userId,
    action: 'interview.created',
    entityType: 'interview',
    entityId: data.id,
    newValues: values as unknown as Record<string, unknown>,
  })

  return getInterview(supabase, data.id)
}

export async function updateInterview(
  supabase: SupabaseClient,
  id: string,
  values: Record<string, unknown>,
  userId: string
) {
  const { data, error } = await supabase
    .from('interviews')
    .update(values)
    .eq('id', id)
    .select(INTERVIEW_SELECT)
    .single()

  if (error) throw error

  await createAuditLog(supabase, {
    userId,
    action: 'interview.updated',
    entityType: 'interview',
    entityId: id,
    newValues: values,
  })

  return data
}

export async function submitScorecard(
  supabase: SupabaseClient,
  values: {
    interview_id: string
    overall_recommendation: string
    overall_score?: number
    strengths?: string
    concerns?: string
    feedback: Array<{
      competency_id: string
      score: number
      comments?: string
    }>
  },
  userId: string
) {
  const { feedback, ...scorecardData } = values

  const { data: scorecard, error: scError } = await supabase
    .from('interview_scorecards')
    .insert({
      ...scorecardData,
      reviewer_id: userId,
      submitted_at: new Date().toISOString(),
      status: 'submitted',
    })
    .select('id')
    .single()

  if (scError) throw scError

  if (feedback.length > 0) {
    const feedbackRows = feedback.map(f => ({
      scorecard_id: scorecard.id,
      competency_id: f.competency_id,
      score: f.score,
      comments: f.comments,
    }))
    await supabase.from('interview_feedback').insert(feedbackRows)
  }

  await createAuditLog(supabase, {
    userId,
    action: 'interview.feedback_submitted',
    entityType: 'interview_scorecard',
    entityId: scorecard.id,
    newValues: { interview_id: values.interview_id, recommendation: values.overall_recommendation },
  })

  return scorecard
}

export async function getUpcomingInterviews(
  supabase: SupabaseClient,
  userId: string,
  days: number = 7
) {
  const now = new Date().toISOString()
  const future = new Date(Date.now() + days * 86400000).toISOString()

  const { data, error } = await supabase
    .from('interviews')
    .select(INTERVIEW_SELECT)
    .gte('scheduled_start', now)
    .lte('scheduled_start', future)
    .in('status', ['scheduled', 'confirmed'])
    .order('scheduled_start')

  if (error) throw error
  return data ?? []
}

export async function getPendingFeedback(supabase: SupabaseClient, userId: string) {
  const { data: assignedInterviews } = await supabase
    .from('interviewers')
    .select('interview_id')
    .eq('user_id', userId)

  if (!assignedInterviews?.length) return []

  const interviewIds = assignedInterviews.map(i => i.interview_id)

  const { data: scorecards } = await supabase
    .from('interview_scorecards')
    .select('interview_id')
    .eq('reviewer_id', userId)
    .eq('status', 'submitted')

  const submittedIds = new Set(scorecards?.map(s => s.interview_id) ?? [])

  const { data: completedInterviews } = await supabase
    .from('interviews')
    .select(INTERVIEW_SELECT)
    .in('id', interviewIds)
    .eq('status', 'completed')

  return (completedInterviews ?? []).filter(
    (i: { id: string }) => !submittedIds.has(i.id)
  )
}
