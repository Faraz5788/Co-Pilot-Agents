import { useAuth } from '@/cloud/auth'
import { ChatThread } from '@/components/cloud/ChatThread'
import { FamilyRequired } from '@/components/cloud/FamilyRequired'
import { Page, PageHeader } from '@/components/layout/Page'

export default function Chat() {
  const family = useAuth((s) => s.family)
  return (
    <Page className="flex h-[calc(100vh-8.5rem)] flex-col lg:h-screen lg:pb-8">
      <PageHeader eyebrow="Family chat" title={family ? `${family.name} chat` : 'Family chat'} subtitle="Talk, share wins and ask questions. Tick “Mark as a question” so it shows up in Open questions until someone answers." />
      <div className="min-h-0 flex-1">
        <FamilyRequired what="Chat">
          <ChatThread channel="family" placeholder="Message your family…" />
        </FamilyRequired>
      </div>
    </Page>
  )
}
