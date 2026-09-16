import { redirect } from 'next/navigation'
import type { SupabaseClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { getDashboardMetrics } from '@/lib/services/analytics'
import { DashboardContent, type DashboardContentProps } from '@/components/dashboard/dashboard-content'
import type { HiringManagerMetrics } from '@/components/dashboard/hiring-manager-dashboard'
import type { InterviewerMetrics, InterviewerQueueItem } from '@/components/dashboard/interviewer-dashboard'

export const metadata = {
  title: 'Dashboard',
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const [{ data: profile }, { data: roleRows }] = await Promise.all([
    supabase.from('users').select('first_name, last_name').eq('id', user.id).maybeSingle(),
    supabase.from('user_roles').select('role:roles(name)').eq('user_id', user.id),
  ])

  const roleNames = (roleRows ?? [])
    .map((row) => (row as unknown as { role: { name: string } | null }).role?.name)
    .filter((name): name is string => Boolean(name))
    .map((name) => name.toLowerCase())

  const isRecruiterLike = roleNames.some((name) =>
    ['admin', 'recadmin', 'rec_admin', 'recruiter'].includes(name)
  )
  const isHiringManager = roleNames.includes('hiring_manager')
  const isInterviewer = roleNames.includes('interviewer')

  const content = await buildDashboardContent(supabase, user.id, {
    isRecruiterLike,
    isHiringManager,
    isInterviewer,
  })

  const displayName = profile ? `${profile.first_name}` : null

  return (
    <div>
      {displayName ? (
        <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
          Welcome back, <span className="font-medium text-gray-700 dark:text-gray-300">{displayName}</span>
        </p>
      ) : null}
      <DashboardContent {...content} />
    </div>
  )
}

async function buildDashboardContent(
  supabase: SupabaseClient,
  userId: string,
  flags: { isRecruiterLike: boolean; isHiringManager: boolean; isInterviewer: boolean }
): Promise<DashboardContentProps> {
  // Admins, "RecAdmin"s and recruiters get the full pipeline dashboard.
  // Anyone with no recognized role also falls back to this view so they
  // still see something useful rather than a blank page.
  if (flags.isRecruiterLike || (!flags.isHiringManager && !flags.isInterviewer)) {
    const metrics = await getDashboardMetrics(supabase, userId)
    return { role: 'recruiter', metrics }
  }

  if (flags.isHiringManager) {
    const metrics = await getHiringManagerMetrics(supabase, userId)
    return { role: 'hiring_manager', metrics }
  }

  const metrics = await getInterviewerMetrics(supabase, userId)
  return { role: 'interviewer', metrics }
}

async function getHiringManagerMetrics(
  supabase: SupabaseClient,
  userId: string
): Promise<HiringManagerMetrics> {
  const { data: myReqs } = await supabase
    .from('requisitions')
    .select('id, status')
    .eq('hiring_manager_id', userId)

  const requisitions = myReqs ?? []
  const reqIds = requisitions.map((r) => r.id as string)
  const myVacancies = requisitions.filter(
    (r) => r.status === 'open' || r.status === 'approved'
  ).length

  if (reqIds.length === 0) {
    return { myVacancies, candidatesAwaitingReview: 0, upcomingInterviews: 0, feedbackOutstanding: 0 }
  }

  const [appsResult, interviewsResult] = await Promise.all([
    supabase
      .from('applications')
      .select('id, requisition_id, current_stage:pipeline_stages(stage_type)')
      .in('requisition_id', reqIds)
      .eq('application_status', 'active'),
    supabase
      .from('interviews')
      .select('id, status, scheduled_start, application:applications(requisition_id)')
      .in('status', ['scheduled', 'confirmed', 'completed']),
  ])

  const candidatesAwaitingReview = (appsResult.data ?? []).filter((a) => {
    const stage = a.current_stage as unknown as { stage_type: string } | null
    return stage?.stage_type === 'review'
  }).length

  const reqIdSet = new Set(reqIds)
  const myInterviews = (interviewsResult.data ?? []).filter((i) => {
    const app = i.application as unknown as { requisition_id: string } | null
    return app ? reqIdSet.has(app.requisition_id) : false
  })

  const now = new Date()
  const upcomingInterviews = myInterviews.filter(
    (i) =>
      (i.status === 'scheduled' || i.status === 'confirmed') &&
      new Date(i.scheduled_start) >= now
  ).length

  const completedInterviewIds = myInterviews
    .filter((i) => i.status === 'completed')
    .map((i) => i.id as string)

  let feedbackOutstanding = 0
  if (completedInterviewIds.length > 0) {
    const { data: scorecards } = await supabase
      .from('interview_scorecards')
      .select('interview_id, status')
      .in('interview_id', completedInterviewIds)
      .eq('status', 'submitted')
    const submitted = new Set((scorecards ?? []).map((s) => s.interview_id as string))
    feedbackOutstanding = completedInterviewIds.filter((id) => !submitted.has(id)).length
  }

  return { myVacancies, candidatesAwaitingReview, upcomingInterviews, feedbackOutstanding }
}

interface InterviewerInterviewRow {
  id: string
  status: string
  scheduled_start: string
  interview_type: string
  application: {
    candidate: { first_name: string; last_name: string } | null
    requisition: { title: string } | null
  } | null
}

async function getInterviewerMetrics(
  supabase: SupabaseClient,
  userId: string
): Promise<InterviewerMetrics> {
  const { data } = await supabase
    .from('interviewers')
    .select(
      `interview:interviews(
        id, status, scheduled_start, interview_type,
        application:applications(
          candidate:candidates(first_name, last_name),
          requisition:requisitions(title)
        )
      )`
    )
    .eq('user_id', userId)

  const interviews = (data ?? [])
    .map((row) => row.interview as unknown as InterviewerInterviewRow | null)
    .filter((interview): interview is InterviewerInterviewRow => interview !== null)

  const now = new Date()
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - now.getDay())
  weekStart.setHours(0, 0, 0, 0)
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 7)

  const upcoming = interviews.filter(
    (i) =>
      (i.status === 'scheduled' || i.status === 'confirmed') &&
      new Date(i.scheduled_start) >= now
  )

  const interviewsThisWeek = interviews.filter((i) => {
    const start = new Date(i.scheduled_start)
    return (
      (i.status === 'scheduled' || i.status === 'confirmed') &&
      start >= weekStart &&
      start < weekEnd
    )
  }).length

  const completedInterviews = interviews.filter((i) => i.status === 'completed')

  let feedbackOutstanding = 0
  if (completedInterviews.length > 0) {
    const ids = completedInterviews.map((i) => i.id)
    const { data: scorecards } = await supabase
      .from('interview_scorecards')
      .select('interview_id, status, reviewer_id')
      .in('interview_id', ids)
      .eq('reviewer_id', userId)
      .eq('status', 'submitted')
    const submitted = new Set((scorecards ?? []).map((s) => s.interview_id as string))
    feedbackOutstanding = ids.filter((id) => !submitted.has(id)).length
  }

  const queue: InterviewerQueueItem[] = upcoming
    .sort((a, b) => new Date(a.scheduled_start).getTime() - new Date(b.scheduled_start).getTime())
    .slice(0, 6)
    .map((i) => ({
      id: i.id,
      candidateName: i.application?.candidate
        ? `${i.application.candidate.first_name} ${i.application.candidate.last_name}`
        : 'Candidate',
      requisitionTitle: i.application?.requisition?.title ?? 'Requisition',
      scheduledStart: i.scheduled_start,
      interviewType: i.interview_type,
    }))

  return {
    upcomingInterviews: upcoming.length,
    interviewsThisWeek,
    completedInterviews: completedInterviews.length,
    feedbackOutstanding,
    queue,
  }
}
