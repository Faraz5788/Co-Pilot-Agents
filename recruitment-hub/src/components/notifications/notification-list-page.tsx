'use client'

import { useState, type ReactNode } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import {
  Bell,
  Briefcase,
  CalendarClock,
  Check,
  ClipboardList,
  Inbox,
  Loader,
  Users,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { NotificationType } from '@/types/database'

interface NotificationRecord {
  id: string
  type: NotificationType
  title: string
  message: string
  object_type: string | null
  object_id: string | null
  read_at: string | null
  created_at: string
}

interface Pagination {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export interface NotificationListPageProps {
  notifications: NotificationRecord[]
  pagination: Pagination
  unreadOnly: boolean
}

const TYPE_ICONS: Record<NotificationType, ReactNode> = {
  candidate_review: <Users className="h-4 w-4" />,
  interview_scheduled: <CalendarClock className="h-4 w-4" />,
  feedback_required: <ClipboardList className="h-4 w-4" />,
  offer_pending: <Briefcase className="h-4 w-4" />,
  stage_change: <ClipboardList className="h-4 w-4" />,
  requisition_update: <Briefcase className="h-4 w-4" />,
  general: <Bell className="h-4 w-4" />,
}

const TYPE_TONES: Record<NotificationType, string> = {
  candidate_review: 'bg-blue-50 text-blue-600',
  interview_scheduled: 'bg-purple-50 text-purple-600',
  feedback_required: 'bg-amber-50 text-amber-600',
  offer_pending: 'bg-emerald-50 text-emerald-600',
  stage_change: 'bg-blue-50 text-blue-600',
  requisition_update: 'bg-slate-100 text-slate-600',
  general: 'bg-gray-100 text-gray-600',
}

function resolveLink(notification: NotificationRecord): string | null {
  if (!notification.object_type) return null
  switch (notification.object_type) {
    case 'interview':
      return '/interviews'
    case 'offer':
      return '/offers'
    case 'application':
      return notification.object_id ? `/applications/${notification.object_id}` : '/applications'
    case 'requisition':
      return notification.object_id ? `/requisitions/${notification.object_id}` : '/requisitions'
    case 'candidate':
      return notification.object_id ? `/candidates/${notification.object_id}` : '/candidates'
    default:
      return null
  }
}

export function NotificationListPage({
  notifications,
  pagination,
  unreadOnly,
}: NotificationListPageProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set())
  const [markingAll, setMarkingAll] = useState(false)

  function setFilter(next: 'all' | 'unread') {
    const params = new URLSearchParams(searchParams.toString())
    if (next === 'unread') {
      params.set('filter', 'unread')
    } else {
      params.delete('filter')
    }
    params.delete('page')
    router.push(`${pathname}?${params.toString()}`)
  }

  function goToPage(page: number) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', String(page))
    router.push(`${pathname}?${params.toString()}`)
  }

  async function markRead(id: string) {
    setPendingIds((prev) => new Set(prev).add(id))
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
    } finally {
      router.refresh()
    }
  }

  async function handleClick(notification: NotificationRecord) {
    const link = resolveLink(notification)
    if (!notification.read_at) {
      await markRead(notification.id)
    }
    if (link) {
      router.push(link)
    }
  }

  async function handleMarkAllRead() {
    setMarkingAll(true)
    try {
      await fetch('/api/notifications/read-all', { method: 'POST' })
      router.refresh()
    } finally {
      setMarkingAll(false)
    }
  }

  const hasUnread = notifications.some((n) => !n.read_at)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Notifications</h1>
          <p className="mt-1 text-sm text-gray-500">Stay on top of activity across your pipeline.</p>
        </div>
        <button
          type="button"
          onClick={handleMarkAllRead}
          disabled={markingAll || !hasUnread}
          className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {markingAll ? <Loader className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
          Mark All Read
        </button>
      </div>

      <div className="inline-flex rounded-md border border-gray-200 bg-white p-1 shadow-sm">
        <button
          type="button"
          onClick={() => setFilter('all')}
          className={cn(
            'rounded px-3 py-1.5 text-sm font-medium',
            !unreadOnly ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'
          )}
        >
          All
        </button>
        <button
          type="button"
          onClick={() => setFilter('unread')}
          className={cn(
            'rounded px-3 py-1.5 text-sm font-medium',
            unreadOnly ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'
          )}
        >
          Unread
        </button>
      </div>

      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 bg-white py-16 text-gray-400">
          <Inbox className="h-10 w-10" strokeWidth={1.5} />
          <p className="text-sm font-medium">No notifications</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          {notifications.map((notification) => {
            const isUnread = !notification.read_at
            const isPending = pendingIds.has(notification.id)
            return (
              <button
                key={notification.id}
                type="button"
                onClick={() => handleClick(notification)}
                disabled={isPending}
                className={cn(
                  'flex w-full items-start gap-3 px-4 py-4 text-left transition-colors hover:bg-gray-50',
                  isUnread && 'bg-blue-50/40'
                )}
              >
                <span className="mt-1.5 flex h-2 w-2 shrink-0 items-center justify-center">
                  {isUnread ? <span className="h-2 w-2 rounded-full bg-blue-600" /> : null}
                </span>
                <span
                  className={cn(
                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
                    TYPE_TONES[notification.type]
                  )}
                >
                  {TYPE_ICONS[notification.type]}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span
                      className={cn(
                        'truncate text-sm',
                        isUnread ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'
                      )}
                    >
                      {notification.title}
                    </span>
                    <span className="shrink-0 text-xs text-gray-400">
                      {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                    </span>
                  </span>
                  <span className="mt-0.5 block truncate text-sm text-gray-500">
                    {notification.message}
                  </span>
                </span>
              </button>
            )
          })}
        </div>
      )}

      {pagination.totalPages > 1 ? (
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={pagination.page <= 1}
              onClick={() => goToPage(pagination.page - 1)}
              className="rounded-md border border-gray-300 px-3 py-1 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => goToPage(pagination.page + 1)}
              className="rounded-md border border-gray-300 px-3 py-1 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
