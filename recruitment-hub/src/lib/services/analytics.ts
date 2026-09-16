import { SupabaseClient } from '@supabase/supabase-js'

export interface DashboardMetrics {
  openRequisitions: number
  totalCandidates: number
  activeApplications: number
  interviewsThisWeek: number
  pendingOffers: number
  hiredThisMonth: number
  applicationsByStage: Array<{ stage: string; count: number }>
  applicationsBySource: Array<{ source: string; count: number }>
  requisitionsByStatus: Array<{ status: string; count: number }>
  recentActivity: Array<{
    id: string
    action: string
    entity_type: string
    entity_id: string
    created_at: string
    user?: { first_name: string; last_name: string }
  }>
}

export async function getDashboardMetrics(
  supabase: SupabaseClient,
  userId?: string,
  userRoles?: string[]
): Promise<DashboardMetrics> {
  const now = new Date()
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - now.getDay())
  weekStart.setHours(0, 0, 0, 0)
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 7)
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  const [
    reqResult,
    candidateResult,
    appResult,
    interviewResult,
    offerResult,
    hiredResult,
    stageResult,
    sourceResult,
    activityResult,
  ] = await Promise.all([
    supabase.from('requisitions').select('status'),
    supabase.from('candidates').select('id', { count: 'exact', head: true }),
    supabase.from('applications').select('id, application_status, current_stage:pipeline_stages(name)').eq('application_status', 'active'),
    supabase.from('interviews')
      .select('id')
      .gte('scheduled_start', weekStart.toISOString())
      .lte('scheduled_start', weekEnd.toISOString())
      .in('status', ['scheduled', 'confirmed']),
    supabase.from('offers').select('id').in('status', ['pending_approval', 'approved', 'sent']),
    supabase.from('applications')
      .select('id')
      .eq('application_status', 'hired')
      .gte('updated_at', monthStart.toISOString()),
    supabase.from('applications')
      .select('current_stage:pipeline_stages(name)')
      .eq('application_status', 'active'),
    supabase.from('applications')
      .select('source:sources(name)')
      .eq('application_status', 'active'),
    supabase.from('audit_log')
      .select('id, action, entity_type, entity_id, created_at, user:users!audit_log_user_id_fkey(first_name, last_name)')
      .order('created_at', { ascending: false })
      .limit(20),
  ])

  const requisitions = reqResult.data ?? []
  const requisitionsByStatus: Record<string, number> = {}
  let openRequisitions = 0
  for (const r of requisitions) {
    requisitionsByStatus[r.status] = (requisitionsByStatus[r.status] ?? 0) + 1
    if (r.status === 'open' || r.status === 'approved') openRequisitions++
  }

  const activeApps = stageResult.data ?? []
  const stageCount: Record<string, number> = {}
  for (const app of activeApps) {
    const stage = app.current_stage as unknown as { name: string } | null
    const name = stage?.name ?? 'Unknown'
    stageCount[name] = (stageCount[name] ?? 0) + 1
  }

  const sourceApps = sourceResult.data ?? []
  const sourceCount: Record<string, number> = {}
  for (const app of sourceApps) {
    const source = app.source as unknown as { name: string } | null
    const name = source?.name ?? 'Direct'
    sourceCount[name] = (sourceCount[name] ?? 0) + 1
  }

  return {
    openRequisitions,
    totalCandidates: candidateResult.count ?? 0,
    activeApplications: appResult.data?.length ?? 0,
    interviewsThisWeek: interviewResult.data?.length ?? 0,
    pendingOffers: offerResult.data?.length ?? 0,
    hiredThisMonth: hiredResult.data?.length ?? 0,
    applicationsByStage: Object.entries(stageCount)
      .map(([stage, count]) => ({ stage, count }))
      .sort((a, b) => b.count - a.count),
    applicationsBySource: Object.entries(sourceCount)
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count),
    requisitionsByStatus: Object.entries(requisitionsByStatus)
      .map(([status, count]) => ({ status, count })),
    recentActivity: (activityResult.data ?? []) as unknown as DashboardMetrics['recentActivity'],
  }
}

