import { useEffect, useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/cloud/auth'
import { useActivityFeed, useFamilyMembers, usePresence } from '@/cloud/hooks'
import { LEVELS } from '@/content/course'
import { cn, fmt } from '@/lib/cn'
import { useUi } from '@/state/ui'
import { Icon } from '@/components/ui/Icon'
import { Button, Card, ProgressBar, SectionTitle } from '@/components/ui/primitives'
import { Modal } from '@/components/ui/Modal'
import { Avatar } from '@/components/cloud/Avatar'
import { FamilyRequired } from '@/components/cloud/FamilyRequired'
import { Page, PageHeader } from '@/components/layout/Page'

function ago(iso: string) {
  const s = (Date.now() - new Date(iso).getTime()) / 1000
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return `${Math.floor(s / 86400)}d ago`
}

function Setup() {
  const [params] = useSearchParams()
  const createFamily = useAuth((s) => s.createFamily)
  const joinFamily = useAuth((s) => s.joinFamily)
  const [name, setName] = useState('')
  const [code, setCode] = useState(params.get('join') ?? '')
  const [err, setErr] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const run = async (e: FormEvent, fn: () => Promise<void>) => {
    e.preventDefault()
    setErr(null)
    setBusy(true)
    try {
      await fn()
    } catch (x) {
      setErr(x instanceof Error ? x.message : 'Something went wrong')
    } finally {
      setBusy(false)
    }
  }
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="p-6">
        <Icon name="plus" size={22} className="text-accent" />
        <h2 className="mt-2 font-display text-lg font-semibold">Start a family</h2>
        <p className="mb-4 text-sm text-muted">You’ll get a join code to share with everyone.</p>
        <form onSubmit={(e) => run(e, () => createFamily(name))} className="flex gap-2">
          <input required maxLength={60} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. The Khans" aria-label="Family name" className="min-w-0 flex-1 rounded-xl border border-line bg-surface-2 px-3 py-2 text-sm outline-none focus:border-accent" />
          <Button type="submit" disabled={busy}>Create</Button>
        </form>
      </Card>
      <Card className="p-6">
        <Icon name="key" size={22} className="text-accent" />
        <h2 className="mt-2 font-display text-lg font-semibold">Join a family</h2>
        <p className="mb-4 text-sm text-muted">Enter the 6-character code someone shared with you.</p>
        <form onSubmit={(e) => run(e, () => joinFamily(code))} className="flex gap-2">
          <input required value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} maxLength={6} placeholder="ABC123" aria-label="Join code" className="min-w-0 flex-1 rounded-xl border border-line bg-surface-2 px-3 py-2 font-mono text-sm uppercase tracking-widest outline-none focus:border-accent" />
          <Button type="submit" disabled={busy}>Join</Button>
        </form>
      </Card>
      {err && <p className="rounded-xl bg-bad-soft px-4 py-3 text-sm text-bad md:col-span-2" role="alert">{err}</p>}
    </div>
  )
}

