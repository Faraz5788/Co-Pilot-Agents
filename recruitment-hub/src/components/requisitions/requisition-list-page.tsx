'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Briefcase,
  Building2,
  ChevronLeft,
  ChevronRight,
  ChevronRight as ChevronRightSmall,
  MapPin,
  Plus,
  Search,
  User,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { REQUISITION_STATUS_COLORS, REQUISITION_STATUS_LABELS } from '@/lib/constants'
import type { RequisitionStatus } from '@/types/database'
import type { RequisitionRecord } from './types'

const STATUS_ORDER: RequisitionStatus[] = [
  'draft',
  'pending_approval',
  'approved',
  'open',
  'on_hold',
  'closed',
  'cancelled',
]

interface FilterOption {
  id: string
  name: string
}

interface RequisitionListPageProps {
  requisitions: RequisitionRecord[]
  total: number
  page: number
  pageSize: number
  totalPages: number
  departments: FilterOption[]
  locations: FilterOption[]
  filters: {
    status: string
    department: string
    location: string
    search: string
  }
}

function StatusBadge({ status }: { status: RequisitionStatus }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        REQUISITION_STATUS_COLORS[status] ?? 'bg-gray-100 text-gray-700'
      )}
    >
      {REQUISITION_STATUS_LABELS[status] ?? status}
    </span>
  )
}

function formatDate(value: string | null | undefined) {
  if (!value) return '—'
  try {
    return new Date(value).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return value
  }
}

function hiringManagerName(r: RequisitionRecord) {
  if (!r.hiring_manager) return '—'
  return `${r.hiring_manager.first_name} ${r.hiring_manager.last_name}`
}

function locationLabel(r: RequisitionRecord) {
  if (!r.location) return '—'
  const parts = [r.location.name, r.location.city].filter(Boolean)
  return parts.join(', ')
}

