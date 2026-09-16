'use client'

import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { useRouter } from 'next/navigation'
import { FileText, Loader2, Search, Users, type LucideIcon } from 'lucide-react'

import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { globalSearch, type SearchResult } from '@/lib/services/search'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'

export interface SearchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const RESULT_HREF: Record<SearchResult['type'], (id: string) => string> = {
  candidate: (id) => `/candidates/${id}`,
  requisition: (id) => `/requisitions/${id}`,
}

const GROUP_LABEL: Record<SearchResult['type'], string> = {
  candidate: 'Candidates',
  requisition: 'Requisitions',
}

const GROUP_ICON: Record<SearchResult['type'], LucideIcon> = {
  candidate: Users,
  requisition: FileText,
}

const GROUP_ORDER: SearchResult['type'][] = ['candidate', 'requisition']

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)

  /** Closes the dialog and clears transient search state. */
  function closeDialog() {
    onOpenChange(false)
    setQuery('')
    setResults([])
    setActiveIndex(0)
  }

  function handleDialogOpenChange(next: boolean) {
    if (next) {
      onOpenChange(true)
    } else {
      closeDialog()
    }
  }

  // Global Ctrl/Cmd+K shortcut, active regardless of where focus is.
  useEffect(() => {
    function handleGlobalKeyDown(event: globalThis.KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        if (open) {
          closeDialog()
        } else {
          onOpenChange(true)
        }
      }
    }
    window.addEventListener('keydown', handleGlobalKeyDown)
    return () => window.removeEventListener('keydown', handleGlobalKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- closeDialog/onOpenChange are stable for the lifetime of this effect's subscription.
  }, [open])

  // Debounced live search. All state updates happen inside the timer
  // callback so the effect body itself stays a pure subscribe/cleanup pair.
  useEffect(() => {
    if (!open) return

    const trimmed = query.trim()
    let cancelled = false

    const timer = setTimeout(async () => {
      if (cancelled) return

      if (trimmed.length < 2) {
        setResults([])
        setActiveIndex(0)
        setLoading(false)
        return
      }

      setLoading(true)
      try {
        const supabase = createClient()
        const data = await globalSearch(supabase, trimmed, 8)
        if (!cancelled) {
          setResults(data)
          setActiveIndex(0)
        }
      } catch {
        if (!cancelled) {
          setResults([])
          setActiveIndex(0)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }, 250)

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [query, open])

  function navigateTo(result: SearchResult) {
    closeDialog()
    router.push(RESULT_HREF[result.type](result.id))
  }

  function handleInputKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (results.length === 0) return

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex((index) => (index + 1) % results.length)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((index) => (index - 1 + results.length) % results.length)
    } else if (event.key === 'Enter') {
      event.preventDefault()
      const result = results[activeIndex]
      if (result) navigateTo(result)
    }
  }

  // Results already arrive grouped by type (candidates, then requisitions),
  // so the grouped view and the flat `results` array share the same order —
  // `results.indexOf` below is enough to keep keyboard nav in sync.
  const grouped = GROUP_ORDER.map((type) => ({
    type,
    items: results.filter((result) => result.type === type),
  })).filter((group) => group.items.length > 0)

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent
        className="max-w-xl gap-0 p-0"
        onOpenAutoFocus={(event) => {
          event.preventDefault()
          inputRef.current?.focus()
        }}
      >
        <DialogTitle className="sr-only">Search</DialogTitle>

        <div className="flex items-center gap-2 border-b border-border px-4">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder="Search candidates, requisitions..."
            className="h-12 w-full border-0 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          {loading && <Loader2 className="h-4 w-4 shrink-0 animate-spin text-muted-foreground" />}
        </div>

        <div className="max-h-80 overflow-y-auto p-2">
          {query.trim().length < 2 && (
            <p className="px-2 py-8 text-center text-sm text-muted-foreground">
              Type at least 2 characters to search.
            </p>
          )}

          {query.trim().length >= 2 && !loading && results.length === 0 && (
            <p className="px-2 py-8 text-center text-sm text-muted-foreground">
              No results for &ldquo;{query}&rdquo;.
            </p>
          )}

          {query.trim().length >= 2 &&
            grouped.map((group) => {
              const Icon = GROUP_ICON[group.type]
              return (
                <div key={group.type} className="mb-2 last:mb-0">
                  <p className="px-2 py-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {GROUP_LABEL[group.type]}
                  </p>
                  {group.items.map((result) => {
                    const index = results.indexOf(result)
                    const isActive = index === activeIndex
                    return (
                      <button
                        key={`${result.type}-${result.id}`}
                        type="button"
                        onMouseEnter={() => setActiveIndex(index)}
                        onClick={() => navigateTo(result)}
                        className={cn(
                          'flex w-full items-center gap-3 rounded-md px-2 py-2 text-left text-sm transition-colors',
                          isActive ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/60'
                        )}
                      >
                        <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <span className="flex min-w-0 flex-1 flex-col">
                          <span className="truncate font-medium">{result.title}</span>
                          <span className="truncate text-xs text-muted-foreground">{result.subtitle}</span>
                        </span>
                        {result.status && (
                          <span className="shrink-0 rounded border border-border px-1.5 py-0.5 text-[10px] uppercase text-muted-foreground">
                            {result.status}
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              )
            })}
        </div>

        <div className="flex items-center justify-between border-t border-border px-4 py-2 text-xs text-muted-foreground">
          <span>&uarr;&darr; to navigate &middot; Enter to select &middot; Esc to close</span>
        </div>
      </DialogContent>
    </Dialog>
  )
}
