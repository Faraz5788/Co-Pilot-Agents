import { SupabaseClient } from '@supabase/supabase-js'

export async function createAuditLog(
  supabase: SupabaseClient,
  params: {
    userId: string
    action: string
    entityType: string
    entityId?: string
    oldValues?: Record<string, unknown>
    newValues?: Record<string, unknown>
    ipAddress?: string
    userAgent?: string
  }
) {
  const { error } = await supabase.from('audit_log').insert({
    user_id: params.userId,
    action: params.action,
    entity_type: params.entityType,
    entity_id: params.entityId,
    old_values: params.oldValues ?? null,
    new_values: params.newValues ?? null,
    ip_address: params.ipAddress ?? null,
    user_agent: params.userAgent ?? null,
  })

  if (error) {
    console.error('Failed to create audit log:', error)
  }
}

export async function getAuditLogs(
  supabase: SupabaseClient,
  params: {
    entityType?: string
    entityId?: string
    userId?: string
    action?: string
    from?: string
    to?: string
    page?: number
    pageSize?: number
  }
) {
  const page = params.page ?? 1
  const pageSize = params.pageSize ?? 25
  const offset = (page - 1) * pageSize

  let query = supabase
    .from('audit_log')
    .select('*, user:users!audit_log_user_id_fkey(id, first_name, last_name, email)', { count: 'exact' })

  if (params.entityType) query = query.eq('entity_type', params.entityType)
  if (params.entityId) query = query.eq('entity_id', params.entityId)
  if (params.userId) query = query.eq('user_id', params.userId)
  if (params.action) query = query.ilike('action', `%${params.action}%`)
  if (params.from) query = query.gte('created_at', params.from)
  if (params.to) query = query.lte('created_at', params.to)

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
