import { AVATAR_COLORS } from '@/cloud/client'
import { cn } from '@/lib/cn'

export function Avatar({ name, color, size = 36, online }: { name: string; color?: string; size?: number; online?: boolean }) {
  const initials = name.split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase() || '?'
  return (
    <span className="relative inline-flex shrink-0">
      <span
        className={cn('flex items-center justify-center rounded-full bg-gradient-to-br font-display font-bold text-white', AVATAR_COLORS[color ?? 'violet'] ?? AVATAR_COLORS.violet)}
        style={{ width: size, height: size, fontSize: size * 0.38 }}
        aria-hidden
      >
        {initials}
      </span>
      {online && <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-ok ring-2 ring-[var(--surface)]" title="Online now" />}
    </span>
  )
}
