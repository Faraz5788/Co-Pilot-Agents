'use client'

import { useMemo, useState } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import {
  CalendarClock,
  ClipboardList,
  Inbox,
  MapPin,
  Plus,
  SlidersHorizontal,
  Users,
  Video,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  INTERVIEW_STATUS_COLORS,
  INTERVIEW_STATUS_LABELS,
  INTERVIEW_TYPE_LABELS,
} from '@/lib/constants'
import type { InterviewStatus, InterviewType } from '@/types/database'
import {
  ScheduleInterviewDialog,
  type ApplicationOption,
  type UserOption,
} from './schedule-interview-dialog'
import { InterviewFeedbackForm, type Competency } from './interview-feedback-form'

interface PersonRef {
  id: string
  first_name: string
  last_name: string
  email?: string
  candidate_number?: string
}

interface InterviewRecord {
  id: string
  interview_type: InterviewType
  scheduled_start: string
  scheduled_end: string
  location_type: 'in_person' | 'remote' | 'hybrid'
  location: string | null
  meeting_url: string | null
  notes: string | null
  status: InterviewStatus
  application?: {
    id: string
    candidate?: PersonRef | null
    requisition?: { id: string; title: string; reference_number?: string } | null
  } | null
  interviewers?: { user: PersonRef | null }[]
  scorecards?: {
    id: string
    reviewer?: PersonRef | null
    overall_recommendation?: string | null
    overall_score?: number | null
    status: string
    submitted_at?: string | null
  }[]
}

interface Pagination {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export interface InterviewListPageProps {
  interviews: InterviewRecord[]
  pagination: Pagination
  upcomingInterviews: InterviewRecord[]
  applications: ApplicationOption[]
  users: UserOption[]
  competencies: Competency[]
  currentUserId: string | null
}

function candidateName(interview: InterviewRecord) {
  const candidate = interview.application?.candidate
  return candidate ? `${candidate.first_name} ${candidate.last_name}` : 'Unknown candidate'
}

function requisitionLabel(interview: InterviewRecord) {
  const requisition = interview.application?.requisition
  return requisition?.title ?? 'Unknown requisition'
}

function formatDateRange(start: string, end: string) {
  const startDate = new Date(start)
  const endDate = new Date(end)
  const dateLabel = startDate.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
  const timeLabel = `${startDate.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  })} – ${endDate.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}`
  return `${dateLabel}, ${timeLabel}`
}

function feedbackStatus(interview: InterviewRecord) {
  const interviewerCount = interview.interviewers?.length ?? 0
  const submitted = (interview.scorecards ?? []).filter((s) => s.status === 'submitted').length

  if (interviewerCount === 0) return { label: 'No interviewers', tone: 'text-gray-400' }
  if (submitted === 0) return { label: 'Pending', tone: 'text-amber-600' }
  if (submitted >= interviewerCount) return { label: 'Complete', tone: 'text-emerald-600' }
  return { label: `${submitted}/${interviewerCount} submitted`, tone: 'text-amber-600' }
}

function StatusBadge({ status }: { status: InterviewStatus }) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium',
        INTERVIEW_STATUS_COLORS[status]
      )}
    >
      {INTERVIEW_STATUS_LABELS[status]}
    </span>
  )
}

