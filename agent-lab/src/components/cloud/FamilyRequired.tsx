import type { ReactNode } from 'react'
import { useAuth } from '@/cloud/auth'
import { cloudEnabled } from '@/cloud/client'
import { Icon } from '@/components/ui/Icon'
import { Button, ButtonLink } from '@/components/ui/primitives'

/** Shows children only for signed-in users who belong to a family. */
export function FamilyRequired({ children, what }: { children: ReactNode; what: string }) {
  const session = useAuth((s) => s.session)
  const family = useAuth((s) => s.family)
  if (!cloudEnabled) return <Notice icon="info" text={`${what} needs an online Agent Lab. This copy runs offline only.`} />
  if (!session)
    return (
      <Notice icon="user" text={`Sign in to use ${what.toLowerCase()} with your family.`}>
        <Button
          icon="send"
          onClick={() => {
            try {
              localStorage.removeItem('agent-lab:guest')
            } catch { /* ignore */ }
            window.location.reload()
          }}
        >
          Sign in
        </Button>
      </Notice>
    )
  if (!family)
    return (
      <Notice icon="users" text={`Create or join a family to use ${what.toLowerCase()}.`}>
        <ButtonLink to="/family" icon="users">Set up your family</ButtonLink>
      </Notice>
    )
  return <>{children}</>
}

function Notice({ icon, text, children }: { icon: string; text: string; children?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-line p-8 text-center">
      <Icon name={icon} size={26} className="text-accent" />
      <p className="max-w-sm text-sm text-muted">{text}</p>
      {children}
    </div>
  )
}
