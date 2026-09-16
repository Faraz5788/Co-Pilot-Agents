import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { getNotifications, getUnreadCount, markAsRead } from '@/lib/services/notifications'

const markReadBodySchema = z.object({
  id: z.uuid().optional(),
  ids: z.array(z.uuid()).optional(),
})

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const searchParams = request.nextUrl.searchParams

  try {
    const [result, unreadCount] = await Promise.all([
      getNotifications(supabase, user.id, {
        unreadOnly: searchParams.get('unreadOnly') === 'true',
        page: searchParams.get('page') ? Number(searchParams.get('page')) : undefined,
        pageSize: searchParams.get('pageSize') ? Number(searchParams.get('pageSize')) : undefined,
      }),
      getUnreadCount(supabase, user.id),
    ])

    return NextResponse.json({ ...result, unreadCount })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch notifications' },
      { status: 500 }
    )
  }
}

/** Marks one (`id`) or several (`ids`) notifications as read. */
export async function PATCH(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = markReadBodySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const ids = [...(parsed.data.ids ?? []), ...(parsed.data.id ? [parsed.data.id] : [])]

  if (ids.length === 0) {
    return NextResponse.json({ error: 'Provide an `id` or `ids` to mark as read' }, { status: 400 })
  }

  try {
    await Promise.all(ids.map((notificationId) => markAsRead(supabase, notificationId)))
    return NextResponse.json({ success: true, ids })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to mark notifications as read' },
      { status: 500 }
    )
  }
}
