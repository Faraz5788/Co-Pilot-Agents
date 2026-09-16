'use client'

import { useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import { formatDistanceToNowStrict } from 'date-fns'
import { Bell, CheckCheck, Loader2 } from 'lucide-react'

import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { getNotifications, markAllAsRead, markAsRead } from '@/lib/services/notifications'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import type { Notification } from '@/types/database'

export interface NotificationPanelProps {
  /** The signed-in user's id, used to load and mutate their notifications. */
  userId: string
  /** Server-fetched unread count, shown immediately before the list loads. */
  initialUnreadCount?: number
}

/** Best-effort route for a notification's related record, by object type. */
const OBJECT_TYPE_ROUTES: Record<string, (id: string) => string> = {
  candidate: (id) => `/candidates/${id}`,
  candidates: (id) => `/candidates/${id}`,
  application: (id) => `/applications/${id}`,
  applications: (id) => `/applications/${id}`,
  requisition: (id) => `/requisitions/${id}`,
  requisitions: (id) => `/requisitions/${id}`,
  interview: () => `/interviews`,
  interviews: () => `/interviews`,
  offer: () => `/offers`,
  offers: () => `/offers`,
}

function resolveHref(objectType: string | null, objectId: string | null): string | null {
  if (!objectType || !objectId) return null
  const resolve = OBJECT_TYPE_ROUTES[objectType]
  return resolve ? resolve(objectId) : null
}

export function NotificationPanel({ userId, initialUnreadCount = 0 }: NotificationPanelProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount)

  // Keep the badge in sync if the server-supplied count changes (e.g. after
  // navigation re-renders the dashboard layout). Adjusted during render
  // rather than in an effect, per https://react.dev/learn/you-might-not-need-an-effect
  const [trackedInitialCount, setTrackedInitialCount] = useState(initialUnreadCount)
  if (initialUnreadCount !== trackedInitialCount) {
    setTrackedInitialCount(initialUnreadCount)
    setUnreadCount(initialUnreadCount)
  }

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      const { data } = await getNotifications(supabase, userId, { pageSize: 15 })
      setNotifications(data as Notification[])
      setLoaded(true)
    } catch {
      // Best-effort: leave the panel empty if the fetch fails.
    } finally {
      setLoading(false)
    }
  }, [userId])

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (next && !loaded) {
      void load()
    }
  }

  async function handleMarkAllRead() {
    const now = new Date().toISOString()
    setNotifications((prev) =>
      prev.map((notification) => ({
        ...notification,
        read_at: notification.read_at ?? now,
      }))
    )
    setUnreadCount(0)

    try {
      const supabase = createClient()
      await markAllAsRead(supabase, userId)
    } catch {
      // Best-effort: a subsequent load will reconcile any drift.
    }
  }

  async function handleSelect(notification: Notification) {
    setOpen(false)

    if (!notification.read_at) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === notification.id ? { ...n, read_at: new Date().toISOString() } : n))
      )
      setUnreadCount((count) => Math.max(0, count - 1))

      try {
        const supabase = createClient()
        await markAsRead(supabase, notification.id)
      } catch {
        // Best-effort.
      }
    }

    const href = resolveHref(notification.object_type, notification.object_id)
    if (href) {
      router.push(href)
    }
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'}
          className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold leading-none text-destructive-foreground">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" sideOffset={8} className="w-80 p-0">
        <div className="flex items-center justify-between border-b border-border px-3 py-2.5">
          <p className="text-sm font-semibold">Notifications</p>
          <button
            type="button"
            onClick={handleMarkAllRead}
            disabled={unreadCount === 0}
            className="flex items-center gap-1 text-xs font-medium text-primary transition-opacity hover:underline disabled:pointer-events-none disabled:opacity-40"
          >
            <CheckCheck className="h-3.5 w-3.5" />
            Mark all as read
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          )}

          {!loading && notifications.length === 0 && (
            <p className="px-3 py-10 text-center text-sm text-muted-foreground">
              You&apos;re all caught up.
            </p>
          )}

          {!loading &&
            notifications.map((notification) => {
              const isUnread = !notification.read_at
              return (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() => handleSelect(notification)}
                  className={cn(
                    'flex w-full items-start gap-2.5 border-b border-border/60 px-3 py-2.5 text-left text-sm transition-colors last:border-b-0 hover:bg-accent/60',
                    isUnread && 'bg-accent/30'
                  )}
                >
                  <span
                    className={cn(
                      'mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full',
                      isUnread ? 'bg-primary' : 'bg-transparent'
                    )}
                    aria-hidden="true"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">{notification.title}</span>
                    {notification.message && (
                      <span className="line-clamp-2 block text-xs text-muted-foreground">
                        {notification.message}
                      </span>
                    )}
                    <span className="mt-0.5 block text-[11px] text-muted-foreground">
                      {formatDistanceToNowStrict(new Date(notification.created_at), { addSuffix: true })}
                    </span>
                  </span>
                </button>
              )
            })}
        </div>
      </PopoverContent>
    </Popover>
  )
}
