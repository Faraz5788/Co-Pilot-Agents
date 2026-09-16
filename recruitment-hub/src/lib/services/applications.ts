import { SupabaseClient } from '@supabase/supabase-js'
import { createAuditLog } from './audit'

const APPLICATION_SELECT = `
  *,
  candidate:candidates(id, candidate_number, first_name, last_name, email, phone, location, current_employer, current_job_title),
  requisition:requisitions(id, reference_number, title, status, department:departments(id, name), location:locations(id, name)),
  current_stage:pipeline_stages(id, name, display_order, stage_type),
  assigned_recruiter:users!applications_assigned_recruiter_id_fkey(id, first_name, last_name, email),
  source:sources(id, name),
  rejection_reason:rejection_reasons(id, name)
`

const APPLICATION_LIST_SELECT = `
  id,
  application_status,
  application_date,
  created_at,
  candidate:candidates(id, candidate_number, first_name, last_name, email, current_job_title, current_employer),
  requisition:requisitions(id, reference_number, title),
  current_stage:pipeline_stages(id, name, display_order, stage_type),
  assigned_recruiter:users!applications_assigned_recruiter_id_fkey(id, first_name, last_name)
`

export async function getApplications(
  supabase: SupabaseClient,
  params: {
    requisitionId?: string
    candidateId?: string
    stageId?: string
    status?: string
    recruiterId?: string
    search?: string
    page?: number
    pageSize?: number
  } = {}
) {
  const page = params.page ?? 1
  const pageSize = params.pageSize ?? 25
  const offset = (page - 1) * pageSize

  let query = supabase
    .from('applications')
    .select(APPLICATION_LIST_SELECT, { count: 'exact' })

  if (params.requisitionId) query = query.eq('requisition_id', params.requisitionId)
  if (params.candidateId) query = query.eq('candidate_id', params.candidateId)
  if (params.stageId) query = query.eq('current_stage_id', params.stageId)
  if (params.status) query = query.eq('application_status', params.status)
  if (params.recruiterId) query = query.eq('assigned_recruiter_id', params.recruiterId)

  const searchTerm = params.search?.trim()
  if (searchTerm) {
    // Applications carry no name/title columns of their own, so resolve the
    // search term against candidates and requisitions first, then filter on
    // the matching foreign keys.
    const [{ data: matchingCandidates }, { data: matchingRequisitions }] = await Promise.all([
      supabase
        .from('candidates')
        .select('id')
        .or(
          `first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,candidate_number.ilike.%${searchTerm}%`
        ),
      supabase
        .from('requisitions')
        .select('id')
        .or(`title.ilike.%${searchTerm}%,reference_number.ilike.%${searchTerm}%`),
    ])

    const candidateIds = (matchingCandidates ?? []).map((c: { id: string }) => c.id)
    const requisitionIds = (matchingRequisitions ?? []).map((r: { id: string }) => r.id)

    const orParts: string[] = []
    if (candidateIds.length) orParts.push(`candidate_id.in.(${candidateIds.join(',')})`)
    if (requisitionIds.length) orParts.push(`requisition_id.in.(${requisitionIds.join(',')})`)

    if (orParts.length) {
      query = query.or(orParts.join(','))
    } else {
      // No candidate or requisition matched the search term at all.
      query = query.eq('id', '00000000-0000-0000-0000-000000000000')
    }
  }

  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + pageSize - 1)

  if (error) throw error

  return {
    data: data ?? [],
    total: count ?? 0,
    page,
    pageSize,
    totalPages: Math.ceil((count ?? 0) / pageSize),
  }
}

