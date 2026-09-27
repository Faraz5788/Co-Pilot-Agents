import type { ReflectStep as S } from '@/content/types'
import { Icon } from '@/components/ui/Icon'
import { LearnMoreLink, type StepProps } from './shared'

export function ReflectStep({ step }: StepProps<S>) {
  return (
    <div className="space-y-5">
      <div className="relative overflow-hidden rounded-2xl border border-accent/30 bg-accent-soft p-6">
        <Icon name="lightbulb" size={80} className="absolute -right-3 -top-3 text-accent/10" />
        <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-accent">Remember</div>
        <p className="relative font-display text-xl font-semibold leading-snug">{step.takeaway}</p>
      </div>
      <div>
        <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-subtle">Instincts you’re building</div>
        <div className="flex flex-wrap gap-2">
          {step.instincts.map((i) => (
            <span key={i} className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1.5 text-sm">
              <Icon name="brain" size={14} className="text-accent-2" /> {i}
            </span>
          ))}
        </div>
      </div>
      {step.learnMore && <LearnMoreLink link={step.learnMore} />}
    </div>
  )
}
