'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BarChart3,
  Briefcase,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Database,
  FileText,
  Gift,
  GitBranch,
  LayoutDashboard,
  Plug,
  Shield,
  Tag,
  UserCog,
  Users,
  X,
  XCircle,
  type LucideIcon,
} from 'lucide-react'

import { cn } from '@/lib/utils'

interface NavItem {
  label: string
  href: string
  icon: LucideIcon
}

const primaryNav: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
]

const recruitmentNav: NavItem[] = [
  { label: 'Requisitions', href: '/requisitions', icon: FileText },
  { label: 'Candidates', href: '/candidates', icon: Users },
  { label: 'Applications', href: '/applications', icon: ClipboardList },
  { label: 'Interviews', href: '/interviews', icon: Calendar },
  { label: 'Offers', href: '/offers', icon: Gift },
]

const analyticsNav: NavItem[] = [
  { label: 'Analytics', href: '/analytics', icon: BarChart3 },
]

const adminNav: NavItem[] = [
  { label: 'Users', href: '/admin/users', icon: UserCog },
  { label: 'Pipeline Stages', href: '/admin/stages', icon: GitBranch },
  { label: 'Sources', href: '/admin/sources', icon: Tag },
  { label: 'Rejection Reasons', href: '/admin/rejection-reasons', icon: XCircle },
  { label: 'Reference Data', href: '/admin/reference-data', icon: Database },
  { label: 'Integrations', href: '/admin/integrations', icon: Plug },
  { label: 'Audit Logs', href: '/admin/audit-logs', icon: Shield },
]

export interface SidebarProps {
  /** Names of the roles assigned to the signed-in user (case-insensitive). */
  userRoles: string[]
  /** Whether the desktop sidebar is collapsed to icon-only width. */
  collapsed: boolean
  onToggleCollapse: () => void
  /** Whether the mobile overlay sidebar is open. */
  mobileOpen?: boolean
  onMobileClose?: () => void
}

function isNavItemActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`)
}

function SidebarLogo({ collapsed }: { collapsed: boolean }) {
  return (
    <Link
      href="/dashboard"
      className={cn(
        'flex h-14 shrink-0 items-center gap-2.5 border-b border-sidebar-border px-4',
        collapsed && 'justify-center px-0'
      )}
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
        <Briefcase className="h-4.5 w-4.5" />
      </span>
      {!collapsed && (
        <span className="truncate text-sm font-semibold tracking-tight text-sidebar-foreground">
          Recruitment Hub
        </span>
      )}
    </Link>
  )
}

function NavSection({
  label,
  items,
  pathname,
  collapsed,
  onNavigate,
}: {
  label?: string
  items: NavItem[]
  pathname: string
  collapsed: boolean
  onNavigate?: () => void
}) {
  return (
    <div className="px-2">
      {label && !collapsed && (
        <p className="mb-1 mt-4 px-2 text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground/50">
          {label}
        </p>
      )}
      <ul className="flex flex-col gap-0.5">
        {items.map((item) => {
          const active = isNavItemActive(pathname, item.href)
          const Icon = item.icon
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={onNavigate}
                title={collapsed ? item.label : undefined}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex items-center gap-3 rounded-md px-2.5 py-2 text-sm font-medium transition-colors',
                  collapsed && 'justify-center px-0',
                  active
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground'
                )}
              >
                <Icon className="h-4.5 w-4.5 shrink-0" />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function SidebarContent({
  pathname,
  collapsed,
  isAdmin,
  onToggleCollapse,
  onNavigate,
  showCollapseToggle,
}: {
  pathname: string
  collapsed: boolean
  isAdmin: boolean
  onToggleCollapse: () => void
  onNavigate?: () => void
  showCollapseToggle: boolean
}) {
  return (
    <div className="flex h-full flex-col">
      <SidebarLogo collapsed={collapsed} />

      <nav className="flex-1 overflow-y-auto py-2">
        <NavSection items={primaryNav} pathname={pathname} collapsed={collapsed} onNavigate={onNavigate} />
        <NavSection
          label="Recruitment"
          items={recruitmentNav}
          pathname={pathname}
          collapsed={collapsed}
          onNavigate={onNavigate}
        />
        <NavSection items={analyticsNav} pathname={pathname} collapsed={collapsed} onNavigate={onNavigate} />
        {isAdmin && (
          <NavSection
            label="Administration"
            items={adminNav}
            pathname={pathname}
            collapsed={collapsed}
            onNavigate={onNavigate}
          />
        )}
      </nav>

      {showCollapseToggle && (
        <div className="border-t border-sidebar-border p-2">
          <button
            type="button"
            onClick={onToggleCollapse}
            className={cn(
              'flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent/60 hover:text-sidebar-foreground',
              collapsed && 'justify-center px-0'
            )}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="h-4.5 w-4.5" /> : <ChevronLeft className="h-4.5 w-4.5" />}
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>
      )}
    </div>
  )
}

export function Sidebar({
  userRoles,
  collapsed,
  onToggleCollapse,
  mobileOpen = false,
  onMobileClose,
}: SidebarProps) {
  const pathname = usePathname()
  const isAdmin = userRoles.some((role) => role.toLowerCase() === 'admin')

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          'sticky top-0 hidden h-screen shrink-0 border-r border-sidebar-border bg-sidebar transition-[width] duration-200 lg:flex',
          collapsed ? 'w-16' : 'w-64'
        )}
      >
        <SidebarContent
          pathname={pathname}
          collapsed={collapsed}
          isAdmin={isAdmin}
          onToggleCollapse={onToggleCollapse}
          showCollapseToggle
        />
      </aside>

      {/* Mobile overlay sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={onMobileClose}
            aria-hidden="true"
          />
          <aside className="absolute inset-y-0 left-0 flex w-64 flex-col bg-sidebar shadow-xl">
            <div className="flex items-center justify-between border-b border-sidebar-border px-4 py-2.5">
              <span className="text-sm font-semibold text-sidebar-foreground">Menu</span>
              <button
                type="button"
                onClick={onMobileClose}
                aria-label="Close menu"
                className="flex h-8 w-8 items-center justify-center rounded-md text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <SidebarContent
                pathname={pathname}
                collapsed={false}
                isAdmin={isAdmin}
                onToggleCollapse={onToggleCollapse}
                onNavigate={onMobileClose}
                showCollapseToggle={false}
              />
            </div>
          </aside>
        </div>
      )}
    </>
  )
}
