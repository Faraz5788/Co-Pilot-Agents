import { useRef, useState, type ReactNode } from 'react'
import { initialProgress, useProgress, type ProgressData } from '@/state/progress'
import { useUi } from '@/state/ui'
import { cn } from '@/lib/cn'
import { Icon } from '@/components/ui/Icon'
import { Button, Card } from '@/components/ui/primitives'
import { Modal } from '@/components/ui/Modal'
import { Page, PageHeader } from '@/components/layout/Page'

function Row({ icon, title, desc, children }: { icon: string; title: string; desc: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center">
      <Icon name={icon} size={20} className="shrink-0 text-accent" />
      <div className="flex-1">
        <div className="font-semibold">{title}</div>
        <div className="text-sm text-muted">{desc}</div>
      </div>
      {children}
    </div>
  )
}

function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button role="switch" aria-checked={on} aria-label={label} onClick={() => onChange(!on)} className={cn('relative h-7 w-12 shrink-0 rounded-full transition-colors', on ? 'bg-accent' : 'bg-surface-3')}>
      <span className={cn('absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all', on ? 'left-6' : 'left-1')} />
    </button>
  )
}

export default function Settings() {
  const s = useProgress()
  const setSettings = useProgress((x) => x.setSettings)
  const reset = useProgress((x) => x.reset)
  const importData = useProgress((x) => x.importData)
  const pushToast = useUi((x) => x.pushToast)
  const [confirm, setConfirm] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const exportData = () => {
    const { completeStep: _a, completeLesson: _b, saveAgent: _c, saveSkill: _d, saveArchitecture: _e, deleteArchitecture: _f, bump: _g, touchStreak: _h, setSettings: _i, setName: _j, reset: _k, importData: _l, ...data } = useProgress.getState()
    const blob = new Blob([JSON.stringify({ app: 'agent-lab', version: 1, data }, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `agent-lab-progress-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const onImport = async (file: File) => {
    try {
      const parsed = JSON.parse(await file.text())
      const data = (parsed?.data ?? parsed) as Partial<ProgressData>
      if (typeof data.xp !== 'number' || typeof data.completedLessons !== 'object') throw new Error('Not an Agent Lab progress file')
      importData({ ...initialProgress(), ...data } as ProgressData)
      pushToast({ kind: 'info', title: 'Progress imported', icon: 'upload' })
    } catch (e) {
      pushToast({ kind: 'error', title: 'Import failed', detail: e instanceof Error ? e.message : 'Invalid file', icon: 'x-circle' })
    }
  }

  return (
    <Page>
      <PageHeader eyebrow="Settings" title="Preferences" subtitle="Your progress is stored in this browser. No account needed." />
      <Card className="mb-6 divide-y divide-line">
        <Row icon={s.settings.theme === 'dark' ? 'moon' : 'sun'} title="Dark mode" desc="Agent Lab is designed dark-first, with a full light theme.">
          <Toggle label="Dark mode" on={s.settings.theme === 'dark'} onChange={(v) => setSettings({ theme: v ? 'dark' : 'light' })} />
        </Row>
        <Row icon="pause" title="Reduce motion" desc="Minimise animations, confetti and simulation delays.">
          <Toggle label="Reduce motion" on={s.settings.reducedMotion} onChange={(v) => setSettings({ reducedMotion: v })} />
        </Row>
        <Row icon="unlock" title="Preview all levels" desc="Unlock every level and lesson to explore freely. Your XP and badges still require completing the work.">
          <Toggle label="Preview all levels" on={s.settings.previewAll} onChange={(v) => setSettings({ previewAll: v })} />
        </Row>
      </Card>
      <Card className="divide-y divide-line">
        <Row icon="download" title="Export progress" desc="Download a JSON backup of your XP, badges, agents, skills and designs.">
          <Button variant="secondary" icon="download" onClick={exportData}>Export</Button>
        </Row>
        <Row icon="upload" title="Import progress" desc="Restore from a previously exported file. This replaces current progress.">
          <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={(e) => e.target.files?.[0] && onImport(e.target.files[0])} />
          <Button variant="secondary" icon="upload" onClick={() => fileRef.current?.click()}>Import</Button>
        </Row>
        <Row icon="rotate-ccw" title="Reset progress" desc="Start again from Level 1. This can’t be undone.">
          <Button variant="danger" icon="trash" onClick={() => setConfirm(true)}>Reset</Button>
        </Row>
      </Card>
      <Modal open={confirm} onClose={() => setConfirm(false)} title="Reset all progress?">
        <p className="text-sm text-muted">You’ll lose {s.xp} XP, {Object.keys(s.badges).length} badges, your agents, skills and saved designs. Consider exporting first.</p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setConfirm(false)}>Cancel</Button>
          <Button variant="danger" icon="trash" onClick={() => { reset(); setConfirm(false); pushToast({ kind: 'info', title: 'Progress reset', icon: 'rotate-ccw' }) }}>Reset everything</Button>
        </div>
      </Modal>
    </Page>
  )
}
