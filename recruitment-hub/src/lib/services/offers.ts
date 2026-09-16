import { SupabaseClient } from '@supabase/supabase-js'
import { createAuditLog } from './audit'

const OFFER_SELECT = `
  *,
  application:applications(
    id,
    candidate:candidates(id, first_name, last_name, email, candidate_number),
    requisition:requisitions(id, title, reference_number)
  ),
  grade:grades(id, name),
  location:locations(id, name, city, country)
`

export async function getOffers(
  supabase: SupabaseClient,
  params: {
    status?: string
    page?: number
    pageSize?: number
  } = {}
) {
  const page = params.page ?? 1
  const pageSize = params.pageSize ?? 25
  const offset = (page - 1) * pageSize

  let query = supabase
    .from('offers')
    .select(OFFER_SELECT, { count: 'exact' })

  if (params.status) query = query.eq('status', params.status)

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

export async function getOffer(supabase: SupabaseClient, id: string) {
  const { data, error } = await supabase
    .from('offers')
    .select(OFFER_SELECT)
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function createOffer(
  supabase: SupabaseClient,
  values: Record<string, unknown>,
  userId: string
) {
  const { data, error } = await supabase
    .from('offers')
    .insert({
      ...values,
      created_by: userId,
    })
    .select(OFFER_SELECT)
    .single()

  if (error) throw error

  await createAuditLog(supabase, {
    userId,
    action: 'offer.created',
    entityType: 'offer',
    entityId: data.id,
    newValues: values,
  })

  return data
}

export async function updateOffer(
  supabase: SupabaseClient,
  id: string,
  values: Record<string, unknown>,
  userId: string
) {
  const { data: existing } = await supabase
    .from('offers')
    .select('*')
    .eq('id', id)
    .single()

  const { data, error } = await supabase
    .from('offers')
    .update(values)
    .eq('id', id)
    .select(OFFER_SELECT)
    .single()

  if (error) throw error

  await createAuditLog(supabase, {
    userId,
    action: 'offer.updated',
    entityType: 'offer',
    entityId: id,
    oldValues: existing as Record<string, unknown>,
    newValues: values,
  })

  return data
}

export async function updateOfferStatus(
  supabase: SupabaseClient,
  id: string,
  status: string,
  userId: string
) {
  return updateOffer(supabase, id, { status }, userId)
}

export async function submitOfferForApproval(
  supabase: SupabaseClient,
  offerId: string,
  approverId: string,
  userId: string
) {
  await supabase.from('approvals').insert({
    object_type: 'offer',
    object_id: offerId,
    approval_type: 'offer_approval',
    approver_id: approverId,
    status: 'pending',
  })

  const offer = await updateOffer(supabase, offerId, { status: 'pending_approval' }, userId)

  await supabase.from('notifications').insert({
    user_id: approverId,
    type: 'offer_pending',
    title: 'Offer Awaiting Approval',
    message: `An offer requires your approval`,
    object_type: 'offer',
    object_id: offerId,
  })

  await createAuditLog(supabase, {
    userId,
    action: 'offer.submitted_for_approval',
    entityType: 'offer',
    entityId: offerId,
    newValues: { approver_id: approverId },
  })

  return offer
}

export async function approveOffer(
  supabase: SupabaseClient,
  offerId: string,
  userId: string,
  comments?: string
) {
  await supabase
    .from('approvals')
    .update({
      status: 'approved',
      responded_at: new Date().toISOString(),
      comments,
    })
    .eq('object_type', 'offer')
    .eq('object_id', offerId)
    .eq('approver_id', userId)
    .eq('status', 'pending')

  const offer = await updateOffer(supabase, offerId, { status: 'approved' }, userId)

  await createAuditLog(supabase, {
    userId,
    action: 'offer.approved',
    entityType: 'offer',
    entityId: offerId,
    newValues: { comments },
  })

  return offer
}

export async function rejectOffer(
  supabase: SupabaseClient,
  offerId: string,
  userId: string,
  comments?: string
) {
  await supabase
    .from('approvals')
    .update({
      status: 'rejected',
      responded_at: new Date().toISOString(),
      comments,
    })
    .eq('object_type', 'offer')
    .eq('object_id', offerId)
    .eq('approver_id', userId)
    .eq('status', 'pending')

  const offer = await updateOffer(supabase, offerId, { status: 'draft' }, userId)

  await createAuditLog(supabase, {
    userId,
    action: 'offer.rejected',
    entityType: 'offer',
    entityId: offerId,
    newValues: { comments },
  })

  return offer
}
