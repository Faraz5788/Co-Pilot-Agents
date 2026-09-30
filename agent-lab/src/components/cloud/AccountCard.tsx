import { useEffect, useState } from 'react'
import { useAuth } from '@/cloud/auth'
import { AVATAR_COLORS, cloudEnabled } from '@/cloud/client'
import { onSyncStatus, type SyncStatus } from '@/cloud/sync'
import { cn } from '@/lib/cn'
import { useProgress } from '@/state/progress'
import { Icon } from '@/components/ui/Icon'
import { Button, Card } from '@/components/ui/primitives'

const STATUS: Record<SyncStatus, { text: string; cls: string; icon: string }> = {
  off: { text: 'Not syncing', cls: 'text-subtle', icon: 'circle' },
  syncing: { text: 'Saving…', cls: 'text-accent-2', icon: 'repeat' },
  saved: { text: 'Saved to the cloud', cls: 'text-ok', icon: 'check-circle' },
  error: { text: 'Couldn’t save — will retry on your next change', cls: 'text-warn', icon: 'alert-triangle' },
}

export function useSyncStatus() {
  const [s, setS] = useState<SyncStatus>('off')
  useEffect(() => {
    const off = onSyncStatus(setS)
    return () => {
      off()
    }
  }, [])
  return s
}

export function AccountCard() {
  const { session, profile, family, signOut, updateProfile } = useAuth()
  const setName = useProgress((s) => s.setName)
  const status = useSyncStatus()
  const [name, setLocalName] = useState(profile?.display_name ?? '')
  useEffect(() => setLocalName(profile?.display_name ?? ''), [profile?.display_name])
  if (!cloudEnabled) return null

  if (!session)
    return (
      <Card className="mb-10 flex flex-col gap-3 p-5 sm:flex-row sm:items-center">
        <Icon name="user" size={22} className="text-accent" />
        <p className="flex-1 text-sm text-muted">You’re using Agent Lab without an account, so progress lives only in this browser. Sign in to save it and join your family.</p>
        <Button icon="send" onClick={() => { try { localStorage.removeItem('agent-lab:guest') } catch { /* ignore */ } window.location.reload() }}>Sign in</Button>
      </Card>
    )

  const st = STATUS[status]
  const saveName = async () => {
    const n = name.trim()
    if (!n || n === profile?.display_name) return
    await updateProfile({ display_name: n })
    setName(n)
  }

  return (
    <Card className="mb-10 p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="flex-1 space-y-3">
          <label className="block">
            <span className="text-[11px] font-bold uppercase tracking-wider text-subtle">Name your family sees</span>
            <input value={name} onChange={(e) => setLocalName(e.target.value.slice(0, 40))} onBlur={saveName} onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()} className="mt-1 block w-full max-w-sm rounded-xl border border-line bg-surface-2 px-3 py-2 font-display text-lg font-semibold outline-none focus:border-accent" />
          </label>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-subtle">Avatar colour</span>
            <div className="mt-1.5 flex gap-2">
              {Object.entries(AVATAR_COLORS).map(([k, grad]) => (
                <button key={k} onClick={() => updateProfile({ avatar_color: k })} aria-label={`${k} avatar`} aria-pressed={profile?.avatar_color === k}
                  className={cn('h-8 w-8 rounded-full bg-gradient-to-br', grad, profile?.avatar_color === k && 'ring-2 ring-accent ring-offset-2 ring-offset-[var(--surface)]')} />
              ))}
            </div>
          </div>
        </div>
        <div className="space-y-1.5 text-sm sm:text-right">
          <div className="text-muted">{session.user.email}</div>
          <div className="text-muted">{family ? <>Family: <span className="font-semibold text-fg">{family.name}</span></> : 'Not in a family yet'}</div>
          <div className={cn('flex items-center gap-1.5 sm:justify-end', st.cls)}><Icon name={st.icon} size={14} /> {st.text}</div>
          <Button variant="secondary" size="sm" icon="arrow-left" onClick={signOut} className="mt-2">Sign out</Button>
        </div>
      </div>
    </Card>
  )
}