export function RequisitionListPage({
  requisitions,
  total,
  page,
  pageSize,
  totalPages,
  departments,
  locations,
  filters,
}: RequisitionListPageProps) {
  const router = useRouter()
  const [searchValue, setSearchValue] = useState(filters.search)

  // Keep the local search box in sync if the URL changes from elsewhere
  // (e.g. browser back/forward). Adjusted during render rather than in an
  // effect, per https://react.dev/learn/you-might-not-need-an-effect.
  const [syncedSearch, setSyncedSearch] = useState(filters.search)
  if (filters.search !== syncedSearch) {
    setSyncedSearch(filters.search)
    setSearchValue(filters.search)
  }

  const hasActiveFilters = Boolean(filters.status || filters.department || filters.location || filters.search)

  function navigate(next: Partial<{ status: string; department: string; location: string; search: string; page: string }>) {
    const merged = { ...filters, page: '1', ...next }
    const params = new URLSearchParams()
    if (merged.status) params.set('status', merged.status)
    if (merged.department) params.set('department', merged.department)
    if (merged.location) params.set('location', merged.location)
    if (merged.search) params.set('search', merged.search)
    if (merged.page && merged.page !== '1') params.set('page', merged.page)
    const qs = params.toString()
    router.push(`/requisitions${qs ? `?${qs}` : ''}`)
  }

  // Debounce free-text search input before pushing to the URL.
  useEffect(() => {
    if (searchValue === filters.search) return
    const timeout = setTimeout(() => {
      navigate({ search: searchValue })
    }, 400)
    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchValue])

  function clearFilters() {
    setSearchValue('')
    router.push('/requisitions')
  }

  const rangeStart = total === 0 ? 0 : (page - 1) * pageSize + 1
  const rangeEnd = Math.min(page * pageSize, total)

  const sortedDepartments = useMemo(
    () => [...departments].sort((a, b) => a.name.localeCompare(b.name)),
    [departments]
  )
  const sortedLocations = useMemo(
    () => [...locations].sort((a, b) => a.name.localeCompare(b.name)),
    [locations]
  )

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Requisitions</h1>
          <p className="mt-1 text-sm text-gray-500">
            {total} requisition{total === 1 ? '' : 's'} in total
          </p>
        </div>
        <Link
          href="/requisitions/new"
          className="inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Create Requisition
        </Link>
      </div>

      {/* Filter bar */}
      <div className="mt-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <div className="relative lg:col-span-2">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search by title or reference number..."
              className="w-full rounded-md border border-gray-300 py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={filters.status}
            onChange={(e) => navigate({ status: e.target.value })}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All statuses</option>
            {STATUS_ORDER.map((status) => (
              <option key={status} value={status}>
                {REQUISITION_STATUS_LABELS[status]}
              </option>
            ))}
          </select>

          <select
            value={filters.department}
            onChange={(e) => navigate({ department: e.target.value })}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All departments</option>
            {sortedDepartments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>

          <select
            value={filters.location}
            onChange={(e) => navigate({ location: e.target.value })}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All locations</option>
            {sortedLocations.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        </div>

        {hasActiveFilters && (
          <div className="mt-3 flex justify-end">
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              <X className="h-4 w-4" />
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* Empty state */}
      {requisitions.length === 0 && (
        <div className="mt-6 flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white py-16 text-center">
          <Briefcase className="h-10 w-10 text-gray-300" />
          <p className="mt-4 text-sm font-medium text-gray-900">No requisitions found</p>
          <p className="mt-1 text-sm text-gray-500">
            {hasActiveFilters
              ? 'Try adjusting or clearing your filters.'
              : 'Get started by creating your first requisition.'}
          </p>
          {hasActiveFilters ? (
            <button
              type="button"
              onClick={clearFilters}
              className="mt-4 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50"
            >
              Clear filters
            </button>
          ) : (
            <Link
              href="/requisitions/new"
              className="mt-4 inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Create Requisition
            </Link>
          )}
        </div>
      )}

      {requisitions.length > 0 && (
        <>
          {/* Desktop table */}
          <div className="mt-6 hidden overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm md:block">
            <table className="w-full divide-y divide-gray-200 text-left text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 font-medium text-gray-500">Reference</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Title</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Department</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Location</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Hiring Manager</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Status</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Created</th>
                  <th className="px-4 py-3 font-medium text-gray-500">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {requisitions.map((r, idx) => (
                  <tr
                    key={r.id}
                    onClick={() => router.push(`/requisitions/${r.id}`)}
                    className={cn(
                      'cursor-pointer hover:bg-blue-50/60',
                      idx % 2 === 1 ? 'bg-gray-50/50' : 'bg-white'
                    )}
                  >
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-gray-900">
                      {r.reference_number}
                    </td>
                    <td className="max-w-xs truncate px-4 py-3 text-gray-900">{r.title}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-600">
                      {r.department?.name ?? '—'}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-600">{locationLabel(r)}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-600">{hiringManagerName(r)}</td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-500">{formatDate(r.created_at)}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <Link
                        href={`/requisitions/${r.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800"
                      >
                        View
                        <ChevronRightSmall className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="mt-6 space-y-3 md:hidden">
            {requisitions.map((r) => (
              <Link
                key={r.id}
                href={`/requisitions/${r.id}`}
                className="block rounded-lg border border-gray-200 bg-white p-4 shadow-sm active:bg-gray-50"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-medium text-gray-500">{r.reference_number}</p>
                    <p className="mt-0.5 font-medium text-gray-900">{r.title}</p>
                  </div>
                  <StatusBadge status={r.status} />
                </div>
                <div className="mt-3 space-y-1.5 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-gray-400" />
                    {r.department?.name ?? '—'}
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    {locationLabel(r)}
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-400" />
                    {hiringManagerName(r)}
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3 text-xs text-gray-400">
                  <span>Created {formatDate(r.created_at)}</span>
                  <span className="inline-flex items-center gap-1 font-medium text-blue-600">
                    View <ChevronRightSmall className="h-3.5 w-3.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
            <p className="text-sm text-gray-500">
              Showing <span className="font-medium text-gray-700">{rangeStart}</span>–
              <span className="font-medium text-gray-700">{rangeEnd}</span> of{' '}
              <span className="font-medium text-gray-700">{total}</span>
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => navigate({ page: String(page - 1) })}
                className="inline-flex items-center gap-1 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </button>
              <span className="text-sm text-gray-500">
                Page {page} of {Math.max(totalPages, 1)}
              </span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => navigate({ page: String(page + 1) })}
                className="inline-flex items-center gap-1 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
