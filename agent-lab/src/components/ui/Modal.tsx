import { useEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/cn'
import { Icon } from './Icon'

export function Modal({ open, onClose, title, children, className, hideClose }: { open: boolean; onClose: () => void; title?: string; children: ReactNode; className?: string; hideClose?: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const prev = document.activeElement as HTMLElement | null
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'Tab' && ref.current) {
        const f = ref.current.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
        if (!f.length) return
        const first = f[0]
        const last = f[f.length - 1]
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
      }
    }
    document.addEventListener('keydown', onKey)
    setTimeout(() => ref.current?.querySelector<HTMLElement>('[data-autofocus], button')?.focus(), 30)
    return () => {
      document.removeEventListener('keydown', onKey)
      prev?.focus?.()
    }
  }, [open, onClose])

  if (!open) return null
  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-up" onClick={onClose} />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn('relative z-10 w-full max-w-md rounded-2xl border border-line bg-surface p-6 shadow-card animate-pop', className)}
      >
        {!hideClose && (
          <button onClick={onClose} className="absolute right-3 top-3 rounded-lg p-1.5 text-muted hover:bg-surface-2 hover:text-fg" aria-label="Close">
            <Icon name="x" size={18} />
          </button>
        )}
        {title && <h2 className="mb-3 pr-8 font-display text-lg font-semibold">{title}</h2>}
        {children}
      </div>
    </div>,
    document.body,
  )
}
