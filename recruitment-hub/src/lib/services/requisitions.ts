import { SupabaseClient } from '@supabase/supabase-js'
import { createAuditLog } from './audit'

const REQUISITION_SELECT = `
  *,
  department:departments(id, name, code),
  location:locations(id, name, city, country),
  hiring_manager:users!requisitions_hiring_manager_id_fkey(id, first_name, last_name, email),
  lead_recruiter:users!requisitions_lead_recruiter_id_fkey(id, first_name, last_name, email),
  job_profile:job_profiles(id, name, code),
  position:positions(id, title, position_number),
  grade:grades(id, name, level),
  cost_centre:cost_centres(id, name, code)
`

export async function getRequisitions(
  supabase: SupabaseClient,
  params: {
    status?: string
    departmentId?: string
    locationId?: string
    hiringManagerId?: string
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
    .from('requisitions')
    .select(REQUISITION_SELECT, { count: 'exact' })

  if (params.status) query = query.eq('status', params.status)
  if (params.departmentId) query = query.eq('department_id', params.departmentId)
  if (params.locationId) query = query.eq('location_id', params.locationId)
  if (params.hiringManagerId) query = query.eq('hiring_manager_id', params.hiringManagerId)
  if (params.recruiterId) query = query.eq('lead_recruiter_id', params.recruiterId)
  if (params.search) {
    query = query.or(`title.ilike.%${params.search}%,reference_number.ilike.%${params.search}%`)
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

export async function getRequisition(supabase: SupabaseClient, id: string) {
  const { data, error } = await supabase
    .from('requisitions')
    .select(REQUISITION_SELECT)
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function createRequisition(
  supabase: SupabaseClient,
  values: Record<string, unknown>,
  userId: string
) {
  const { data: refData } = await supabase.rpc('generate_requisition_reference')
  const referenceNumber = refData || `REQ-${Date.now()}`

  const { data, error } = await supabase
    .from('requisitions')
    .insert({
      ...values,
      reference_number: referenceNumber,
      created_by: userId,
    })
    .select(REQUISITION_SELECT)
    .single()

  if (error) throw error

  await createAuditLog(supabase, {
    userId,
    action: 'requisition.created',
    entityType: 'requisition',
    entityId: data.id,
    newValues: values as Record<string, unknown>,
  })

  return data
}

export async function updateRequisition(
  supabase: SupabaseClient,
  id: string,
  values: Record<string, unknown>,
  userId: string
) {
  const { data: existing } = await supabase
    .from('requisitions')
    .select('*')
    .eq('id', id)
    .single()

  const { data, error } = await supabase
    .from('requisitions')
    .update(values)
    .eq('id', id)
    .select(REQUISITION_SELECT)
    .single()

  if (error) throw error

  await createAuditLog(supabase, {
    userId,
    action: 'requisition.updated',
    entityType: 'requisition',
    entityId: id,
    oldValues: existing as Record<string, unknown>,
    newValues: values as Record<string, unknown>,
  })

  return data
}

export async function updateRequisitionStatus(
  supabase: SupabaseClient,
  id: string,
  status: string,
  userId: string
) {
  const dateFields: Record<string, string> = {}
  const now = new Date().toISOString().split('T')[0]

  if (status === 'approved') dateFields.approved_date = now
  if (status === 'open') dateFields.opened_date = now
  if (status === 'closed' || status === 'cancelled') dateFields.closed_date = now

  return updateRequisition(supabase, id, { status, ...dateFields }, userId)
}

export async function getRequisitionStats(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from('requisitions')
    .select('status')

  if (error) throw error

  const stats = {
    total: data.length,
    draft: 0,
    pending_approval: 0,
    approved: 0,
    open: 0,
    on_hold: 0,
    closed: 0,
    cancelled: 0,
  }

  for (const req of data) {
    const status = req.status as keyof typeof stats
    if (status in stats && status !== 'total') {
      stats[status]++
    }
  }

  return stats
}
