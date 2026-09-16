'use client'

import { useState, type ReactNode } from 'react'

import { Sidebar } from '@/components/layout/sidebar'
import { Header, type HeaderUser } from '@/components/layout/header'
import { SearchDialog } from '@/components/layout/search-dialog'

export interface AppShellProps {
  user: HeaderUser
  /** Role names assigned to the signed-in user, used to gate admin nav. */
  userRoles: string[]
  notificationCount: number
  children: ReactNode
}

/**
 * Combines the sidebar, header and global search dialog around the page
 * content. Owns the sidebar collapse/mobile-overlay state and the search
 * dialog's open state so the pieces stay in sync.
 */
export function AppShell({ user, userRoles, notificationCount, children }: AppShellProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        userRoles={userRoles}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((value) => !value)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          user={user}
          notificationCount={notificationCount}
          onOpenSearch={() => setSearchOpen(true)}
          onToggleMobileSidebar={() => setMobileOpen(true)}
        />

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>

      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  )
}
