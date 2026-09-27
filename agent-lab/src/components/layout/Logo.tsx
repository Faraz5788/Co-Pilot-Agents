import { Link } from 'react-router-dom'

export function Logo({ compact }: { compact?: boolean }) {
  return (
    <Link to="/" className="group flex items-center gap-2.5" aria-label="Agent Lab home">
      <span className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-line-strong bg-surface-2 shadow-card">
        <svg viewBox="0 0 32 32" className="h-6 w-6" aria-hidden>
          <defs>
            <linearGradient id="lg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="var(--accent)" />
              <stop offset="1" stopColor="var(--accent-2)" />
            </linearGradient>
          </defs>
          <path d="M16 4 L26 10 V22 L16 28 L6 22 V10 Z" fill="none" stroke="url(#lg)" strokeWidth="2.4" strokeLinejoin="round" />
          <circle cx="16" cy="16" r="3.6" fill="url(#lg)" className="origin-center transition-transform duration-300 group-hover:scale-125" />
          <path d="M16 12.4 V6 M19.1 17.8 L24.5 21 M12.9 17.8 L7.5 21" stroke="url(#lg)" strokeWidth="1.6" opacity="0.6" />
        </svg>
      </span>
      {!compact && (
        <span className="leading-none">
          <span className="block font-display text-[17px] font-bold tracking-tight">AGENT LAB</span>
          <span className="block text-[10.5px] font-medium text-subtle">Learn by building</span>
        </span>
      )}
    </Link>
  )
}
