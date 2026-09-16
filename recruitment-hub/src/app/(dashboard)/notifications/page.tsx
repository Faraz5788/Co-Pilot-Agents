import { createClient } from '@/lib/supabase/server'
import { getNotifications } from '@/lib/services/notifications'
import { NotificationListPage } from '@/components/notifications/notification-list-page'

interface NotificationsPageProps {
  searchParams: Promise<{
    filter?: string
    page?: string
  }>
}

export default async function NotificationsPage({ searchParams }: NotificationsPageProps) {
  const params = await searchParams
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const page = params.page ? Number(params.page) || 1 : 1
  const unreadOnly = params.filter === 'unread'

  if (!user) {
    return (
      <NotificationListPage
        notifications={[]}
        pagination={{ page: 1, pageSize: 25, total: 0, totalPages: 0 }}
        unreadOnly={unreadOnly}
      />
    )
  }

  const result = await getNotifications(supabase, user.id, {
    unreadOnly,
    page,
    pageSize: 25,
  })

  return (
    <NotificationListPage
      notifications={result.data}
      pagination={{
        page: result.page,
        pageSize: result.pageSize,
        total: result.total,
        totalPages: result.totalPages,
      }}
      unreadOnly={unreadOnly}
    />
  )
}
