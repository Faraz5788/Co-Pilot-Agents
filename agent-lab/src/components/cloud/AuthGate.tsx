import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { useAuth, rememberJoinCode } from '@/cloud/auth'
import { cloudEnabled } from '@/cloud/client'
import { Icon } from '@/components/ui/Icon'
import { Button } from '@/components/ui/primitives'
import { Logo } from '@/components/layout/Logo'

function friendly(message: string) {
  if (/not authorized/i.test(message)) return 'Email sending isn’t fully set up yet, so we can’t send a link to this address. Ask the person who runs this Agent Lab to finish the email setup.'
  if (/rate limit/i.test(message)) return 'Too many sign-in emails were sent recently. Please wait a few minutes and try again.'
  if (/invalid/i.test(message) && /email/i.test(message)) return 'That email address doesn’t look right.'
  return message
}

function joinCodeFromUrl() {
  const q = window.location.hash.split('?')[1] ?? ''
  return new URLSearchParams(q).get('join')
}

export function AuthGate({ children }: { children: ReactNode }) {
  const { ready, session, guest, init, sendMagicLink, continueAsGuest } = useAuth()
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [sent, setSent] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const joinCode = joinCodeFromUrl()

  useEffect(() => {
    init()
    if (joinCode) rememberJoinCode(joinCode)
  }, [init, joinCode])

  if (!cloudEnabled || session || guest) return <>{children}</>
  if (!ready)
    return (
      <div className="flex h-screen items-center justify-center text-sm text-muted">
        <span className="mr-2 h-2 w-2 animate-pulse rounded-full bg-accent" /> Loading…
      </div>
    )

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setBusy(true)
    try {
      await sendMagicLink(email, name)
      setSent(true)
    } catch (err) {
      setError(friendly(err instanceof Error ? err.message : 'Something went wrong'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center"><Logo /></div>
        <div className="rounded-3xl border border-line bg-surface p-6 shadow-card sm:p-8">
          {sent ? (
            <div className="text-center animate-fade-up">
              <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-brand text-white"><Icon name="mail" size={26} /></span>
              <h1 className="font-display text-2xl font-bold">Check your email</h1>
              <p className="mt-2 text-sm text-muted">We sent a sign-in link to <span className="font-semibold text-fg">{email}</span>. Open it on this device to continue.</p>
              <p className="mt-4 text-xs text-subtle">Nothing there? Check spam, or <button className="font-semibold text-accent underline" onClick={() => setSent(false)}>try again</button>.</p>
            </div>
          ) : (
            <>
              <h1 className="font-display text-2xl font-bold">{joinCode ? 'You’ve been invited to Agent Lab' : 'Welcome to Agent Lab'}</h1>
              <p className="mt-1.5 text-sm text-muted">
                {joinCode ? <>Sign in to join your family (code <span className="font-mono font-semibold text-fg">{joinCode.toUpperCase()}</span>), track progress together and chat.</> : 'Sign in to save your progress, see your family’s progress and chat together.'}
              </p>
              <form onSubmit={submit} className="mt-6 space-y-3">
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-muted">Your name</span>
                  <input required maxLength={40} value={name} onChange={(e) => setName(e.target.value)} autoComplete="given-name" className="w-full rounded-xl border border-line bg-surface-2 px-3 py-2.5 text-sm outline-none focus:border-accent" placeholder="e.g. Sam" />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-muted">Email</span>
                  <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" className="w-full rounded-xl border border-line bg-surface-2 px-3 py-2.5 text-sm outline-none focus:border-accent" placeholder="you@example.com" />
                </label>
                {error && <p className="rounded-lg bg-bad-soft px-3 py-2 text-sm text-bad" role="alert">{error}</p>}
                <Button type="submit" size="lg" className="w-full" icon="send" disabled={busy}>{busy ? 'Sending…' : 'Email me a sign-in link'}</Button>
              </form>
              <p className="mt-3 text-center text-xs text-subtle">No password needed — we’ll email you a one-tap link.</p>
            </>
          )}
        </div>
        <button onClick={continueAsGuest} className="mx-auto mt-5 block text-sm text-muted underline hover:text-fg">
          Continue without an account (progress stays on this device)
        </button>
      </div>
    </div>
  )
}
