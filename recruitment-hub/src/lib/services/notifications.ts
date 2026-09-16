import { SupabaseClient } from '@supabase/supabase-js'

export async function getNotifications(
  supabase: SupabaseClient,
  userId: string,
  params: {
    unreadOnly?: boolean
    page?: number
    pageSize?: number
  } = {}
) {
  const page = params.page ?? 1
  const pageSize = params.pageSize ?? 25
  const offset = (page - 1) * pageSize

  let query = supabase
    .from('notifications')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)

  if (params.unreadOnly) {
    query = query.is('read_at', null)
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

export async function getUnreadCount(supabase: SupabaseClient, userId: string) {
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .is('read_at', null)

  if (error) throw error
  return count ?? 0
}

export async function markAsRead(supabase: SupabaseClient, notificationId: string) {
  const { error } = await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('id', notificationId)

  if (error) throw error
}

export async function markAllAsRead(supabase: SupabaseClient, userId: string) {
  const { error } = await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('user_id', userId)
    .is('read_at', null)

  if (error) throw error
}

export async function createNotification(
  supabase: SupabaseClient,
  params: {
    userId: string
    type: string
    title: string
    message: string
    objectType?: string
    objectId?: string
  }
) {
  const { error } = await supabase.from('notifications').insert({
    user_id: params.userId,
    type: params.type,
    title: params.title,
    message: params.message,
    object_type: params.objectType ?? null,
    object_id: params.objectId ?? null,
  })

  if (error) {
    console.error('Failed to create notification:', error)
  }
}
