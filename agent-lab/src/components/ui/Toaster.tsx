import { useUi } from '@/state/ui'
import { cn } from '@/lib/cn'
import { Icon } from './Icon'

export function Toaster() {
  const toasts = useUi((s) => s.toasts)
  const dismiss = useUi((s) => s.dismissToast)
  return (
    <div className="pointer-events-none fixed bottom-20 right-4 z-[70] flex w-72 flex-col gap-2 lg:bottom-auto lg:top-4" aria-live="polite" role="status">
      {toasts.map((t) => (
        <button
          key={t.id}
          onClick={() => dismiss(t.id)}
          className={cn(
            'pointer-events-auto flex items-center gap-3 rounded-xl border px-3.5 py-2.5 text-left shadow-card glass animate-fade-up',
            t.kind === 'badge' ? 'border-gold/40' : t.kind === 'error' ? 'border-bad/40' : 'border-line-strong',
          )}
        >
          <span
            className={cn(
              'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
              t.kind === 'xp' && 'bg-gradient-brand text-white',
              t.kind === 'badge' && 'bg-[color-mix(in_oklab,var(--gold)_20%,transparent)] text-gold',
              t.kind === 'info' && 'bg-accent-2-soft text-accent-2',
              t.kind === 'error' && 'bg-bad-soft text-bad',
            )}
          >
            <Icon name={t.icon ?? (t.kind === 'xp' ? 'zap' : 'info')} size={16} />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-bold text-fg">{t.title}</span>
            {t.detail && <span className="block truncate text-xs text-muted">{t.detail}</span>}
          </span>
        </button>
      ))}
    </div>
  )
}
