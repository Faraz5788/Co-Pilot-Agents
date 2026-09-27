import { useEffect } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { useProgress } from '@/state/progress'
import { useUi } from '@/state/ui'
import { Icon } from '@/components/ui/Icon'
import { Toaster } from '@/components/ui/Toaster'
import { CelebrationHost } from '@/components/ui/CelebrationHost'
import { Logo } from './Logo'
import { MOBILE_TABS, NAV } from './nav'
import { XpChip } from './XpChip'

function useThemeSync() {
  const theme = useProgress((s) => s.settings.theme)
  const reduced = useProgress((s) => s.settings.reducedMotion)
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    document.documentElement.style.colorScheme = theme
  }, [theme])
  useEffect(() => {
    document.documentElement.classList.toggle('reduce-motion', reduced)
  }, [reduced])
}

function ThemeToggle({ withLabel }: { withLabel?: boolean }) {
  const theme = useProgress((s) => s.settings.theme)
  const setSettings = useProgress((s) => s.setSettings)
  const next = theme === 'dark' ? 'light' : 'dark'
  return (
    <button
      onClick={() => setSettings({ theme: next })}
      className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-surface-2 hover:text-fg"
      aria-label={`Switch to ${next} theme`}
    >
      <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={18} />
      {withLabel && <span>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>}
    </button>
  )
}

function NavItems({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-0.5" aria-label="Main">
      {NAV.map((n) => (
        <NavLink
          key={n.to}
          to={n.to}
          end={n.end}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
              isActive ? 'bg-accent-soft text-fg' : 'text-muted hover:bg-surface-2 hover:text-fg',
            )
          }
        >
          {({ isActive }) => (
            <>
              {isActive && <span className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full bg-gradient-brand" />}
              <Icon name={n.icon} size={18} className={isActive ? 'text-accent' : ''} />
              {n.label}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}

function SidebarFooter({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex flex-col gap-0.5 border-t border-line pt-3">
      <NavLink
        to="/settings"
        onClick={onNavigate}
        className={({ isActive }) =>
          cn('flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors', isActive ? 'bg-accent-soft text-fg' : 'text-muted hover:bg-surface-2 hover:text-fg')
        }
      >
        <Icon name="settings" size={18} /> Settings
      </NavLink>
      <ThemeToggle withLabel />
    </div>
  )
}

export function AppShell() {
  useThemeSync()
  const { pathname } = useLocation()
  const mobileOpen = useUi((s) => s.mobileNavOpen)
  const setMobile = useUi((s) => s.setMobileNav)
  const touchStreak = useProgress((s) => s.touchStreak)
  const fullBleed = pathname.startsWith('/playground')

  useEffect(() => {
    setMobile(false)
    if (!fullBleed) window.scrollTo({ top: 0 })
  }, [pathname, setMobile, fullBleed])

  useEffect(() => {
    // Visiting counts toward the streak only once the learner has started.
    if (useProgress.getState().xp > 0) touchStreak()
  }, [touchStreak])

  return (
    <div className="flex min-h-full">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[100] focus:rounded-lg focus:bg-surface focus:px-3 focus:py-2">
        Skip to content
      </a>

      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col gap-6 border-r border-line bg-surface/60 px-4 py-5 backdrop-blur-xl lg:flex">
        <div className="px-1">
          <Logo />
        </div>
        <XpChip />
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          <NavItems />
        </div>
        <SidebarFooter />
      </aside>

      {/* Mobile top bar */}
      <header className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-line px-4 glass lg:hidden">
        <Logo />
        <div className="flex items-center gap-1">
          <XpChip compact />
          <button onClick={() => setMobile(true)} className="rounded-lg p-2 text-muted hover:bg-surface-2 hover:text-fg" aria-label="Open menu">
            <Icon name="menu" size={22} />
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobile(false)} />
          <div className="absolute right-0 top-0 flex h-full w-72 max-w-[85vw] flex-col gap-5 border-l border-line bg-surface p-4 animate-fade-up">
            <div className="flex items-center justify-between">
              <Logo />
              <button onClick={() => setMobile(false)} className="rounded-lg p-2 text-muted hover:bg-surface-2" aria-label="Close menu">
                <Icon name="x" size={20} />
              </button>
            </div>
            <XpChip />
            <div className="flex-1 overflow-y-auto">
              <NavItems onNavigate={() => setMobile(false)} />
            </div>
            <SidebarFooter onNavigate={() => setMobile(false)} />
          </div>
        </div>
      )}

      <main id="main" className={cn('min-w-0 flex-1 pt-14 pb-20 lg:pt-0 lg:pb-0', fullBleed && 'pb-16')}>
        <Outlet />
      </main>

      {/* Mobile bottom tabs */}
      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-line glass pb-[env(safe-area-inset-bottom)] lg:hidden" aria-label="Quick navigation">
        {MOBILE_TABS.map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            end={n.end}
            className={({ isActive }) => cn('flex flex-col items-center gap-1 py-2 text-[10.5px] font-semibold', isActive ? 'text-accent' : 'text-subtle')}
          >
            <Icon name={n.icon} size={20} />
            {n.label.replace('Agent ', '').replace('Learning ', '')}
          </NavLink>
        ))}
      </nav>

      <Toaster />
      <CelebrationHost />
    </div>
  )
}
