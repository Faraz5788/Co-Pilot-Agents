import { SupabaseClient } from '@supabase/supabase-js'
import { createAuditLog } from './audit'

export async function getUsers(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from('users')
    .select('*, user_roles(role:roles(id, name))')
    .order('last_name')

  if (error) throw error
  return data ?? []
}

export async function getPipelineStages(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from('pipeline_stages')
    .select('*')
    .order('display_order')

  if (error) throw error
  return data ?? []
}

export async function updatePipelineStage(
  supabase: SupabaseClient,
  id: string,
  values: Record<string, unknown>,
  userId: string
) {
  const { data, error } = await supabase
    .from('pipeline_stages')
    .update(values)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error

  await createAuditLog(supabase, {
    userId,
    action: 'pipeline_stage.updated',
    entityType: 'pipeline_stage',
    entityId: id,
    newValues: values,
  })

  return data
}

export async function createPipelineStage(
  supabase: SupabaseClient,
  values: Record<string, unknown>,
  userId: string
) {
  const { data, error } = await supabase
    .from('pipeline_stages')
    .insert(values)
    .select()
    .single()

  if (error) throw error

  await createAuditLog(supabase, {
    userId,
    action: 'pipeline_stage.created',
    entityType: 'pipeline_stage',
    entityId: data.id,
    newValues: values,
  })

  return data
}

export async function getSources(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from('sources')
    .select('*')
    .order('name')

  if (error) throw error
  return data ?? []
}

export async function createSource(
  supabase: SupabaseClient,
  values: { name: string; category?: string },
  userId: string
) {
  const { data, error } = await supabase
    .from('sources')
    .insert(values)
    .select()
    .single()

  if (error) throw error

  await createAuditLog(supabase, {
    userId,
    action: 'source.created',
    entityType: 'source',
    entityId: data.id,
    newValues: values as Record<string, unknown>,
  })

  return data
}

export async function getRejectionReasons(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from('rejection_reasons')
    .select('*')
    .order('name')

  if (error) throw error
  return data ?? []
}

export async function createRejectionReason(
  supabase: SupabaseClient,
  values: { name: string; category?: string },
  userId: string
) {
  const { data, error } = await supabase
    .from('rejection_reasons')
    .insert(values)
    .select()
    .single()

  if (error) throw error

  await createAuditLog(supabase, {
    userId,
    action: 'rejection_reason.created',
    entityType: 'rejection_reason',
    entityId: data.id,
    newValues: values as Record<string, unknown>,
  })

  return data
}

export async function getCompetencies(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from('competencies')
    .select('*')
    .order('name')

  if (error) throw error
  return data ?? []
}

export async function getDepartments(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from('departments')
    .select('*')
    .order('name')

  if (error) throw error
  return data ?? []
}

export async function getLocations(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from('locations')
    .select('*')
    .order('name')

  if (error) throw error
  return data ?? []
}

export async function getCostCentres(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from('cost_centres')
    .select('*')
    .order('name')

  if (error) throw error
  return data ?? []
}

export async function getJobProfiles(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from('job_profiles')
    .select('*')
    .order('name')

  if (error) throw error
  return data ?? []
}

export async function getPositions(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from('positions')
    .select('*, job_profile:job_profiles(name), department:departments(name)')
    .order('title')

  if (error) throw error
  return data ?? []
}

export async function getGrades(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from('grades')
    .select('*')
    .order('level')

  if (error) throw error
  return data ?? []
}

export async function getRoles(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from('roles')
    .select('*')
    .order('name')

  if (error) throw error
  return data ?? []
}

export async function assignUserRole(
  supabase: SupabaseClient,
  userId: string,
  roleId: string,
  adminUserId: string
) {
  const { data, error } = await supabase
    .from('user_roles')
    .insert({ user_id: userId, role_id: roleId })
    .select()
    .single()

  if (error) throw error

  await createAuditLog(supabase, {
    userId: adminUserId,
    action: 'user_role.assigned',
    entityType: 'user',
    entityId: userId,
    newValues: { role_id: roleId },
  })

  return data
}

export async function removeUserRole(
  supabase: SupabaseClient,
  userId: string,
  roleId: string,
  adminUserId: string
) {
  const { error } = await supabase
    .from('user_roles')
    .delete()
    .eq('user_id', userId)
    .eq('role_id', roleId)

  if (error) throw error

  await createAuditLog(supabase, {
    userId: adminUserId,
    action: 'user_role.removed',
    entityType: 'user',
    entityId: userId,
    oldValues: { role_id: roleId },
  })
}
