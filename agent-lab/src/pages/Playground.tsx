import { useEffect, useMemo, useState } from 'react'
import { TEMPLATES, attritionPipeline } from '@/content/templates'
import type { LabGraph } from '@/engine/graph'
import { cn } from '@/lib/cn'
import { useProgress } from '@/state/progress'
import { localRepository } from '@/state/storage'
import { useUi } from '@/state/ui'
import { Icon } from '@/components/ui/Icon'
import { Button } from '@/components/ui/primitives'
import { Modal } from '@/components/ui/Modal'
import { FULL_PALETTE } from '@/engine/palette'
import { Workbench, type PanelTab } from '@/components/playground/Workbench'

const DRAFT_KEY = 'agent-lab:playground-draft'
const INTRO_KEY = 'agent-lab:playground-intro-dismissed'

interface Draft { id?: string; name: string; graph: LabGraph }

function loadDraft(): Draft {
  try {
    const raw = localRepository.getItem(DRAFT_KEY) as string | null
    if (raw) return JSON.parse(raw)
  } catch { /* fall through */ }
  return { name: 'Attrition investigation', graph: attritionPipeline() }
}

export default function Playground() {
  const [draft, setDraft] = useState<Draft>(loadDraft)
  const [tab, setTab] = useState<PanelTab>('simulate')
  const [rev, setRev] = useState(0)
  const [openTemplates, setOpenTemplates] = useState(false)
  const [openLibrary, setOpenLibrary] = useState(false)
  const [confirmClear, setConfirmClear] = useState(false)
  const [showIntro, setShowIntro] = useState(() => localRepository.getItem(INTRO_KEY) !== '1')
  const architectures = useProgress((s) => s.architectures)
  const saveArchitecture = useProgress((s) => s.saveArchitecture)
  const deleteArchitecture = useProgress((s) => s.deleteArchitecture)
  const pushToast = useUi((s) => s.pushToast)
  const palette = useMemo(() => FULL_PALETTE.flatMap((g) => g.items), [])

  useEffect(() => {
    const t = setTimeout(() => localRepository.setItem(DRAFT_KEY, JSON.stringify(draft)), 300)
    return () => clearTimeout(t)
  }, [draft])

  const save = () => {
    const id = saveArchitecture({ id: draft.id?.startsWith('challenge:') ? undefined : draft.id, name: draft.name || 'Untitled system', graph: draft.graph })
    setDraft((d) => ({ ...d, id }))
    pushToast({ kind: 'info', title: 'Architecture saved', detail: draft.name, icon: 'save' })
  }

  const load = (d: Draft) => {
    setDraft(JSON.parse(JSON.stringify(d)))
    setRev((r) => r + 1)
    setOpenTemplates(false)
    setOpenLibrary(false)
  }

  return (
    <div className="flex min-h-[calc(100vh-7rem)] flex-col px-3 pt-4 sm:px-5 lg:h-screen lg:min-h-0 lg:pt-5">
      {/* Toolbar */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <div className="mr-auto flex min-w-0 items-center gap-3">
          <span className="hidden h-10 w-10 items-center justify-center rounded-xl bg-gradient-brand text-white sm:flex"><Icon name="workflow" size={20} /></span>
          <div className="min-w-0">
            <div className="text-[10.5px] font-bold uppercase tracking-[0.16em] text-accent">Agent Playground</div>
            <input
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              className="w-full min-w-0 bg-transparent font-display text-lg font-semibold outline-none focus:underline sm:w-72"
              aria-label="Architecture name"
            />
          </div>
        </div>
        <Button variant="secondary" size="sm" icon="layout-grid" onClick={() => setOpenTemplates(true)}>Templates</Button>
        <Button variant="secondary" size="sm" icon="folder" onClick={() => setOpenLibrary(true)}>My designs{architectures.length ? ` (${architectures.length})` : ''}</Button>
        <Button variant="secondary" size="sm" icon="trash" onClick={() => setConfirmClear(true)}>Clear</Button>
        <Button size="sm" icon="save" onClick={save}>Save</Button>
      </div>

      {showIntro && (
        <div className="mb-3 flex flex-col gap-3 rounded-2xl border border-accent/30 bg-accent-soft p-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2 text-sm font-bold"><Icon name="target" size={16} className="text-accent" /> Objective</div>
          <ol className="flex flex-1 flex-wrap gap-x-5 gap-y-1 text-[13px]">
            <li><span className="font-bold text-accent">1.</span> Build a system from components on the left</li>
            <li><span className="font-bold text-accent">2.</span> Press <span className="font-semibold">Run simulation</span> and watch it execute</li>
            <li><span className="font-bold text-accent">3.</span> Inject a fault — does your design catch it?</li>
            <li><span className="font-bold text-accent">4.</span> Check the <span className="font-semibold">Review</span> score</li>
          </ol>
          <button onClick={() => { setShowIntro(false); localRepository.setItem(INTRO_KEY, '1') }} className="self-end rounded-lg p-1 text-muted hover:text-fg sm:self-auto" aria-label="Dismiss objective">
            <Icon name="x" size={16} />
          </button>
        </div>
      )}

      <Workbench
        key={rev}
        graph={draft.graph}
        onChange={(graph) => setDraft((d) => ({ ...d, graph }))}
        palette={palette}
        tabs={['simulate', 'inspect', 'review']}
        tab={tab}
        onTabChange={setTab}
        className="min-h-0 flex-1 pb-4 lg:pb-5"
        canvasClassName="h-[60vh] lg:h-auto"
      />

      <Modal open={openTemplates} onClose={() => setOpenTemplates(false)} title="Start from a template" className="max-w-lg">
        <div className="space-y-2">
          {TEMPLATES.map((t) => (
            <button key={t.id} onClick={() => load({ name: t.name, graph: t.build() })} className="flex w-full items-center gap-3 rounded-xl border border-line p-3 text-left transition-colors hover:border-accent/50 hover:bg-surface-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-soft text-accent"><Icon name={t.icon} size={18} /></span>
              <span className="flex-1">
                <span className="block text-sm font-semibold">{t.name}</span>
                <span className="block text-xs text-muted">{t.desc}</span>
              </span>
              <Icon name="chevron-right" size={16} className="text-subtle" />
            </button>
          ))}
          <p className="pt-1 text-xs text-subtle">Loading a template replaces the canvas. Save first if you want to keep your current design.</p>
        </div>
      </Modal>

      <Modal open={openLibrary} onClose={() => setOpenLibrary(false)} title="My designs" className="max-w-lg">
        {architectures.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted">No saved designs yet. Press <span className="font-semibold text-fg">Save</span> to keep one — designs from level challenges also appear here.</p>
        ) : (
          <ul className="max-h-[60vh] space-y-2 overflow-y-auto">
            {architectures.map((a) => (
              <li key={a.id} className={cn('flex items-center gap-3 rounded-xl border p-3', a.id === draft.id ? 'border-accent/50 bg-accent-soft' : 'border-line')}>
                <Icon name={a.id.startsWith('challenge:') ? 'trophy' : 'workflow'} size={18} className="text-accent" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold">{a.name}</div>
                  <div className="text-[11px] text-subtle">{a.graph.nodes.length} nodes · {new Date(a.updatedAt).toLocaleDateString()}</div>
                </div>
                <Button size="sm" variant="secondary" onClick={() => load({ id: a.id, name: a.name, graph: a.graph })}>Open</Button>
                <button onClick={() => deleteArchitecture(a.id)} className="rounded-lg p-1.5 text-subtle hover:bg-bad-soft hover:text-bad" aria-label={`Delete ${a.name}`}><Icon name="trash" size={15} /></button>
              </li>
            ))}
          </ul>
        )}
      </Modal>

      <Modal open={confirmClear} onClose={() => setConfirmClear(false)} title="Clear the canvas?">
        <p className="text-sm text-muted">This removes everything except a request and an output. Saved designs aren’t affected.</p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setConfirmClear(false)}>Cancel</Button>
          <Button variant="danger" icon="trash" onClick={() => { load({ name: 'Untitled system', graph: TEMPLATES[2].build() }); setConfirmClear(false) }}>Clear canvas</Button>
        </div>
      </Modal>
    </div>
  )
}
