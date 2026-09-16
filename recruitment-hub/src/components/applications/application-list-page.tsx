'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, ClipboardList, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { APPLICATION_STATUS_COLORS, APPLICATION_STATUS_LABELS } from '@/lib/constants'
import type { ApplicationStatus } from '@/types/database'
import { StageBadge } from '@/components/applications/stage-badge'

interface ApplicationCandidate {
  id: string
  candidate_number: string
  first_name: string
  last_name: string
  email: string
  current_job_title: string | null
  current_employer: string | null
}

interface ApplicationRequisition {
  id: string
  reference_number: string
  title: string
}

interface ApplicationStage {
  id: string
  name: string
  display_order: number
  stage_type: string
}

interface ApplicationRecruiter {
  id: string
  first_name: string
  last_name: string
}

export interface ApplicationListRow {
  id: string
  application_status: string
  application_date: string
  created_at: string
  candidate: ApplicationCandidate | null
  requisition: ApplicationRequisition | null
  current_stage: ApplicationStage | null
  assigned_recruiter: ApplicationRecruiter | null
}

export interface ApplicationsResult {
  data: ApplicationListRow[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface PipelineStageOption {
  id: string
  name: string
  stage_type: string
  display_order: number
}

export interface RecruiterOption {
  id: string
  first_name: string
  last_name: string
}

interface ApplicationListPageProps {
  initialData: ApplicationsResult
  stages: PipelineStageOption[]
  recruiters: RecruiterOption[]
  initialFilters: {
    search: string
    stage: string
    status: string
    recruiter: string
  }
}

const inputClass =
  'w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
const secondaryButtonClass =
  'inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50'

const STATUS_OPTIONS: ApplicationStatus[] = ['active', 'rejected', 'withdrawn', 'hired', 'on_hold']

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

export function ApplicationListPage({
  initialData,
  stages,
  recruiters,
  initialFilters,
}: ApplicationListPageProps) {
  const router = useRouter()
  const [search, setSearch] = useState(initialFilters.search)
  const [stage, setStage] = useState(initialFilters.stage)
  const [status, setStatus] = useState(initialFilters.status)
  const [recruiter, setRecruiter] = useState(initialFilters.recruiter)
  const isFirstRender = useRef(true)

  const navigate = useCallback(
    (next: Partial<{ search: string; stage: string; status: string; recruiter: string; page: number }>) => {
      const query = new URLSearchParams()
      const nextValues = {
        search: next.search ?? search,
        stage: next.stage ?? stage,
        status: next.status ?? status,
        recruiter: next.recruiter ?? recruiter,
      }
      if (nextValues.search) query.set('search', nextValues.search)
      if (nextValues.stage) query.set('stage', nextValues.stage)
      if (nextValues.status) query.set('status', nextValues.status)
      if (nextValues.recruiter) query.set('recruiter', nextValues.recruiter)
      if (next.page && next.page > 1) query.set('page', String(next.page))
      const qs = query.toString()
      router.push(qs ? `/applications?${qs}` : '/applications')
    },
    [router, search, stage, status, recruiter]
  )

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

  const { data: applications, total, page, pageSize, totalPages } = initialData
  const rangeStart = total === 0 ? 0 : (page - 1) * pageSize + 1
  const rangeEnd = Math.min(page * pageSize, total)

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Applications</h1>
        <p className="mt-1 text-sm text-gray-500">Track every candidate moving through your pipelines.</p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative sm:col-span-2 lg:col-span-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search candidate or requisition..."
            className={cn(inputClass, 'pl-9')}
          />
        </div>
        <select
          value={stage}
          onChange={(e) => {
            setStage(e.target.value)
            navigate({ stage: e.target.value, page: 1 })
          }}
          className={inputClass}
        >
          <option value="">All stages</option>
          {stages
            .slice()
            .sort((a, b) => a.display_order - b.display_order)
            .map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
        </select>
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value)
            navigate({ status: e.target.value, page: 1 })
          }}
          className={inputClass}
        >
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {APPLICATION_STATUS_LABELS[s]}
            </option>
          ))}
        </select>
        <select
          value={recruiter}
          onChange={(e) => {
            setRecruiter(e.target.value)
            navigate({ recruiter: e.target.value, page: 1 })
          }}
          className={inputClass}
        >
          <option value="">All recruiters</option>
          {recruiters.map((r) => (
            <option key={r.id} value={r.id}>
              {r.first_name} {r.last_name}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-6 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        {applications.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <ClipboardList className="h-10 w-10 text-gray-300" />
            <h3 className="mt-4 text-sm font-medium text-gray-900">No applications found</h3>
            <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {['Candidate', 'Requisition', 'Stage', 'Status', 'Recruiter', 'Applied Date'].map((heading) => (
                    <th
                      key={heading}
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {applications.map((app) => (
                  <tr
                    key={app.id}
                    onClick={() => router.push(`/applications/${app.id}`)}
                    className="cursor-pointer hover:bg-gray-50"
                  >
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                      {app.candidate ? `${app.candidate.first_name} ${app.candidate.last_name}` : '—'}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {app.requisition?.title ?? '—'}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      {app.current_stage ? (
                        <StageBadge name={app.current_stage.name} stageType={app.current_stage.stage_type} />
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      <span
                        className={cn(
                          'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                          APPLICATION_STATUS_COLORS[app.application_status as ApplicationStatus] ??
                            'bg-gray-100 text-gray-800'
                        )}
                      >
                        {APPLICATION_STATUS_LABELS[app.application_status as ApplicationStatus] ??
                          app.application_status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {app.assigned_recruiter
                        ? `${app.assigned_recruiter.first_name} ${app.assigned_recruiter.last_name}`
                        : 'Unassigned'}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {formatDate(app.application_date)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {applications.length > 0 && (
          <div className="flex flex-col gap-3 border-t border-gray-200 px-6 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-gray-500">
              Showing <span className="font-medium">{rangeStart}</span>–
              <span className="font-medium">{rangeEnd}</span> of{' '}
              <span className="font-medium">{total}</span> applications
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