export default function Family() {
  const session = useAuth((s) => s.session)
  const family = useAuth((s) => s.family)
  const uid = session?.user.id
  const leaveFamily = useAuth((s) => s.leaveFamily)
  const pushToast = useUi((s) => s.pushToast)
  const { members, loading } = useFamilyMembers()
  const feed = useActivityFeed()
  const online = usePresence()
  const [confirmLeave, setConfirmLeave] = useState(false)
  const who = new Map(members.map((m) => [m.id, m]))
  const link = family ? `${window.location.origin}${window.location.pathname}#/family?join=${family.join_code}` : ''

  useEffect(() => {
    document.title = family ? `${family.name} · Agent Lab` : 'Family · Agent Lab'
    return () => { document.title = 'Agent Lab' }
  }, [family])

  const copy = async (text: string, what: string) => {
    try {
      await navigator.clipboard.writeText(text)
      pushToast({ kind: 'info', title: `${what} copied`, icon: 'copy' })
    } catch {
      pushToast({ kind: 'error', title: 'Couldn’t copy', detail: text, icon: 'x-circle' })
    }
  }
  const share = async () => {
    const text = `Join our family on Agent Lab and learn how AI agents work: ${link}`
    if (navigator.share) {
      try { await navigator.share({ title: 'Agent Lab', text, url: link }) } catch { /* cancelled */ }
    } else copy(text, 'Invite')
  }

  if (session && !family)
    return (
      <Page>
        <PageHeader eyebrow="Family" title="Learn together" subtitle="Create a family or join one to see each other’s progress, cheer each other on and chat." />
        <Setup />
      </Page>
    )

  return (
    <Page>
      <FamilyRequired what="The family space">
        {family && (
          <>
            <PageHeader
              eyebrow="Family"
              title={family.name}
              subtitle={`${members.length} member${members.length === 1 ? '' : 's'} · ${online.size} online now`}
              action={
                <Card className="flex items-center gap-3 p-3">
                  <div>
                    <div className="text-[10.5px] font-bold uppercase tracking-wider text-subtle">Join code</div>
                    <button onClick={() => copy(family.join_code, 'Join code')} className="font-mono text-xl font-bold tracking-[0.2em] hover:text-accent" aria-label={`Copy join code ${family.join_code}`}>{family.join_code}</button>
                  </div>
                  <Button icon="send" onClick={share}>Invite</Button>
                </Card>
              }
            />

            <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
              <section>
                <SectionTitle eyebrow="Leaderboard" title="Who’s where" action={<Link to="/chat" className="text-sm font-semibold text-accent hover:underline">Open chat →</Link>} />
                <div className="space-y-3">
                  {loading && <Card className="p-6 text-center text-sm text-muted">Loading family…</Card>}
                  {members.map((m, i) => {
                    const p = m.progress
                    const level = LEVELS.find((l) => l.number === (p?.current_level ?? 1)) ?? LEVELS[0]
                    return (
                      <Card key={m.id} className={cn('flex items-center gap-4 p-4', m.id === uid && 'border-accent/40')}>
                        <span className={cn('w-6 text-center font-display text-lg font-bold', i === 0 ? 'text-gold' : 'text-subtle')}>{i + 1}</span>
                        <Avatar name={m.display_name} color={m.avatar_color} size={44} online={online.has(m.id)} />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="truncate font-semibold">{m.display_name}{m.id === uid && <span className="font-normal text-subtle"> (you)</span>}</span>
                            {(p?.streak ?? 0) > 0 && <span className="flex items-center gap-0.5 text-xs font-bold text-warn"><Icon name="flame" size={12} />{p!.streak}</span>}
                          </div>
                          <div className="truncate text-xs text-muted">
                            {(p?.levels_completed ?? 0) === LEVELS.length ? 'Finished the course 🎉' : `Level ${level.number} — ${level.title}`}
                            {p?.updated_at && <> · active {ago(p.updated_at)}</>}
                          </div>
                          <ProgressBar value={(p?.levels_completed ?? 0) / LEVELS.length} className="mt-2 h-1.5" label={`${m.display_name} course progress`} />
                        </div>
                        <div className="hidden text-right sm:block">
                          <div className="font-display text-lg font-bold">{fmt(p?.xp ?? 0)}</div>
                          <div className="text-[11px] text-subtle">XP · {p?.lessons_completed ?? 0} lessons · {p?.badges ?? 0} badges</div>
                        </div>
                      </Card>
                    )
                  })}
                  {!loading && members.length === 1 && (
                    <Card className="border-dashed p-5 text-center text-sm text-muted">
                      It’s just you so far. Tap <span className="font-semibold text-fg">Invite</span> to send the link to your family.
                    </Card>
                  )}
                </div>
              </section>

              <section>
                <SectionTitle eyebrow="Live" title="Family activity" />
                <Card className="p-2">
                  {feed.length === 0 ? (
                    <p className="p-6 text-center text-sm text-muted">Milestones — finished lessons, levels and badges — will appear here as they happen.</p>
                  ) : (
                    <ul>
                      {feed.map((a) => {
                        const m = who.get(a.user_id)
                        return (
                          <li key={a.id} className="flex items-start gap-3 rounded-xl px-2.5 py-2.5 animate-fade-up">
                            <Avatar name={m?.display_name ?? '?'} color={m?.avatar_color} size={28} />
                            <div className="min-w-0 flex-1 text-sm">
                              <span className="font-semibold">{a.user_id === uid ? 'You' : m?.display_name ?? 'Someone'}</span> {a.label}
                              <div className="text-[11px] text-subtle">{ago(a.created_at)}{a.xp ? ` · +${a.xp} XP` : ''}</div>
                            </div>
                            <Icon name={a.kind === 'badge' ? 'award' : a.kind === 'level' ? 'trophy' : 'book-check'} size={16} className={a.kind === 'badge' ? 'text-gold' : 'text-accent'} />
                          </li>
                        )
                      })}
                    </ul>
                  )}
                </Card>
                <button onClick={() => setConfirmLeave(true)} className="mt-4 text-xs text-subtle underline hover:text-bad">Leave this family</button>
              </section>
            </div>

            <Modal open={confirmLeave} onClose={() => setConfirmLeave(false)} title="Leave this family?">
              <p className="text-sm text-muted">You’ll keep your own progress, but you won’t see the family leaderboard or chat. You can rejoin with the code {family.join_code}.</p>
              <div className="mt-5 flex justify-end gap-2">
                <Button variant="secondary" onClick={() => setConfirmLeave(false)}>Cancel</Button>
                <Button variant="danger" onClick={async () => { await leaveFamily(); setConfirmLeave(false) }}>Leave family</Button>
              </div>
            </Modal>
          </>
        )}
      </FamilyRequired>
    </Page>
  )
}
