import type { PaletteItem } from '@/content/types'
import { cn } from '@/lib/cn'
import { Icon } from '@/components/ui/Icon'
import { KIND_STYLE } from './kindStyles'
import { groupPalette, paletteLabel } from '@/engine/palette'

export function Palette({ items, onAdd, horizontal }: { items: PaletteItem[]; onAdd: (p: PaletteItem) => void; horizontal?: boolean }) {
  const groups = groupPalette(items)
  return (
    <div className={cn(horizontal ? 'flex gap-2 overflow-x-auto pb-1 scrollbar-thin' : 'space-y-4')}>
      {groups.map((g) => (
        <div key={g.group} className={cn(horizontal && 'flex shrink-0 items-center gap-2')}>
          <div className={cn('text-[10.5px] font-bold uppercase tracking-[0.14em] text-subtle', horizontal ? 'sr-only' : 'mb-1.5')}>{g.group}</div>
          <div className={cn(horizontal ? 'flex gap-2' : 'flex flex-col gap-1.5')}>
            {g.items.map((p, i) => {
              const l = paletteLabel(p)
              return (
                <button
                  key={i}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('application/agent-lab', JSON.stringify(p))
                    e.dataTransfer.effectAllowed = 'move'
                  }}
                  onClick={() => onAdd(p)}
                  title={`${l.label} — click or drag onto the canvas`}
                  className={cn(
                    'group flex items-center gap-2 rounded-xl border border-line bg-surface px-2.5 py-2 text-left transition-all hover:-translate-y-px hover:border-line-strong',
                    horizontal && 'shrink-0',
                  )}
                >
                  <span className={cn('flex h-7 w-7 shrink-0 items-center justify-center rounded-lg', KIND_STYLE[p.kind].tile)}>
                    <Icon name={l.icon} size={14} />
                  </span>
                  <span className="min-w-0 leading-tight">
                    <span className="block truncate text-[12.5px] font-semibold">{l.label}</span>
                    {!horizontal && <span className="block truncate text-[10.5px] text-muted">{l.sub}</span>}
                  </span>
                  <Icon name="plus" size={13} className="ml-auto shrink-0 text-subtle opacity-0 transition-opacity group-hover:opacity-100" />
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