export async function getRecruitmentAnalytics(supabase: SupabaseClient) {
  const [apps, reqs, offers, interviews] = await Promise.all([
    supabase.from('applications').select(`
      id, application_status, application_date, created_at, updated_at,
      current_stage:pipeline_stages(name, stage_type),
      source:sources(name),
      assigned_recruiter:users!applications_assigned_recruiter_id_fkey(id, first_name, last_name),
      requisition:requisitions(id, title, hiring_manager:users!requisitions_hiring_manager_id_fkey(id, first_name, last_name))
    `),
    supabase.from('requisitions').select('id, title, status, opened_date, closed_date, department:departments(name)'),
    supabase.from('offers').select('id, status, created_at, application:applications(id, application_date)'),
    supabase.from('interviews').select('id, status, scheduled_start, application_id'),
  ])

  const allApps = apps.data ?? []
  const allReqs = reqs.data ?? []
  const allOffers = offers.data ?? []
  const allInterviews = interviews.data ?? []

  const totalApps = allApps.length
  const activeApps = allApps.filter(a => a.application_status === 'active').length
  const rejectedApps = allApps.filter(a => a.application_status === 'rejected').length
  const hiredApps = allApps.filter(a => a.application_status === 'hired').length
  const withdrawnApps = allApps.filter(a => a.application_status === 'withdrawn').length

  const offerAcceptance = allOffers.length > 0
    ? allOffers.filter(o => o.status === 'accepted').length / allOffers.filter(o => ['accepted', 'declined'].includes(o.status)).length
    : 0

  const recruiterWorkload: Record<string, { name: string; count: number }> = {}
  for (const app of allApps.filter(a => a.application_status === 'active')) {
    const rec = app.assigned_recruiter as unknown as { id: string; first_name: string; last_name: string } | null
    if (rec) {
      if (!recruiterWorkload[rec.id]) {
        recruiterWorkload[rec.id] = { name: `${rec.first_name} ${rec.last_name}`, count: 0 }
      }
      recruiterWorkload[rec.id].count++
    }
  }

  const avgTimeToHire = calculateAvgDays(
    allApps
      .filter(a => a.application_status === 'hired')
      .map(a => ({
        start: a.application_date || a.created_at,
        end: a.updated_at,
      }))
  )

  return {
    totalApplications: totalApps,
    activeApplications: activeApps,
    rejectedApplications: rejectedApps,
    hiredApplications: hiredApps,
    withdrawnApplications: withdrawnApps,
    openRequisitions: allReqs.filter(r => r.status === 'open').length,
    closedRequisitions: allReqs.filter(r => r.status === 'closed').length,
    totalInterviews: allInterviews.length,
    completedInterviews: allInterviews.filter(i => i.status === 'completed').length,
    totalOffers: allOffers.length,
    acceptedOffers: allOffers.filter(o => o.status === 'accepted').length,
    declinedOffers: allOffers.filter(o => o.status === 'declined').length,
    offerAcceptanceRate: Math.round(offerAcceptance * 100),
    avgTimeToHire,
    recruiterWorkload: Object.values(recruiterWorkload).sort((a, b) => b.count - a.count),
    pipelineConversion: calculatePipelineConversion(allApps),
  }
}

function calculateAvgDays(ranges: Array<{ start: string; end: string }>): number | null {
  if (ranges.length === 0) return null
  const totalDays = ranges.reduce((sum, r) => {
    const start = new Date(r.start).getTime()
    const end = new Date(r.end).getTime()
    return sum + (end - start) / 86400000
  }, 0)
  return Math.round(totalDays / ranges.length)
}

function calculatePipelineConversion(apps: Array<Record<string, unknown>>) {
  const stages = ['Applied', 'CV Review', 'Recruiter Screening', 'Hiring Manager Review', 'Interview 1', 'Interview 2', 'Offer', 'Hired']
  const counts: Record<string, number> = {}

  for (const app of apps) {
    const stage = app.current_stage as { name: string } | null
    if (stage) {
      counts[stage.name] = (counts[stage.name] ?? 0) + 1
    }
  }

  return stages.map(stage => ({
    stage,
    count: counts[stage] ?? 0,
  }))
}