export async function getApplication(supabase: SupabaseClient, id: string) {
  const { data, error } = await supabase
    .from('applications')
    .select(APPLICATION_SELECT)
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function createApplication(
  supabase: SupabaseClient,
  values: {
    candidate_id: string
    requisition_id: string
    assigned_recruiter_id?: string
    source_id?: string
    salary_expectation?: number
    notice_period?: string
  },
  userId: string
) {
  const { data: defaultStage } = await supabase
    .from('pipeline_stages')
    .select('id')
    .eq('is_default', true)
    .single()

  const { data, error } = await supabase
    .from('applications')
    .insert({
      ...values,
      current_stage_id: defaultStage?.id,
      application_status: 'active',
    })
    .select(APPLICATION_SELECT)
    .single()

  if (error) throw error

  if (defaultStage) {
    await supabase.from('application_stage_history').insert({
      application_id: data.id,
      to_stage_id: defaultStage.id,
      changed_by: userId,
      notes: 'Application submitted',
    })
  }

  await createAuditLog(supabase, {
    userId,
    action: 'application.created',
    entityType: 'application',
    entityId: data.id,
    newValues: values as Record<string, unknown>,
  })

  return data
}

export async function moveApplicationStage(
  supabase: SupabaseClient,
  applicationId: string,
  toStageId: string,
  userId: string,
  notes?: string
) {
  const { data: application } = await supabase
    .from('applications')
    .select('id, current_stage_id, current_stage:pipeline_stages(id, name)')
    .eq('id', applicationId)
    .single()

  if (!application) throw new Error('Application not found')

  const { data: toStage } = await supabase
    .from('pipeline_stages')
    .select('id, name, stage_type')
    .eq('id', toStageId)
    .single()

  if (!toStage) throw new Error('Target stage not found')

  const updateData: Record<string, unknown> = { current_stage_id: toStageId }

  if (toStage.stage_type === 'rejected') {
    updateData.application_status = 'rejected'
  } else if (toStage.stage_type === 'withdrawn') {
    updateData.application_status = 'withdrawn'
  } else if (toStage.stage_type === 'hired') {
    updateData.application_status = 'hired'
  }

  const { data, error } = await supabase
    .from('applications')
    .update(updateData)
    .eq('id', applicationId)
    .select(APPLICATION_SELECT)
    .single()

  if (error) throw error

  await supabase.from('application_stage_history').insert({
    application_id: applicationId,
    from_stage_id: application.current_stage_id,
    to_stage_id: toStageId,
    changed_by: userId,
    notes,
  })

  await createAuditLog(supabase, {
    userId,
    action: 'application.stage_changed',
    entityType: 'application',
    entityId: applicationId,
    oldValues: { stage: (application.current_stage as unknown as { name: string } | null)?.name },
    newValues: { stage: toStage.name },
  })

  return data
}

export async function getStageHistory(supabase: SupabaseClient, applicationId: string) {
  const { data, error } = await supabase
    .from('application_stage_history')
    .select(`
      *,
      from_stage:pipeline_stages!application_stage_history_from_stage_id_fkey(id, name),
      to_stage:pipeline_stages!application_stage_history_to_stage_id_fkey(id, name),
      changed_by_user:users!application_stage_history_changed_by_fkey(id, first_name, last_name)
    `)
    .eq('application_id', applicationId)
    .order('changed_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

export async function getApplicationsByStage(
  supabase: SupabaseClient,
  requisitionId: string
) {
  const { data: stages } = await supabase
    .from('pipeline_stages')
    .select('id, name, display_order, stage_type')
    .eq('active', true)
    .order('display_order')

  const { data: applications } = await supabase
    .from('applications')
    .select(APPLICATION_LIST_SELECT)
    .eq('requisition_id', requisitionId)
    .eq('application_status', 'active')

  const pipeline = (stages ?? []).map(stage => ({
    ...stage,
    applications: (applications ?? []).filter(
      (app: Record<string, unknown>) => {
        const currentStage = app.current_stage as { id: string } | null
        return currentStage?.id === stage.id
      }
    ),
  }))

  return pipeline
}

export async function rejectApplication(
  supabase: SupabaseClient,
  applicationId: string,
  rejectionReasonId: string,
  userId: string,
  notes?: string
) {
  const { data: rejectedStage } = await supabase
    .from('pipeline_stages')
    .select('id')
    .eq('stage_type', 'rejected')
    .single()

  const updateData: Record<string, unknown> = {
    application_status: 'rejected',
    rejection_reason_id: rejectionReasonId,
  }

  if (rejectedStage) {
    updateData.current_stage_id = rejectedStage.id
  }

  const { data, error } = await supabase
    .from('applications')
    .update(updateData)
    .eq('id', applicationId)
    .select(APPLICATION_SELECT)
    .single()

  if (error) throw error

  await createAuditLog(supabase, {
    userId,
    action: 'application.rejected',
    entityType: 'application',
    entityId: applicationId,
    newValues: { rejection_reason_id: rejectionReasonId, notes },
  })

  return data
}

export async function getApplicationStats(supabase: SupabaseClient, requisitionId?: string) {
  let query = supabase.from('applications').select('application_status, current_stage:pipeline_stages(name, stage_type)')

  if (requisitionId) query = query.eq('requisition_id', requisitionId)

  const { data, error } = await query
  if (error) throw error

  const byStatus: Record<string, number> = {}
  const byStage: Record<string, number> = {}

  for (const app of data ?? []) {
    byStatus[app.application_status] = (byStatus[app.application_status] ?? 0) + 1
    const stage = app.current_stage as unknown as { name: string } | null
    if (stage) {
      byStage[stage.name] = (byStage[stage.name] ?? 0) + 1
    }
  }

  return { byStatus, byStage, total: data?.length ?? 0 }
}
