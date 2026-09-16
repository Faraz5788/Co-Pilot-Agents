'use client'

import { Fragment, useEffect, useState } from 'react'
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Search,
  Shield,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import type { AdminUserRow, AuditLogListResult, AuditLogRow } from '@/types/admin'

const ENTITY_TYPES = [
  'user',
  'pipeline_stage',
  'source',
  'rejection_reason',
  'department',
  'location',
  'cost_centre',
  'job_profile',
  'position',
  'grade',
  'competency',
  'requisition',
  'candidate',
  'application',
  'interview',
  'offer',
  'approval',
  'integration',
]

const ACTION_COLORS: Array<{ match: RegExp; className: string }> = [
  { match: /created|assigned/i, className: 'bg-emerald-100 text-emerald-800' },
  { match: /updated/i, className: 'bg-blue-100 text-blue-800' },
  { match: /deleted|removed|rejected/i, className: 'bg-red-100 text-red-800' },
]

function actionBadgeClass(action: string) {
  return ACTION_COLORS.find((c) => c.match.test(action))?.className ?? 'bg-gray-100 text-gray-700'
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

function userName(row: AuditLogRow) {
  if (!row.user) return 'System'
  return `${row.user.first_name} ${row.user.last_name}`
}

interface Filters {
  entityType: string
  action: string
  userId: string
  from: string
  to: string
}

const EMPTY_FILTERS: Filters = { entityType: '', action: '', userId: '', from: '', to: '' }

interface AuditLogPageProps {
  initialResult: AuditLogListResult
  users: AdminUserRow[]
}

export function AuditLogPage({ initialResult, users }: AuditLogPageProps) {
  const [result, setResult] = useState(initialResult)
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS)
  const [actionInput, setActionInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  async function load(page: number, nextFilters: Filters) {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      params.set('page', String(page))
      params.set('pageSize', String(initialResult.pageSize))
      if (nextFilters.entityType) params.set('entityType', nextFilters.entityType)
      if (nextFilters.action) params.set('action', nextFilters.action)
      if (nextFilters.userId) params.set('userId', nextFilters.userId)
      if (nextFilters.from) params.set('from', nextFilters.from)
      if (nextFilters.to) params.set('to', nextFilters.to)

      const res = await fetch(`/api/admin/audit-logs?${params.toString()}`)
      if (!res.ok) {
        const body = await res.json().catch(() => null)
        throw new Error(body?.error ?? 'Failed to load audit logs')
      }
      const data = (await res.json()) as AuditLogListResult
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load audit logs')
    } finally {
      setLoading(false)
    }
  }

  function updateFilter<K extends keyof Filters>(key: K, value: Filters[K]) {
    const next = { ...filters, [key]: value }
    setFilters(next)
    void load(1, next)
  }

  // Debounce the free-text action search.
  useEffect(() => {
    if (actionInput === filters.action) return
    const timeout = setTimeout(() => updateFilter('action', actionInput), 400)
    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actionInput])

  function clearFilters() {
    setFilters(EMPTY_FILTERS)
    setActionInput('')
    void load(1, EMPTY_FILTERS)
  }

  const hasActiveFilters =
    Boolean(filters.entityType) ||
    Boolean(filters.action) ||
    Boolean(filters.userId) ||
    Boolean(filters.from) ||
    Boolean(filters.to)

  const sortedUsers = [...users].sort((a, b) => a.first_name.localeCompare(b.first_name))

  return (
    <div className="mx-auto max-w-7xl">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-50">Audit Logs</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          A complete, immutable record of every change made across the system.
        </p>
      </div>

      {/* Filters */}
      <div className="mt-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <select
            value={filters.entityType}
            onChange={(e) => updateFilter('entityType', e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
          >
            <option value="">All entity types</option>
            {ENTITY_TYPES.map((type) => (
              <option key={type} value={type}>
                {type.replace(/_/g, ' ')}
              </option>
            ))}
          </select>

          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={actionInput}
              onChange={(e) => setActionInput(e.target.value)}
              placeholder="Search action..."
              className="w-full rounded-md border border-gray-300 py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
            />
          </div>

          <select
            value={filters.userId}
            onChange={(e) => updateFilter('userId', e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
          >
            <option value="">All users</option>
            {sortedUsers.map((u) => (
              <option key={u.id} value={u.id}>
                {u.first_name} {u.last_name}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={filters.from}
            onChange={(e) => updateFilter('from', e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
          />
          <input
            type="date"
            value={filters.to}
            onChange={(e) => updateFilter('to', e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
          />
        </div>

        {hasActiveFilters && (
          <div className="mt-3 flex justify-end">
            <button
              type="button"
              onClick={clearFilters}
              className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-500/10 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Log table */}
      <div className="relative mt-4 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 dark:bg-gray-900/60">
            <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
          </div>
        )}
        <table className="w-full divide-y divide-gray-200 text-left text-sm dark:divide-gray-800">
          <thead className="bg-gray-50 dark:bg-gray-800/50">
            <tr>
              <th className="w-8 px-4 py-3" />
              <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Timestamp</th>
              <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">User</th>
              <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Action</th>
              <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Entity Type</th>
              <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Entity ID</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 font-mono text-xs dark:divide-gray-800">
            {result.data.map((row) => {
              const isExpanded = expandedId === row.id
              const hasChanges = Boolean(row.old_values || row.new_values)
              return (
                <Fragment key={row.id}>
                  <tr
                    onClick={() => hasChanges && setExpandedId(isExpanded ? null : row.id)}
                    className={cn(
                      'font-sans',
                      hasChanges && 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/40',
                      isExpanded && 'bg-gray-50 dark:bg-gray-800/40'
                    )}
                  >
                    <td className="px-4 py-3 text-gray-400">
                      {hasChanges ? (
                        <ChevronDown
                          className={cn('h-4 w-4 transition-transform', !isExpanded && '-rotate-90')}
                        />
                      ) : null}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-gray-600 dark:text-gray-300">
                      {formatDateTime(row.created_at)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-900 dark:text-gray-50">
                      {userName(row)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <span
                        className={cn(
                          'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                          actionBadgeClass(row.action)
                        )}
                      >
                        {row.action}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-600 dark:text-gray-300">
                      {row.entity_type.replace(/_/g, ' ')}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-gray-400 dark:text-gray-500">
                      {row.entity_id ? `${row.entity_id.slice(0, 8)}…` : '—'}
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr className="bg-gray-50/70 dark:bg-gray-900/40">
                      <td colSpan={6} className="px-4 py-4">
                        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                          <div>
                            <p className="mb-1 font-sans text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                              Old Values
                            </p>
                            <pre className="max-h-64 overflow-auto rounded-md bg-gray-900 p-3 text-[11px] leading-relaxed text-gray-100 dark:bg-black">
                              {row.old_values ? JSON.stringify(row.old_values, null, 2) : 'null'}
                            </pre>
                          </div>
                          <div>
                            <p className="mb-1 font-sans text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                              New Values
                            </p>
                            <pre className="max-h-64 overflow-auto rounded-md bg-gray-900 p-3 text-[11px] leading-relaxed text-gray-100 dark:bg-black">
                              {row.new_values ? JSON.stringify(row.new_values, null, 2) : 'null'}
                            </pre>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              )
            })}
          </tbody>
        </table>

        {result.data.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Shield className="h-8 w-8 text-gray-300" strokeWidth={1.5} />
            <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">No audit log entries match your filters.</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Showing{' '}
          <span className="font-medium text-gray-700 dark:text-gray-200">
            {result.total === 0 ? 0 : (result.page - 1) * result.pageSize + 1}
          </span>
          –
          <span className="font-medium text-gray-700 dark:text-gray-200">
            {Math.min(result.page * result.pageSize, result.total)}
          </span>{' '}
          of <span className="font-medium text-gray-700 dark:text-gray-200">{result.total}</span>
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={result.page <= 1 || loading}
            onClick={() => load(result.page - 1, filters)}
            className="inline-flex items-center gap-1 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </button>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Page {result.page} of {Math.max(result.totalPages, 1)}
          </span>
          <button
            type="button"
            disabled={result.page >= result.totalPages || loading}
            onClick={() => load(result.page + 1, filters)}
            className="inline-flex items-center gap-1 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
