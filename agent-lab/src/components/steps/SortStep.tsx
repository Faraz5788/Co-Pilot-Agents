import { useState } from 'react'
import type { SortStep as S } from '@/content/types'
import { cn } from '@/lib/cn'
import { Icon } from '@/components/ui/Icon'
import { Feedback, useShuffled, type StepProps } from './shared'

export function SortStep({ step, done, onComplete }: StepProps<S>) {
  const items = useShuffled(step.items, step.id)
  const [placed, setPlaced] = useState<Record<string, string>>(() => (done ? Object.fromEntries(step.items.map((i) => [i.id, i.bucket])) : {}))
  const [selected, setSelected] = useState<string | null>(null)
  const [mistakes, setMistakes] = useState(0)
  const [flash, setFlash] = useState<{ tone: 'ok' | 'bad'; title: string; text: string; key: number } | null>(null)
  const [shake, setShake] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState<string | null>(null)

  const remaining = items.filter((i) => !placed[i.id])
  const complete = remaining.length === 0

  const place = (itemId: string, bucketId: string) => {
    const item = step.items.find((i) => i.id === itemId)
    if (!item || placed[itemId]) return
    const bucket = step.buckets.find((b) => b.id === bucketId)!
    if (item.bucket === bucketId) {
      const next = { ...placed, [itemId]: bucketId }
      setPlaced(next)
      setSelected(null)
      setFlash({ tone: 'ok', title: `${bucket.label} ✓`, text: item.why, key: Date.now() })
      if (Object.keys(next).length === step.items.length) onComplete({ firstTry: mistakes === 0 })
    } else {
      setMistakes((m) => m + 1)
      setShake(itemId)
      setTimeout(() => setShake(null), 450)
      const right = step.buckets.find((b) => b.id === item.bucket)!
      setFlash({
        tone: 'bad',
        title: `Not ${bucket.label}`,
        text: `${bucket.label} covers ${bucket.hint}. That’s not what this sentence does.${mistakes >= 1 ? ` Hint: this one is about ${right.hint}.` : ''}`,
        key: Date.now(),
      })
    }
  }

  return (
    <div className="space-y-4">
      {step.source && (
        <details className="group rounded-xl border border-line bg-surface-2/60" open>
          <summary className="flex cursor-pointer list-none items-center gap-2 px-3.5 py-2.5 text-xs font-semibold text-muted">
            <Icon name="file-warning" size={14} className="text-warn" /> {step.source.title}
            <Icon name="chevron-down" size={14} className="ml-auto transition-transform group-open:rotate-180" />
          </summary>
          <p className="border-t border-line px-3.5 py-3 font-mono text-[12.5px] leading-relaxed text-muted">{step.source.text}</p>
        </details>
      )}
      <p className="text-sm text-muted">{step.prompt} <span className="hidden sm:inline">You can also drag sentences onto a block.</span></p>

      <div className="grid gap-4 lg:grid-cols-[1fr_1.15fr]">
        {/* Pool */}
        <div>
          <div className="mb-2 flex items-center justify-between text-xs font-semibold text-subtle">
            <span>SENTENCES</span>
            <span>{step.items.length - remaining.length}/{step.items.length} placed</span>
          </div>
          <div className="flex flex-col gap-2">
            {remaining.map((i) => (
              <button
                key={i.id}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('text/plain', i.id)
                  setSelected(i.id)
                }}
                onClick={() => setSelected(selected === i.id ? null : i.id)}
                aria-pressed={selected === i.id}
                className={cn(
                  'flex items-start gap-2 rounded-xl border px-3 py-2.5 text-left text-[13.5px] transition-all',
                  selected === i.id ? 'border-accent bg-accent-soft shadow-[0_0_0_3px_var(--accent-soft)]' : 'border-line bg-surface hover:border-line-strong',
                  shake === i.id && 'animate-shake border-bad/60',
                )}
              >
                <Icon name="grip" size={14} className="mt-0.5 shrink-0 text-subtle" />
                {i.text}
              </button>
            ))}
            {complete && (
              <div className="rounded-xl border border-dashed border-ok/40 p-4 text-center text-sm text-ok">
                <Icon name="check-circle" size={20} className="mx-auto mb-1" /> Every sentence has a home.
              </div>
            )}
          </div>
        </div>

        {/* Buckets */}
        <div className="grid gap-3 sm:grid-cols-2">
          {step.buckets.map((b) => {
            const inside = step.items.filter((i) => placed[i.id] === b.id)
            return (
              <div
                key={b.id}
                onDragOver={(e) => {
                  e.preventDefault()
                  setDragOver(b.id)
                }}
                onDragLeave={() => setDragOver(null)}
                onDrop={(e) => {
                  e.preventDefault()
                  setDragOver(null)
                  place(e.dataTransfer.getData('text/plain'), b.id)
                }}
                className={cn(
                  'flex min-h-[120px] flex-col rounded-2xl border-2 border-dashed p-3 transition-colors',
                  dragOver === b.id ? 'border-accent bg-accent-soft' : 'border-line',
                )}
              >
                <button
                  onClick={() => selected && place(selected, b.id)}
                  disabled={!selected}
                  className={cn(
                    'mb-2 flex items-center gap-2 rounded-xl px-2.5 py-2 text-left transition-colors',
                    selected ? 'bg-accent-soft hover:bg-accent/25 ring-1 ring-accent/40' : 'bg-surface-2',
                  )}
                  aria-label={`Place in ${b.label}`}
                >
                  <Icon name={b.icon} size={18} className="text-accent" />
                  <span>
                    <span className="block text-sm font-bold">{b.label}</span>
                    <span className="block text-[11px] text-muted">{b.hint}</span>
                  </span>
                  {selected && <Icon name="plus" size={16} className="ml-auto text-accent" />}
                </button>
                <div className="flex flex-col gap-1.5">
                  {inside.map((i) => (
                    <div key={i.id} className="flex items-start gap-1.5 rounded-lg bg-ok-soft px-2 py-1.5 text-[12px] leading-snug animate-pop">
                      <Icon name="check" size={12} className="mt-0.5 shrink-0 text-ok" />
                      {i.text}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {flash && (
        <Feedback key={flash.key} tone={flash.tone} title={flash.title}>
          {flash.text}
        </Feedback>
      )}
      {complete && !flash && <Feedback tone="ok" title="All sorted">Nice work.</Feedback>}
    </div>
  )
}