export function InterviewListPage({
  interviews,
  pagination,
  upcomingInterviews,
  applications,
  users,
  competencies,
  currentUserId,
}: InterviewListPageProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [scheduleOpen, setScheduleOpen] = useState(false)
  const [feedbackInterview, setFeedbackInterview] = useState<InterviewRecord | null>(null)
  const [typeFilter, setTypeFilter] = useState<InterviewType | ''>('')

  const statusFilter = searchParams.get('status') ?? ''
  const fromFilter = searchParams.get('from') ?? ''
  const toFilter = searchParams.get('to') ?? ''

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    params.delete('page')
    router.push(`${pathname}?${params.toString()}`)
  }

  function goToPage(page: number) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', String(page))
    router.push(`${pathname}?${params.toString()}`)
  }

  const filteredUpcoming = useMemo(
    () =>
      typeFilter ? upcomingInterviews.filter((i) => i.interview_type === typeFilter) : upcomingInterviews,
    [upcomingInterviews, typeFilter]
  )

  // `useState`'s lazy initializer is the sanctioned escape hatch for reading
  // an impure value (the current time) once per mount rather than on every
  // render, per https://react.dev/reference/rules/components-and-hooks-must-be-pure.
  const [now] = useState(() => Date.now())
  const pastInterviews = useMemo(
    () => interviews.filter((i) => new Date(i.scheduled_end).getTime() <= now),
    [interviews, now]
  )
  const filteredPast = useMemo(
    () => (typeFilter ? pastInterviews.filter((i) => i.interview_type === typeFilter) : pastInterviews),
    [pastInterviews, typeFilter]
  )

  const canSubmitFeedback = (interview: InterviewRecord) => {
    if (!currentUserId) return false
    if (interview.status !== 'completed') return false
    const isInterviewer = (interview.interviewers ?? []).some((i) => i.user?.id === currentUserId)
    if (!isInterviewer) return false
    const alreadySubmitted = (interview.scorecards ?? []).some(
      (s) => s.status === 'submitted' && s.reviewer?.id === currentUserId
    )
    return !alreadySubmitted
  }

  const isEmpty = interviews.length === 0 && upcomingInterviews.length === 0

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Interviews</h1>
          <p className="mt-1 text-sm text-gray-500">
            Schedule interviews, track upcoming sessions and review feedback.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setScheduleOpen(true)}
          className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Schedule Interview
        </button>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2 text-sm font-medium text-gray-700">
          <SlidersHorizontal className="h-4 w-4 text-gray-400" />
          Filters
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <select
            value={statusFilter}
            onChange={(e) => updateParam('status', e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
          >
            <option value="">All statuses</option>
            {Object.entries(INTERVIEW_STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={fromFilter}
            onChange={(e) => updateParam('from', e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
            aria-label="From date"
          />

          <input
            type="date"
            value={toFilter}
            onChange={(e) => updateParam('to', e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
            aria-label="To date"
          />

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as InterviewType | '')}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
          >
            <option value="">All interview types</option>
            {Object.entries(INTERVIEW_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 bg-white py-16 text-gray-400">
          <Inbox className="h-10 w-10" strokeWidth={1.5} />
          <p className="text-sm font-medium">No interviews scheduled</p>
        </div>
      ) : (
        <>
          <section>
            <h2 className="mb-3 text-base font-semibold text-gray-900">Upcoming Interviews</h2>
            {filteredUpcoming.length === 0 ? (
              <div className="rounded-lg border border-dashed border-gray-300 bg-white px-4 py-8 text-center text-sm text-gray-400">
                No upcoming interviews
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredUpcoming.map((interview) => (
                  <div
                    key={interview.id}
                    className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-gray-900">{candidateName(interview)}</p>
                        <p className="text-sm text-gray-500">{requisitionLabel(interview)}</p>
                      </div>
                      <StatusBadge status={interview.status} />
                    </div>

                    <div className="mt-4 space-y-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <ClipboardList className="h-4 w-4 shrink-0 text-gray-400" />
                        {INTERVIEW_TYPE_LABELS[interview.interview_type]}
                      </div>
                      <div className="flex items-center gap-2">
                        <CalendarClock className="h-4 w-4 shrink-0 text-gray-400" />
                        {formatDateRange(interview.scheduled_start, interview.scheduled_end)}
                      </div>
                      <div className="flex items-center gap-2">
                        {interview.location_type === 'remote' ? (
                          <Video className="h-4 w-4 shrink-0 text-gray-400" />
                        ) : (
                          <MapPin className="h-4 w-4 shrink-0 text-gray-400" />
                        )}
                        <span className="truncate">
                          {interview.location_type === 'remote'
                            ? 'Remote'
                            : interview.location_type === 'hybrid'
                              ? `Hybrid — ${interview.location ?? 'TBC'}`
                              : (interview.location ?? 'TBC')}
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Users className="h-4 w-4 shrink-0 text-gray-400" />
                        <span>
                          {(interview.interviewers ?? [])
                            .map((i) => (i.user ? `${i.user.first_name} ${i.user.last_name}` : null))
                            .filter(Boolean)
                            .join(', ') || 'Unassigned'}
                        </span>
                      </div>
                    </div>

                    {canSubmitFeedback(interview) ? (
                      <button
                        type="button"
                        onClick={() => setFeedbackInterview(interview)}
                        className="mt-4 w-full rounded-md border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 hover:bg-blue-100"
                      >
                        Submit Feedback
                      </button>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-gray-900">Past Interviews</h2>
            {filteredPast.length === 0 ? (
              <div className="rounded-lg border border-dashed border-gray-300 bg-white px-4 py-8 text-center text-sm text-gray-400">
                No past interviews
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-gray-500">Candidate</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-500">Requisition</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-500">Type</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-500">Date</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-500">Feedback</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredPast.map((interview) => {
                      const feedback = feedbackStatus(interview)
                      return (
                        <tr key={interview.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium text-gray-900">
                            {candidateName(interview)}
                          </td>
                          <td className="px-4 py-3 text-gray-600">{requisitionLabel(interview)}</td>
                          <td className="px-4 py-3 text-gray-600">
                            {INTERVIEW_TYPE_LABELS[interview.interview_type]}
                          </td>
                          <td className="px-4 py-3 text-gray-600">
                            {new Date(interview.scheduled_start).toLocaleDateString(undefined, {
                              dateStyle: 'medium',
                            })}
                          </td>
                          <td className="px-4 py-3">
                            <StatusBadge status={interview.status} />
                          </td>
                          <td className={cn('px-4 py-3 font-medium', feedback.tone)}>
                            <div className="flex items-center gap-2">
                              {feedback.label}
                              {canSubmitFeedback(interview) ? (
                                <button
                                  type="button"
                                  onClick={() => setFeedbackInterview(interview)}
                                  className="text-blue-600 hover:underline"
                                >
                                  Add feedback
                                </button>
                              ) : null}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>

                {pagination.totalPages > 1 ? (
                  <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 text-sm text-gray-600">
                    <span>
                      Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
                    </span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={pagination.page <= 1}
                        onClick={() => goToPage(pagination.page - 1)}
                        className="rounded-md border border-gray-300 px-3 py-1 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Previous
                      </button>
                      <button
                        type="button"
                        disabled={pagination.page >= pagination.totalPages}
                        onClick={() => goToPage(pagination.page + 1)}
                        className="rounded-md border border-gray-300 px-3 py-1 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </section>
        </>
      )}

      <ScheduleInterviewDialog
        open={scheduleOpen}
        onClose={() => setScheduleOpen(false)}
        onScheduled={() => router.refresh()}
        applications={applications}
        users={users}
      />

      {feedbackInterview ? (
        <InterviewFeedbackForm
          open={Boolean(feedbackInterview)}
          onClose={() => setFeedbackInterview(null)}
          onSubmitted={() => router.refresh()}
          interview={feedbackInterview}
          competencies={competencies}
        />
      ) : null}
    </div>
  )
}
