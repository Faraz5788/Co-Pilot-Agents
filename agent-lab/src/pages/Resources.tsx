import { useState } from 'react'
import { GLOSSARY, HUB_HOME, RESOURCES } from '@/content/resources'
import { Icon } from '@/components/ui/Icon'
import { Card, IconTile, SectionTitle } from '@/components/ui/primitives'
import { Page, PageHeader } from '@/components/layout/Page'

export default function Resources() {
  const [q, setQ] = useState('')
  const terms = GLOSSARY.filter((g) => (g.term + g.def).toLowerCase().includes(q.toLowerCase()))
  return (
    <Page>
      <PageHeader
        eyebrow="Resources"
        title="Go deeper with the Copilot Learning Hub"
        subtitle="Agent Lab builds the instinct. The GitHub Copilot Learning Hub has the detail. Each link below matches a level in your path."
        action={
          <a href={HUB_HOME} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-line bg-surface px-4 py-2.5 text-sm font-semibold hover:border-accent/50">
            <Icon name="book-open" size={16} className="text-accent" /> Open Learning Hub <Icon name="external-link" size={14} className="text-subtle" />
          </a>
        }
      />
      <div className="mb-12 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {RESOURCES.map((r) => (
          <a key={r.link.href} href={r.link.href} target="_blank" rel="noreferrer" className="group flex flex-col rounded-2xl border border-line bg-surface p-5 transition-all hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-card">
            <div className="mb-3 flex items-center gap-3">
              <IconTile icon={r.icon} tone="accent" />
              <div>
                <div className="text-[10.5px] font-bold uppercase tracking-wider text-subtle">{r.topic}</div>
                <div className="font-display font-semibold leading-tight">{r.link.label}</div>
              </div>
            </div>
            <p className="flex-1 text-[13px] text-muted">{r.summary}</p>
            <div className="mt-4 flex items-center justify-between text-[11.5px]">
              <span className="text-subtle">Pairs with: <span className="font-semibold text-fg">{r.relatesTo}</span></span>
              <Icon name="external-link" size={14} className="text-subtle group-hover:text-accent" />
            </div>
          </a>
        ))}
      </div>

      <SectionTitle eyebrow="Quick reference" title="Glossary" action={
        <label className="relative">
          <Icon name="search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-subtle" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search terms" className="h-9 w-44 rounded-xl border border-line bg-surface pl-9 pr-3 text-sm outline-none focus:border-accent sm:w-56" aria-label="Search glossary" />
        </label>
      } />
      <Card className="divide-y divide-line">
        {terms.map((t) => (
          <div key={t.term} className="grid gap-1 p-4 sm:grid-cols-[180px_1fr] sm:gap-4">
            <dt className="font-display font-semibold">{t.term}</dt>
            <dd className="text-sm text-muted">{t.def}</dd>
          </div>
        ))}
        {terms.length === 0 && <p className="p-6 text-center text-sm text-muted">No terms match “{q}”.</p>}
      </Card>
      <p className="mt-6 text-xs text-subtle">Summaries on this page are written for Agent Lab. Follow the links for the original Learning Hub articles.</p>
    </Page>
  )
}
