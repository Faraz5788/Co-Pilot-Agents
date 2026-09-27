import type { LearnStep as S } from '@/content/types'
import { Icon } from '@/components/ui/Icon'
import { Visual } from '@/components/learning/Visuals'
import { LearnMoreLink, type StepProps } from './shared'

export function LearnStep({ step }: StepProps<S>) {
  return (
    <div className="space-y-5">
      <div className="space-y-3 text-[15px] leading-relaxed text-fg/90">
        {step.body.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
      {step.visual && <Visual id={step.visual} />}
      {step.points && (
        <div className="grid gap-2 sm:grid-cols-3">
          {step.points.map((p) => (
            <div key={p.term} className="rounded-xl border border-line bg-surface-2/60 p-3">
              <div className="mb-1 flex items-center gap-2 text-sm font-bold">
                <Icon name={p.icon} size={16} className="text-accent" /> {p.term}
              </div>
              <div className="text-[13px] text-muted">{p.text}</div>
            </div>
          ))}
        </div>
      )}
      {step.learnMore && <LearnMoreLink link={step.learnMore} />}
    </div>
  )
}
