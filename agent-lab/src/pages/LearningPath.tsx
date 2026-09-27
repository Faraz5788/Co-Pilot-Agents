import { LEVELS, TOTAL_LESSONS } from '@/content/course'
import { useProgress } from '@/state/progress'
import { Icon } from '@/components/ui/Icon'
import { Card, ProgressBar } from '@/components/ui/primitives'
import { LevelPath } from '@/components/learning/LevelMap'
import { Page, PageHeader } from '@/components/layout/Page'

const LOOP = [
  { icon: 'book-open', l: 'Learn' },
  { icon: 'pointer', l: 'Play' },
  { icon: 'hammer', l: 'Build' },
  { icon: 'bug', l: 'Break' },
  { icon: 'wrench', l: 'Fix' },
  { icon: 'unlock', l: 'Unlock' },
]

export default function LearningPath() {
  const s = useProgress()
  const done = Object.keys(s.completedLessons).length
  const levelsDone = LEVELS.filter((l) => s.completedLevels[l.id]).length
  return (
    <Page>
      <PageHeader eyebrow="Learning path" title="From one agent to a governed system" subtitle="Eight levels. Each one adds a new layer of agent architecture — and unlocks the next." />
      <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
        <LevelPath />
        <aside className="space-y-4 lg:sticky lg:top-8 lg:self-start">
          <Card className="p-5">
            <div className="mb-3 text-[11px] font-bold uppercase tracking-wider text-subtle">Overall progress</div>
            <div className="mb-1 flex items-baseline justify-between">
              <span className="font-display text-2xl font-bold">{Math.round((done / TOTAL_LESSONS) * 100)}%</span>
              <span className="text-xs text-muted">{done}/{TOTAL_LESSONS} lessons · {levelsDone}/{LEVELS.length} levels</span>
            </div>
            <ProgressBar value={done / TOTAL_LESSONS} label="Course progress" />
          </Card>
          <Card className="p-5">
            <div className="mb-3 text-[11px] font-bold uppercase tracking-wider text-subtle">How every level works</div>
            <ol className="grid grid-cols-3 gap-2">
              {LOOP.map((x, i) => (
                <li key={x.l} className="flex flex-col items-center gap-1 rounded-xl bg-surface-2 p-2.5 text-center">
                  <Icon name={x.icon} size={18} className="text-accent" />
                  <span className="text-[11px] font-bold">{i + 1}. {x.l}</span>
                </li>
              ))}
            </ol>
            <p className="mt-3 text-[12.5px] text-muted">Short explanations, then straight into doing: decisions, builds, broken workflows to repair. You unlock the next level by completing every lesson in this one.</p>
          </Card>
        </aside>
      </div>
    </Page>
  )
}
