import { useMemo } from 'react'
import { useProgress } from '@/state/progress'

const COLORS = ['#9b7bff', '#22d3ee', '#34d399', '#f5c451', '#f472b6', '#ffffff']

export function Confetti({ count = 70 }: { count?: number }) {
  const reduced = useProgress((s) => s.settings.reducedMotion)
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        i,
        left: Math.random() * 100,
        delay: Math.random() * 0.5,
        dur: 2.2 + Math.random() * 1.6,
        dx: `${(Math.random() - 0.5) * 240}px`,
        rot: `${Math.random() * 720 - 360}deg`,
        color: COLORS[i % COLORS.length],
        w: 6 + Math.random() * 6,
        round: Math.random() > 0.6,
      })),
    [count],
  )
  if (reduced) return null
  return (
    <div className="pointer-events-none fixed inset-0 z-[90] overflow-hidden" aria-hidden>
      {pieces.map((p) => (
        <span
          key={p.i}
          style={{
            left: `${p.left}%`,
            width: p.w,
            height: p.round ? p.w : p.w * 0.45,
            background: p.color,
            borderRadius: p.round ? '999px' : '2px',
            animation: `confetti-fall ${p.dur}s cubic-bezier(.2,.6,.4,1) ${p.delay}s forwards`,
            ['--dx' as string]: p.dx,
            ['--rot' as string]: p.rot,
          }}
          className="absolute -top-4 opacity-0 [animation-fill-mode:forwards]"
        />
      ))}
    </div>
  )
}
