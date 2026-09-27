import { useNavigate } from 'react-router-dom'
import { GOALS, GUARDRAILS, INSTRUCTIONS, ROLES, SKILLS, TOOLS, byId } from '@/content/catalog'
import { rankFor } from '@/content/xp'
import { fmt } from '@/lib/cn'
import { missionsCompleted, useProgress } from '@/state/progress'
import { localRepository } from '@/state/storage'
import { Icon } from '@/components/ui/Icon'
import { Button, ButtonLink, Card, IconTile, SectionTitle } from '@/components/ui/primitives'
import { Page, PageHeader } from '@/components/layout/Page'

export default function Profile() {
  const s = useProgress()
  const setName = useProgress((x) => x.setName)
  const navigate = useNavigate()
  const rank = rankFor(s.xp)
  const initials = (s.learnerName || 'Agent Learner').split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase()

  const openInPlayground = (a: (typeof s.architectures)[number]) => {
    localRepository.setItem('agent-lab:playground-draft', JSON.stringify({ id: a.id, name: a.name, graph: a.graph }))
    navigate('/playground')
  }

  return (
    <Page>
      <PageHeader eyebrow="Profile" title="Your lab" subtitle="Everything you’ve built lives here: agents, skills and system designs." />
      <Card className="mb-10 flex flex-col gap-5 p-5 sm:flex-row sm:items-center">
        <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-gradient-brand font-display text-2xl font-bold text-white">{initials}</span>
        <div className="flex-1">
          <label className="block">
            <span className="text-[11px] font-bold uppercase tracking-wider text-subtle">Display name</span>
            <input value={s.learnerName} onChange={(e) => setName(e.target.value.slice(0, 40))} placeholder="Add your name" className="mt-1 block w-full max-w-sm rounded-xl border border-line bg-surface-2 px-3 py-2 font-display text-lg font-semibold outline-none focus:border-accent" />
          </label>
          <div className="mt-2 text-sm text-muted">{rank.title} · {fmt(s.xp)} XP · {missionsCompleted(s)} missions · {Object.keys(s.badges).length} badges</div>
        </div>
      </Card>

      <SectionTitle eyebrow="Agents" title="Agents you’ve built" />
      {s.agents.length === 0 ? (
        <Card className="mb-10 p-6 text-center text-sm text-muted">Build your first agent in <span className="font-semibold text-fg">Level 2</span>. <ButtonLink to="/level/l2" size="sm" variant="secondary" className="ml-2">Go</ButtonLink></Card>
      ) : (
        <div className="mb-10 grid gap-3 md:grid-cols-2">
          {s.agents.map((a) => (
            <Card key={a.id} className="overflow-hidden">
              <div className="flex items-center gap-2 bg-gradient-brand px-4 py-2.5 text-white"><Icon name="bot" size={16} /><span className="font-display font-semibold">{a.name}</span></div>
              <dl className="space-y-1.5 p-4 text-[13px]">
                {[
                  ['Role', byId(ROLES, a.role)?.label],
                  ['Goal', byId(GOALS, a.goal)?.label],
                  ['Rules', a.instructions.map((i) => byId(INSTRUCTIONS, i)?.label).join(' · ')],
                  ['Tools', a.tools.map((i) => byId(TOOLS, i)?.name).join(', ')],
                  ['Skills', a.skills.map((i) => byId(SKILLS, i)?.name).join(', ')],
                  ['Guardrails', a.guardrails.map((i) => byId(GUARDRAILS, i)?.label).join(' · ')],
                ].map(([k, v]) => (
                  <div key={k} className="flex gap-3"><dt className="w-20 shrink-0 font-semibold text-subtle">{k}</dt><dd className={v ? '' : 'italic text-subtle'}>{v || 'none'}</dd></div>
                ))}
              </dl>
            </Card>
          ))}
        </div>
      )}

      <SectionTitle eyebrow="Skills" title="Skill library" />
      {s.skills.length === 0 ? (
        <Card className="mb-10 p-6 text-center text-sm text-muted">Build reusable skills in <span className="font-semibold text-fg">Level 3</span>.</Card>
      ) : (
        <div className="mb-10 grid gap-3 md:grid-cols-3">
          {s.skills.map((sk) => (
            <Card key={sk.id} className="p-4">
              <div className="mb-2 flex items-center gap-2"><IconTile icon={byId(SKILLS, sk.id)?.icon ?? 'sparkles'} tone="warn" size="sm" /><span className="font-display font-semibold">{sk.name}</span></div>
              <p className="mb-2 text-[12px] text-muted"><span className="font-semibold text-fg">Use when:</span> {sk.useWhen}</p>
              <ol className="list-decimal space-y-0.5 pl-4 text-[12px]">{sk.steps.map((st) => <li key={st}>{st}</li>)}</ol>
              <p className="mt-2 text-[12px] text-muted"><span className="font-semibold text-fg">Returns:</span> {sk.output}</p>
            </Card>
          ))}
        </div>
      )}

      <SectionTitle eyebrow="Systems" title="Saved architectures" />
      {s.architectures.length === 0 ? (
        <Card className="p-6 text-center text-sm text-muted">Save a design from the Agent Playground and it will appear here.</Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {s.architectures.map((a) => (
            <Card key={a.id} className="flex items-center gap-3 p-4">
              <IconTile icon={a.id.startsWith('challenge:') ? 'trophy' : 'workflow'} tone="cyan" />
              <div className="min-w-0 flex-1">
                <div className="truncate font-semibold">{a.name}</div>
                <div className="text-[11.5px] text-subtle">{a.graph.nodes.length} nodes · {a.graph.edges.length} connections</div>
              </div>
              <Button size="sm" variant="secondary" onClick={() => openInPlayground(a)} iconRight="arrow-right">Open</Button>
            </Card>
          ))}
        </div>
      )}
    </Page>
  )
}
