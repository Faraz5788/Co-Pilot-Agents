import { Link } from 'react-router-dom'
import { useAuth } from '@/cloud/auth'
import { useFamilyMembers, usePresence } from '@/cloud/hooks'
import { fmt } from '@/lib/cn'
import { Card, SectionTitle } from '@/components/ui/primitives'
import { Avatar } from './Avatar'

/** Compact family leaderboard for the dashboard. */
export function FamilySnapshot() {
  const family = useAuth((s) => s.family)
  const uid = useAuth((s) => s.session?.user.id)
  const { members } = useFamilyMembers()
  const online = usePresence()
  if (!family || members.length === 0) return null
  return (
    <section className="mb-10">
      <SectionTitle eyebrow={family.name} title="Family leaderboard" action={<Link to="/family" className="text-sm font-semibold text-accent hover:underline">Family →</Link>} />
      <Card className="flex gap-3 overflow-x-auto p-4 scrollbar-thin">
        {members.slice(0, 8).map((m, i) => (
          <Link key={m.id} to="/family" className="flex w-28 shrink-0 flex-col items-center gap-1.5 rounded-xl p-2 text-center hover:bg-surface-2">
            <Avatar name={m.display_name} color={m.avatar_color} size={44} online={online.has(m.id)} />
            <span className="w-full truncate text-sm font-semibold">{i === 0 ? '👑 ' : ''}{m.id === uid ? 'You' : m.display_name}</span>
            <span className="text-[11px] text-muted">Lvl {m.progress?.current_level ?? 1} · {fmt(m.progress?.xp ?? 0)} XP</span>
          </Link>
        ))}
      </Card>
    </section>
  )
}
