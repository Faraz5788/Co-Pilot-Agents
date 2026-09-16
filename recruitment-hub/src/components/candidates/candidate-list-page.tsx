'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plus, Search, ChevronLeft, ChevronRight, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CandidateSource {
  id: string
  name: string
}

interface CandidateListApplication {
  id: string
  application_status: string
  requisition: { id: string; title: string; reference_number: string } | null
}

export interface CandidateListRow {
  id: string
  candidate_number: string
  first_name: string
  last_name: string
  preferred_name: string | null
  email: string
  phone: string | null
  location: string | null
  current_employer: string | null
  current_job_title: string | null
  created_at: string
  source: CandidateSource | null
  applications: CandidateListApplication[] | null
}

export interface CandidatesResult {
  data: CandidateListRow[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface AdminSource {
  id: string
  name: string
  category: string | null
}

interface CandidateListPageProps {
  initialData: CandidatesResult
  sources: AdminSource[]
  initialSearch: string
  initialSourceId: string
}

const inputClass =
  'w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
const primaryButtonClass =
  'inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
const secondaryButtonClass =
  'inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50'

function formatDate(value: string) {
  try {
    return new Date(value).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return value
  }
}

export function CandidateListPage({
  initialData,
  sources,
  initialSearch,
  initialSourceId,
}: CandidateListPageProps) {
  const router = useRouter()
  const [search, setSearch] = useState(initialSearch)
  const [sourceId, setSourceId] = useState(initialSourceId)
  const isFirstRender = useRef(true)

  const navigate = useCallback(
    (next: { search?: string; source?: string; page?: number }) => {
      const query = new URLSearchParams()
      const nextSearch = next.search ?? search
      const nextSource = next.source ?? sourceId
      if (nextSearch) query.set('search', nextSearch)
      if (nextSource) query.set('source', nextSource)
      if (next.page && next.page > 1) query.set('page', String(next.page))
      const qs = query.toString()
      router.push(qs ? `/candidates?${qs}` : '/candidates')
    },
    [router, search, sourceId]
  )

  // Debounce search input so we don't navigate on every keystroke.
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    const timeout = setTimeout(() => {
      navigate({ search, page: 1 })
    }, 400)
    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  function handleSourceChange(value: string) {
    setSourceId(value)
    navigate({ source: value, page: 1 })
  }

  const { data: candidates, total, page, pageSize, totalPages } = initialData
  const rangeStart = total === 0 ? 0 : (page - 1) * pageSize + 1
  const rangeEnd = Math.min(page * pageSize, total)

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Candidates</h1>
          <p className="mt-1 text-sm text-gray-500">
            Browse and manage every candidate in the talent pool.
          </p>
        </div>
        <Link href="/candidates/new" className={primaryButtonClass}>
          <Plus className="mr-2 h-4 w-4" />
          Add Candidate
        </Link>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email or candidate number..."
            className={cn(inputClass, 'pl-9')}
          />
        </div>
        <select
          value={sourceId}
          onChange={(e) => handleSourceChange(e.target.value)}
          className={cn(inputClass, 'sm:w-56')}
        >
          <option value="">All sources</option>
          {sources.map((source) => (
            <option key={source.id} value={source.id}>
              {source.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-6 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        {candidates.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <Users className="h-10 w-10 text-gray-300" />
            <h3 className="mt-4 text-sm font-medium text-gray-900">No candidates found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {search || sourceId
                ? 'Try adjusting your search or filters.'
                : 'Get started by adding your first candidate.'}
            </p>
            <Link href="/candidates/new" className={cn(primaryButtonClass, 'mt-4')}>
              <Plus className="mr-2 h-4 w-4" />
              Add Candidate
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {['Candidate #', 'Name', 'Email', 'Current Role', 'Location', 'Applications', 'Created'].map(
                    (heading) => (
                      <th
                        key={heading}
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                      >
                        {heading}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {candidates.map((candidate) => (
                  <tr
                    key={candidate.id}
                    onClick={() => router.push(`/candidates/${candidate.id}`)}
                    className="cursor-pointer hover:bg-gray-50"
                  >
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                      {candidate.candidate_number}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                      {candidate.first_name} {candidate.last_name}
                      {candidate.preferred_name ? (
                        <span className="text-gray-400"> ({candidate.preferred_name})</span>
                      ) : null}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{candidate.email}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {candidate.current_job_title || '—'}
                      {candidate.current_employer ? (
                        <span className="text-gray-400"> · {candidate.current_employer}</span>
                      ) : null}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {candidate.location || '—'}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {candidate.applications?.length ?? 0}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {formatDate(candidate.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {candidates.length > 0 && (
          <div className="flex flex-col gap-3 border-t border-gray-200 px-6 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-gray-500">
              Showing <span className="font-medium">{rangeStart}</span>–
              <span className="font-medium">{rangeEnd}</span> of{' '}
              <span className="font-medium">{total}</span> candidates
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => navigate({ page: page - 1 })}
                className={cn(secondaryButtonClass, 'px-3 py-1.5 disabled:cursor-not-allowed disabled:opacity-50')}
              >
                <ChevronLeft className="mr-1 h-4 w-4" />
                Previous
              </button>
              <span className="text-sm text-gray-500">
                Page {page} of {totalPages || 1}
              </span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => navigate({ page: page + 1 })}
                className={cn(secondaryButtonClass, 'px-3 py-1.5 disabled:cursor-not-allowed disabled:opacity-50')}
              >
                Next
                <ChevronRight className="ml-1 h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
