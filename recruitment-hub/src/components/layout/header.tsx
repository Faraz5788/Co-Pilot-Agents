'use client'

import { useRouter, usePathname } from 'next/navigation'
import { ChevronRight, LogOut, Menu, Search } from 'lucide-react'

import { createClient } from '@/lib/supabase/client'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { NotificationPanel } from '@/components/layout/notification-panel'

export interface HeaderUser {
  id: string
  name: string
  email: string
  avatar_url?: string | null
  role?: string
}

export interface HeaderProps {
  user: HeaderUser
  notificationCount: number
  onOpenSearch?: () => void
  onToggleMobileSidebar?: () => void
}

function initialsFor(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

function titleCase(segment: string): string {
  return segment
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

/** Derives a simple breadcrumb trail from the current pathname. */
function useBreadcrumb(): string[] {
  const pathname = usePathname()
  const segments = pathname.split('/').filter(Boolean)

  if (segments.length === 0) return ['Dashboard']

  // Hide raw UUID / id segments (e.g. /candidates/1234-...) from the trail.
  return segments
    .filter((segment) => !/^[0-9a-f-]{8,}$/i.test(segment))
    .map(titleCase)
}

export function Header({ user, notificationCount, onOpenSearch, onToggleMobileSidebar }: HeaderProps) {
  const router = useRouter()
  const crumbs = useBreadcrumb()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  function handleSearchTrigger() {
    onOpenSearch?.()
  }

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/75 lg:px-6">
      <button
        type="button"
        onClick={onToggleMobileSidebar}
        aria-label="Open menu"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      <nav aria-label="Breadcrumb" className="hidden min-w-0 items-center gap-1 text-sm sm:flex">
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1
          return (
            <span key={`${crumb}-${index}`} className="flex items-center gap-1">
              {index > 0 && <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />}
              <span
                className={isLast ? 'font-semibold text-foreground' : 'text-muted-foreground'}
              >
                {crumb}
              </span>
            </span>
          )
        })}
      </nav>

      <div className="ml-auto flex min-w-0 flex-1 items-center justify-end gap-2 sm:flex-none">
        <div className="relative w-full max-w-xs sm:max-w-sm">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            readOnly
            placeholder="Search candidates, requisitions..."
            onClick={handleSearchTrigger}
            onKeyDown={(event) => {
              if (event.key === 'Enter') handleSearchTrigger()
            }}
            className="h-9 w-full cursor-pointer rounded-md border border-input bg-background pl-8 pr-14 text-sm text-muted-foreground shadow-sm outline-none transition-colors focus-visible:ring-1 focus-visible:ring-ring"
          />
          <kbd className="pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 select-none items-center gap-0.5 rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground sm:flex">
            Ctrl K
          </kbd>
        </div>

        <NotificationPanel userId={user.id} initialUnreadCount={notificationCount} />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-2 rounded-md p-1 pr-1.5 transition-colors hover:bg-accent"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.avatar_url ?? undefined} alt={user.name} />
                <AvatarFallback>{initialsFor(user.name)}</AvatarFallback>
              </Avatar>
              <span className="hidden max-w-[10rem] truncate text-sm font-medium md:inline">
                {user.name}
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel>
              <div className="flex flex-col gap-0.5">
                <span className="truncate text-sm font-semibold">{user.name}</span>
                <span className="truncate text-xs font-normal text-muted-foreground">{user.email}</span>
                {user.role && (
                  <span className="mt-1 w-fit rounded bg-secondary px-1.5 py-0.5 text-[11px] font-medium capitalize text-secondary-foreground">
                    {user.role.replace(/_/g, ' ')}
                  </span>
                )}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
              <LogOut className="h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
