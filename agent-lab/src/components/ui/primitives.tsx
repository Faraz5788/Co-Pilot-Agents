import { forwardRef, type ButtonHTMLAttributes, type HTMLAttributes, type ReactNode } from 'react'
import { Link, type LinkProps } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { Icon } from './Icon'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success'
type Size = 'sm' | 'md' | 'lg'

const variants: Record<Variant, string> = {
  primary: 'bg-gradient-brand text-white shadow-[0_6px_20px_-6px_var(--accent)] hover:brightness-110 hover:-translate-y-px',
  secondary: 'bg-surface-2 text-fg border border-line hover:bg-surface-3 hover:border-line-strong',
  ghost: 'text-muted hover:text-fg hover:bg-surface-2',
  danger: 'bg-bad-soft text-bad border border-bad/30 hover:bg-bad/20',
  success: 'bg-ok text-white hover:brightness-110',
}
const sizes: Record<Size, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5 rounded-lg',
  md: 'h-10 px-4 text-sm gap-2 rounded-xl',
  lg: 'h-12 px-6 text-[15px] gap-2.5 rounded-xl',
}

export const buttonClass = (variant: Variant = 'primary', size: Size = 'md', className?: string) =>
  cn(
    'inline-flex items-center justify-center font-semibold whitespace-nowrap transition-all duration-150 select-none',
    'disabled:opacity-40 disabled:pointer-events-none active:translate-y-0',
    variants[variant],
    sizes[size],
    className,
  )

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  icon?: string
  iconRight?: string
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', icon, iconRight, className, children, type = 'button', ...rest },
  ref,
) {
  const is = size === 'sm' ? 14 : size === 'lg' ? 18 : 16
  return (
    <button ref={ref} type={type} className={buttonClass(variant, size, className)} {...rest}>
      {icon && <Icon name={icon} size={is} />}
      {children}
      {iconRight && <Icon name={iconRight} size={is} />}
    </button>
  )
})

export function ButtonLink({ variant = 'primary', size = 'md', icon, iconRight, className, children, ...rest }: LinkProps & { variant?: Variant; size?: Size; icon?: string; iconRight?: string }) {
  const is = size === 'sm' ? 14 : size === 'lg' ? 18 : 16
  return (
    <Link className={buttonClass(variant, size, className)} {...rest}>
      {icon && <Icon name={icon} size={is} />}
      {children}
      {iconRight && <Icon name={iconRight} size={is} />}
    </Link>
  )
}

export function Card({ className, glow, ...rest }: HTMLAttributes<HTMLDivElement> & { glow?: boolean }) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-line bg-surface shadow-card',
        glow && 'relative before:pointer-events-none before:absolute before:inset-0 before:rounded-2xl before:bg-[radial-gradient(600px_200px_at_0%_0%,var(--accent-soft),transparent_70%)]',
        className,
      )}
      {...rest}
    />
  )
}

type Tone = 'accent' | 'cyan' | 'ok' | 'warn' | 'bad' | 'neutral' | 'gold'
const tones: Record<Tone, string> = {
  accent: 'bg-accent-soft text-accent border-accent/25',
  cyan: 'bg-accent-2-soft text-accent-2 border-accent-2/25',
  ok: 'bg-ok-soft text-ok border-ok/25',
  warn: 'bg-warn-soft text-warn border-warn/25',
  bad: 'bg-bad-soft text-bad border-bad/25',
  neutral: 'bg-surface-2 text-muted border-line',
  gold: 'bg-[color-mix(in_oklab,var(--gold)_14%,transparent)] text-gold border-gold/30',
}

export function Pill({ tone = 'neutral', icon, className, children }: { tone?: Tone; icon?: string; className?: string; children: ReactNode }) {
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide', tones[tone], className)}>
      {icon && <Icon name={icon} size={12} />}
      {children}
    </span>
  )
}

export function ProgressBar({ value, className, tone = 'brand', label }: { value: number; className?: string; tone?: 'brand' | 'ok'; label?: string }) {
  const v = Math.max(0, Math.min(1, value))
  return (
    <div
      className={cn('h-2 w-full overflow-hidden rounded-full bg-surface-3', className)}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(v * 100)}
      aria-label={label}
    >
      <div className={cn('h-full rounded-full transition-[width] duration-700 ease-out', tone === 'ok' ? 'bg-ok' : 'bg-gradient-brand')} style={{ width: `${v * 100}%` }} />
    </div>
  )
}

export function IconTile({ icon, tone = 'accent', size = 'md', className }: { icon: string; tone?: Tone; size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const s = size === 'sm' ? 'h-8 w-8 rounded-lg' : size === 'lg' ? 'h-14 w-14 rounded-2xl' : 'h-10 w-10 rounded-xl'
  const is = size === 'sm' ? 16 : size === 'lg' ? 26 : 20
  return (
    <span className={cn('inline-flex shrink-0 items-center justify-center border', tones[tone], s, className)}>
      <Icon name={icon} size={is} />
    </span>
  )
}

export function SectionTitle({ eyebrow, title, action, className }: { eyebrow?: string; title: ReactNode; action?: ReactNode; className?: string }) {
  return (
    <div className={cn('mb-4 flex items-end justify-between gap-3', className)}>
      <div>
        {eyebrow && <div className="mb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-subtle">{eyebrow}</div>}
        <h2 className="font-display text-lg font-semibold tracking-tight text-fg">{title}</h2>
      </div>
      {action}
    </div>
  )
}

export function Kbd({ children }: { children: ReactNode }) {
  return <kbd className="rounded border border-line bg-surface-2 px-1.5 py-0.5 font-mono text-[10px] text-muted">{children}</kbd>
}

export { type Tone }
