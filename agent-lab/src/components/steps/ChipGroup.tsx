import { cn } from '@/lib/cn'
import { Icon } from '@/components/ui/Icon'

export interface ChipOption {
  id: string
  label: string
  hint?: string
  icon?: string
  badge?: string
  badgeTone?: 'warn' | 'bad' | 'ok'
}

export function ChipGroup({
  options,
  value,
  onChange,
  multiple,
  columns = 1,
  ariaLabel,
}: {
  options: ChipOption[]
  value: string[]
  onChange: (v: string[]) => void
  multiple?: boolean
  columns?: 1 | 2
  ariaLabel: string
}) {
  const toggle = (id: string) => {
    if (multiple) onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id])
    else onChange([id])
  }
  return (
    <div role={multiple ? 'group' : 'radiogroup'} aria-label={ariaLabel} className={cn('grid gap-2', columns === 2 && 'sm:grid-cols-2')}>
      {options.map((o) => {
        const on = value.includes(o.id)
        return (
          <button
            key={o.id}
            role={multiple ? 'checkbox' : 'radio'}
            aria-checked={on}
            onClick={() => toggle(o.id)}
            className={cn(
              'flex items-start gap-2.5 rounded-xl border px-3 py-2.5 text-left text-[13.5px] transition-all',
              on ? 'border-accent/70 bg-accent-soft' : 'border-line bg-surface hover:border-line-strong hover:bg-surface-2',
            )}
          >
            <span
              className={cn(
                'mt-0.5 flex h-4.5 w-4.5 shrink-0 items-center justify-center border transition-colors',
                multiple ? 'rounded-md' : 'rounded-full',
                on ? 'border-accent bg-accent text-white' : 'border-line-strong',
              )}
            >
              {on && <Icon name="check" size={12} strokeWidth={3} />}
            </span>
            {o.icon && <Icon name={o.icon} size={16} className="mt-0.5 shrink-0 text-muted" />}
            <span className="min-w-0 flex-1">
              <span className="font-medium">{o.label}</span>
              {o.hint && <span className="block text-[11.5px] text-muted">{o.hint}</span>}
            </span>
            {o.badge && (
              <span
                className={cn(
                  'shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase',
                  o.badgeTone === 'bad' ? 'bg-bad-soft text-bad' : o.badgeTone === 'warn' ? 'bg-warn-soft text-warn' : 'bg-surface-3 text-muted',
                )}
              >
                {o.badge}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
