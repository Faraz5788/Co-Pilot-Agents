import { useAuth } from '@/cloud/auth'
import { useMessages } from '@/cloud/hooks'
import { Icon } from '@/components/ui/Icon'
import { ChatThread } from './ChatThread'

/** Family discussion thread attached to one lesson. Hidden when not in a family. */
export function LessonDiscussion({ lessonId, title }: { lessonId: string; title: string }) {
  const family = useAuth((s) => s.family)
  if (!family) return null
  return <Inner lessonId={lessonId} title={title} />
}

function Inner({ lessonId, title }: { lessonId: string; title: string }) {
  const channel = `lesson:${lessonId}`
  const { messages } = useMessages(channel)
  const open = messages.filter((m) => m.is_question && !m.answered).length
  return (
    <details className="group mt-8 rounded-2xl border border-line bg-surface">
      <summary className="flex cursor-pointer list-none items-center gap-2 p-4 text-sm font-semibold">
        <Icon name="message-square" size={16} className="text-accent" />
        Discuss “{title}” with your family
        <span className="text-xs font-normal text-muted">
          {messages.length ? `· ${messages.length} message${messages.length === 1 ? '' : 's'}` : '· ask a question'}
          {open ? ` · ${open} open question${open === 1 ? '' : 's'}` : ''}
        </span>
        <Icon name="chevron-down" size={16} className="ml-auto text-subtle transition-transform group-open:rotate-180" />
      </summary>
      <div className="border-t border-line p-4">
        <ChatThread channel={channel} compact placeholder="Ask about this lesson, or help someone out…" />
      </div>
    </details>
  )
}
