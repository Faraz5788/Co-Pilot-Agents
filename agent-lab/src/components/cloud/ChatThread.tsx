import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { useAuth } from '@/cloud/auth'
import { useFamilyMembers, useMessages } from '@/cloud/hooks'
import { cn } from '@/lib/cn'
import { Icon } from '@/components/ui/Icon'
import { Button } from '@/components/ui/primitives'
import { Avatar } from './Avatar'

function when(iso: string) {
  const d = new Date(iso)
  const today = new Date().toDateString() === d.toDateString()
  return today ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : d.toLocaleDateString([], { day: 'numeric', month: 'short' }) + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export function ChatThread({ channel, placeholder, compact }: { channel: string; placeholder?: string; compact?: boolean }) {
  const uid = useAuth((s) => s.session?.user.id)
  const { members } = useFamilyMembers()
  const { messages, loading, send, setAnswered, remove } = useMessages(channel)
  const [body, setBody] = useState('')
  const [question, setQuestion] = useState(false)
  const [filter, setFilter] = useState<'all' | 'open'>('all')
  const [error, setError] = useState<string | null>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const who = useMemo(() => new Map(members.map((m) => [m.id, m])), [members])
  const shown = filter === 'open' ? messages.filter((m) => m.is_question && !m.answered) : messages
  const openCount = messages.filter((m) => m.is_question && !m.answered).length

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight })
  }, [shown.length])

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const text = body.trim()
    if (!text) return
    setError(null)
    setBody('')
    try {
      await send(text, question)
      setQuestion(false)
    } catch {
      setBody(text)
      setError('Message not sent. Check your connection and try again.')
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="mb-2 flex items-center gap-1 text-xs">
        {(['all', 'open'] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={cn('rounded-lg px-2.5 py-1 font-semibold', filter === f ? 'bg-accent-soft text-fg' : 'text-muted hover:text-fg')}>
            {f === 'all' ? 'All messages' : `Open questions${openCount ? ` (${openCount})` : ''}`}
          </button>
        ))}
      </div>
      <div ref={listRef} className={cn('min-h-0 flex-1 space-y-3 overflow-y-auto rounded-2xl border border-line bg-surface-2/40 p-3 scrollbar-thin', compact ? 'max-h-80' : '')} aria-live="polite">
        {loading && <p className="py-6 text-center text-sm text-muted">Loading messages…</p>}
        {!loading && shown.length === 0 && (
          <div className="py-8 text-center text-sm text-muted">
            <Icon name="message-square" size={24} className="mx-auto mb-2 text-accent" />
            {filter === 'open' ? 'No open questions. Nice!' : 'No messages yet — say hello or ask a question.'}
          </div>
        )}
        {shown.map((m) => {
          const author = who.get(m.user_id)
          const mine = m.user_id === uid
          return (
            <div key={m.id} className={cn('group flex gap-2.5', mine && 'flex-row-reverse')}>
              <Avatar name={author?.display_name ?? '?'} color={author?.avatar_color} size={30} />
              <div className={cn('max-w-[80%] min-w-0', mine && 'items-end text-right')}>
                <div className="mb-0.5 text-[11px] text-subtle">
                  <span className="font-semibold text-muted">{mine ? 'You' : author?.display_name ?? 'Former member'}</span> · {when(m.created_at)}
                </div>
                <div className={cn('inline-block whitespace-pre-wrap break-words rounded-2xl px-3 py-2 text-left text-sm', mine ? 'bg-accent text-white' : 'border border-line bg-surface', m.is_question && !mine && 'border-warn/50')}>
                  {m.is_question && (
                    <span className={cn('mb-1 flex items-center gap-1 text-[10.5px] font-bold uppercase tracking-wide', mine ? 'text-white/80' : m.answered ? 'text-ok' : 'text-warn')}>
                      <Icon name={m.answered ? 'check-circle' : 'lightbulb'} size={11} /> {m.answered ? 'Answered question' : 'Question'}
                    </span>
                  )}
                  {m.body}
                </div>
                <div className={cn('mt-1 flex gap-2 text-[11px] opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100', mine && 'justify-end')}>
                  {m.is_question && (
                    <button className="font-semibold text-accent hover:underline" onClick={() => setAnswered(m.id, !m.answered)}>
                      {m.answered ? 'Reopen' : 'Mark answered'}
                    </button>
                  )}
                  {mine && <button className="text-subtle hover:text-bad" onClick={() => remove(m.id)}>Delete</button>}
                </div>
              </div>
            </div>
          )
        })}
      </div>
      <form onSubmit={submit} className="mt-3 space-y-2">
        {error && <p className="text-xs text-bad" role="alert">{error}</p>}
        <div className="flex items-end gap-2">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                e.currentTarget.form?.requestSubmit()
              }
            }}
            rows={compact ? 1 : 2}
            maxLength={2000}
            placeholder={placeholder ?? 'Write a message…'}
            aria-label="Message"
            className="min-h-[44px] flex-1 resize-none rounded-xl border border-line bg-surface px-3 py-2.5 text-sm outline-none focus:border-accent"
          />
          <Button type="submit" icon="send" disabled={!body.trim()} aria-label="Send message" className="h-11" />
        </div>
        <label className="flex w-fit cursor-pointer items-center gap-2 text-xs text-muted">
          <input type="checkbox" checked={question} onChange={(e) => setQuestion(e.target.checked)} className="h-3.5 w-3.5 accent-[var(--accent)]" />
          <Icon name="lightbulb" size={13} className="text-warn" /> Mark as a question
        </label>
      </form>
    </div>
  )
}
