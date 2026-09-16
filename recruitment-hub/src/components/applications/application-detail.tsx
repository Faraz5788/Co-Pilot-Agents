'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Check, Plus, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  APPLICATION_STATUS_COLORS,
  APPLICATION_STATUS_LABELS,
  INTERVIEW_STATUS_COLORS,
  INTERVIEW_STATUS_LABELS,
  INTERVIEW_TYPE_LABELS,
  RECOMMENDATION_COLORS,
  RECOMMENDATION_LABELS,
} from '@/lib/constants'
import type { ApplicationStatus, InterviewStatus, InterviewType, RecommendationType } from '@/types/database'
import { StageBadge } from '@/components/applications/stage-badge'

// ---------------------------------------------------------------------------
// Types (mirroring the shapes returned by the application/interview services)
// ---------------------------------------------------------------------------

interface NamedRef {
  id: string
  name: string
}

interface ApplicationRow {
  id: string
  candidate_id: string
  requisition_id: string
  application_status: string
  application_date: string
  notice_period: string | null
  salary_expectation: number | null
  screening_summary: string | null
  withdrawal_reason: string | null
  rejection_reason_id: string | null
  created_at: string
  candidate: {
    id: string
    candidate_number: string
    first_name: string
    last_name: string
    email: string
    phone: string | null
    location: string | null
    current_employer: string | null
    current_job_title: string | null
  } | null
  requisition: {
    id: string
    reference_number: string
    title: string
    status: string
    department: NamedRef | null
    location: NamedRef | null
  } | null
  current_stage: { id: string; name: string; display_order: number; stage_type: string } | null
  assigned_recruiter: { id: string; first_name: string; last_name: string; email: string } | null
  source: NamedRef | null
  rejection_reason: NamedRef | null
}

interface StageHistoryRow {
  id: string
  from_stage: NamedRef | null
  to_stage: NamedRef | null
  changed_by_user: { id: string; first_name: string; last_name: string } | null
  changed_at: string
  notes: string | null
}

interface InterviewInterviewer {
  user: { id: string; first_name: string; last_name: string; email: string } | null
}

interface InterviewScorecardSummary {
  id: string
  status: string
}

interface InterviewRow {
  id: string
  interview_type: string
  scheduled_start: string
  scheduled_end: string
  status: string
  location_type: string
  location: string | null
  interviewers: InterviewInterviewer[] | null
  scorecards: InterviewScorecardSummary[] | null
}

export interface ScorecardRow {
  id: string
  interview_id: string
  overall_recommendation: string | null
  overall_score: number | null
  strengths: string | null
  concerns: string | null
  status: string
  submitted_at: string | null
  reviewer: { id: string; first_name: string; last_name: string } | null
}

interface PipelineStageOption {
  id: string
  name: string
  display_order: number
  stage_type: string
  is_default: boolean
  active: boolean
}

interface RejectionReasonOption {
  id: string
  name: string
  category: string | null
}

export interface RecruiterNoteRow {
  id: string
  note: string
  created_at: string
  author: { id: string; first_name: string; last_name: string } | null
}

interface ApplicationDetailProps {
  application: ApplicationRow
  stageHistory: StageHistoryRow[]
  interviews: InterviewRow[]
  scorecards: ScorecardRow[]
  stages: PipelineStageOption[]
  rejectionReasons: RejectionReasonOption[]
  notes: RecruiterNoteRow[]
}

const cardClass = 'rounded-lg border border-gray-200 bg-white shadow-sm p-6'
const inputClass =
  'w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
const primaryButtonClass =
  'inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-60'
const secondaryButtonClass =
  'inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50'
const dangerButtonClass =
  'inline-flex items-center px-4 py-2 border border-red-300 bg-white text-sm font-medium rounded-md text-red-700 hover:bg-red-50'

const TABS = ['Overview', 'Pipeline', 'Interviews', 'Feedback', 'Activity'] as const
type Tab = (typeof TABS)[number]

function formatDate(value: string | null) {
  if (!value) return '—'
  try {
    return new Date(value).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  } catch {
    return value
  }
}

function formatDateTime(value: string | null) {
  if (!value) return '—'
  try {
    return new Date(value).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  } catch {
    return value
  }
}

export function ApplicationDetail({
  application,
  stageHistory,
  interviews,
  scorecards,
  stages,
  rejectionReasons,
  notes,
}: ApplicationDetailProps) {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('Overview')
  const [busy, setBusy] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  const [moveTargetId, setMoveTargetId] = useState('')
  const [moveNotes, setMoveNotes] = useState('')
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [rejectionReasonId, setRejectionReasonId] = useState('')
  const [rejectNotes, setRejectNotes] = useState('')
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false)
  const [withdrawReason, setWithdrawReason] = useState('')

  const withdrawnStage = stages.find((s) => s.stage_type === 'withdrawn')
  const otherStages = stages
    .filter((s) => s.active && s.id !== application.current_stage?.id)
    .sort((a, b) => a.display_order - b.display_order)

  async function refresh() {
    router.refresh()
  }

  async function handleMoveStage() {
    if (!moveTargetId) return
    setBusy(true)
    setActionError(null)
    try {
      const res = await fetch(`/api/applications/${application.id}/stage`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to_stage_id: moveTargetId, notes: moveNotes || undefined }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        setActionError(json.error?.message ?? 'Failed to move stage')
        return
      }
      setMoveTargetId('')
      setMoveNotes('')
      await refresh()
    } finally {
      setBusy(false)
    }
  }

  async function handleReject() {
    if (!rejectionReasonId) {
      setActionError('Please select a rejection reason')
      return
    }
    setBusy(true)
    setActionError(null)
    try {
      const res = await fetch(`/api/applications/${application.id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rejection_reason_id: rejectionReasonId, notes: rejectNotes || undefined }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        setActionError(json.error?.message ?? 'Failed to reject application')
        return
      }
      setShowRejectDialog(false)
      setRejectionReasonId('')
      setRejectNotes('')
      await refresh()
    } finally {
      setBusy(false)
    }
  }

  async function handleWithdraw() {
    if (!withdrawnStage) {
      setActionError('No "withdrawn" pipeline stage is configured')
      return
    }
    setBusy(true)
    setActionError(null)
    try {
      if (withdrawReason) {
        await fetch(`/api/applications/${application.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ withdrawal_reason: withdrawReason }),
        })
      }
      const res = await fetch(`/api/applications/${application.id}/stage`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to_stage_id: withdrawnStage.id, notes: 'Application withdrawn' }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        setActionError(json.error?.message ?? 'Failed to withdraw application')
        return
      }
      setShowWithdrawDialog(false)
      setWithdrawReason('')
      await refresh()
    } finally {
      setBusy(false)
    }
  }

  const candidateName = application.candidate
    ? `${application.candidate.first_name} ${application.candidate.last_name}`
    : 'Unknown candidate'

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className={cardClass}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Link href={`/candidates/${application.candidate_id}`} className="text-xl font-semibold text-blue-600 hover:underline">
                {candidateName}
              </Link>
              <span className="text-gray-300">/</span>
              <Link href={`/requisitions/${application.requisition_id}`} className="text-xl font-semibold text-gray-700 hover:underline">
                {application.requisition?.title ?? 'Unknown requisition'}
              </Link>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              {application.requisition?.reference_number} · Applied {formatDate(application.application_date)}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {application.current_stage && (
                <StageBadge name={application.current_stage.name} stageType={application.current_stage.stage_type} />
              )}
              <span
                className={cn(
                  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                  APPLICATION_STATUS_COLORS[application.application_status as ApplicationStatus] ??
                    'bg-gray-100 text-gray-800'
                )}
              >
                {APPLICATION_STATUS_LABELS[application.application_status as ApplicationStatus] ??
                  application.application_status}
              </span>
            </div>
          </div>
        </div>

        {/* Action bar */}
        <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-gray-100 pt-4">
          <select
            value={moveTargetId}
            onChange={(e) => setMoveTargetId(e.target.value)}
            className={cn(inputClass, 'w-56')}
          >
            <option value="">Move to stage…</option>
            {otherStages.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          {moveTargetId && (
            <div className="flex w-full flex-col gap-2 rounded-md border border-gray-200 bg-gray-50 p-3 sm:flex-row sm:items-center">
              <input
                type="text"
                value={moveNotes}
                onChange={(e) => setMoveNotes(e.target.value)}
                placeholder="Notes (optional)"
                className={cn(inputClass, 'sm:flex-1')}
              />
              <div className="flex gap-2">
                <button type="button" onClick={() => void handleMoveStage()} disabled={busy} className={primaryButtonClass}>
                  <Check className="mr-2 h-4 w-4" />
                  Confirm Move
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMoveTargetId('')
                    setMoveNotes('')
                  }}
                  className={secondaryButtonClass}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
          <button type="button" onClick={() => setShowRejectDialog(true)} className={dangerButtonClass}>
            Reject
          </button>
          <button type="button" onClick={() => setShowWithdrawDialog(true)} className={secondaryButtonClass}>
            Withdraw
          </button>
          <Link href={`/interviews?applicationId=${application.id}`} className={secondaryButtonClass}>
            Schedule Interview
          </Link>
          <Link href={`/offers?applicationId=${application.id}`} className={secondaryButtonClass}>
            Create Offer
          </Link>
        </div>

        {actionError && <p className="mt-3 text-sm text-red-600">{actionError}</p>}
      </div>

      {/* Tabs */}
      <div className="mt-6 border-b border-gray-200">
        <nav className="-mb-px flex gap-6 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={cn(
                'whitespace-nowrap border-b-2 px-1 py-3 text-sm font-medium',
                tab === t
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              )}
            >
              {t}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-6">
        {tab === 'Overview' && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className={cardClass}>
              <h2 className="text-base font-semibold text-gray-900">Application Info</h2>
              <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="text-gray-500">Source</dt>
                  <dd className="mt-0.5 text-gray-900">{application.source?.name ?? '—'}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Recruiter</dt>
                  <dd className="mt-0.5 text-gray-900">
                    {application.assigned_recruiter
                      ? `${application.assigned_recruiter.first_name} ${application.assigned_recruiter.last_name}`
                      : 'Unassigned'}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500">Notice Period</dt>
                  <dd className="mt-0.5 text-gray-900">{application.notice_period ?? '—'}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Salary Expectation</dt>
                  <dd className="mt-0.5 text-gray-900">
                    {application.salary_expectation ? application.salary_expectation.toLocaleString() : '—'}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500">Department</dt>
                  <dd className="mt-0.5 text-gray-900">{application.requisition?.department?.name ?? '—'}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Location</dt>
                  <dd className="mt-0.5 text-gray-900">{application.requisition?.location?.name ?? '—'}</dd>
                </div>
                {application.rejection_reason && (
                  <div className="col-span-2">
                    <dt className="text-gray-500">Rejection Reason</dt>
                    <dd className="mt-0.5 text-gray-900">{application.rejection_reason.name}</dd>
                  </div>
                )}
                {application.withdrawal_reason && (
                  <div className="col-span-2">
                    <dt className="text-gray-500">Withdrawal Reason</dt>
                    <dd className="mt-0.5 text-gray-900">{application.withdrawal_reason}</dd>
                  </div>
                )}
              </dl>
            </div>

            <div className={cardClass}>
              <h2 className="text-base font-semibold text-gray-900">Screening Summary</h2>
              <p className="mt-3 whitespace-pre-wrap text-sm text-gray-700">
                {application.screening_summary || 'No screening summary recorded yet.'}
              </p>
              {application.candidate && (
                <div className="mt-6 border-t border-gray-100 pt-4 text-sm text-gray-500">
                  <p>{application.candidate.email}</p>
                  {application.candidate.phone && <p>{application.candidate.phone}</p>}
                  {application.candidate.location && <p>{application.candidate.location}</p>}
                </div>
              )}
            </div>
          </div>
        )}

        {tab === 'Pipeline' && <PipelineProgress stages={stages} currentStage={application.current_stage} />}

        {tab === 'Interviews' && <InterviewsTab interviews={interviews} />}

        {tab === 'Feedback' && <FeedbackTab scorecards={scorecards} />}

        {tab === 'Activity' && <ActivityTab stageHistory={stageHistory} />}
      </div>

      <div className="mt-6">
        <RecruiterNotes applicationId={application.id} notes={notes} onAdded={refresh} />
      </div>

      {showRejectDialog && (
        <Modal title="Reject Application" onClose={() => setShowRejectDialog(false)}>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Rejection Reason</label>
              <select
                value={rejectionReasonId}
                onChange={(e) => setRejectionReasonId(e.target.value)}
                className={inputClass}
              >
                <option value="">Select a reason</option>
                {rejectionReasons.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Notes</label>
              <textarea
                value={rejectNotes}
                onChange={(e) => setRejectNotes(e.target.value)}
                rows={3}
                className={inputClass}
              />
            </div>
            {actionError && <p className="text-sm text-red-600">{actionError}</p>}
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setShowRejectDialog(false)} className={secondaryButtonClass}>
                Cancel
              </button>
              <button type="button" onClick={() => void handleReject()} disabled={busy} className={dangerButtonClass}>
                {busy ? 'Rejecting…' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {showWithdrawDialog && (
        <Modal title="Withdraw Application" onClose={() => setShowWithdrawDialog(false)}>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Reason (optional)</label>
              <textarea
                value={withdrawReason}
                onChange={(e) => setWithdrawReason(e.target.value)}
                rows={3}
                className={inputClass}
              />
            </div>
            {actionError && <p className="text-sm text-red-600">{actionError}</p>}
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setShowWithdrawDialog(false)} className={secondaryButtonClass}>
                Cancel
              </button>
              <button type="button" onClick={() => void handleWithdraw()} disabled={busy} className={primaryButtonClass}>
                {busy ? 'Withdrawing…' : 'Confirm Withdrawal'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">{title}</h2>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

function PipelineProgress({
  stages,
  currentStage,
}: {
  stages: PipelineStageOption[]
  currentStage: { id: string; name: string; display_order: number; stage_type: string } | null
}) {
  const forwardStages = useMemo(
    () =>
      stages
        .filter((s) => s.active && s.stage_type !== 'rejected' && s.stage_type !== 'withdrawn')
        .sort((a, b) => a.display_order - b.display_order),
    [stages]
  )

  const isTerminalNegative = currentStage?.stage_type === 'rejected' || currentStage?.stage_type === 'withdrawn'
  const currentOrder = currentStage?.display_order ?? -1

  return (
    <div className={cardClass}>
      <h2 className="text-base font-semibold text-gray-900">Pipeline Progress</h2>
      {isTerminalNegative && currentStage && (
        <div className="mt-4">
          <StageBadge name={currentStage.name} stageType={currentStage.stage_type} />
          <p className="mt-2 text-sm text-gray-500">This application is no longer progressing through the pipeline.</p>
        </div>
      )}
      <div className="mt-6 flex items-center overflow-x-auto pb-2">
        {forwardStages.map((stage, index) => {
          const reached = stage.display_order <= currentOrder && !isTerminalNegative
          const isCurrent = stage.id === currentStage?.id
          return (
            <div key={stage.id} className="flex flex-shrink-0 items-center">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-medium',
                    isCurrent
                      ? 'border-blue-600 bg-blue-600 text-white'
                      : reached
                        ? 'border-blue-600 bg-blue-50 text-blue-600'
                        : 'border-gray-300 bg-white text-gray-400'
                  )}
                >
                  {reached && !isCurrent ? <Check className="h-4 w-4" /> : index + 1}
                </div>
                <span
                  className={cn(
                    'mt-2 w-24 text-center text-xs',
                    isCurrent ? 'font-semibold text-blue-600' : 'text-gray-500'
                  )}
                >
                  {stage.name}
                </span>
              </div>
              {index < forwardStages.length - 1 && (
                <div className={cn('mx-2 h-0.5 w-10 flex-shrink-0', reached ? 'bg-blue-600' : 'bg-gray-200')} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function InterviewsTab({ interviews }: { interviews: InterviewRow[] }) {
  if (interviews.length === 0) {
    return (
      <div className={cardClass}>
        <p className="py-8 text-center text-sm text-gray-500">No interviews scheduled yet.</p>
      </div>
    )
  }

  return (
    <div className={cardClass}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              {['Type', 'Status', 'Date', 'Interviewers', 'Feedback'].map((h) => (
                <th key={h} className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {interviews.map((interview) => {
              const interviewerCount = interview.interviewers?.length ?? 0
              const submittedCount = (interview.scorecards ?? []).filter((s) => s.status === 'submitted').length
              return (
                <tr key={interview.id}>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {INTERVIEW_TYPE_LABELS[interview.interview_type as InterviewType] ?? interview.interview_type}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={cn(
                        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                        INTERVIEW_STATUS_COLORS[interview.status as InterviewStatus] ?? 'bg-gray-100 text-gray-800'
                      )}
                    >
                      {INTERVIEW_STATUS_LABELS[interview.status as InterviewStatus] ?? interview.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{formatDateTime(interview.scheduled_start)}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {interviewerCount > 0
                      ? interview.interviewers!.map((i) => `${i.user?.first_name} ${i.user?.last_name}`).join(', ')
                      : '—'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {interviewerCount > 0 ? `${submittedCount}/${interviewerCount} submitted` : '—'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function FeedbackTab({ scorecards }: { scorecards: ScorecardRow[] }) {
  const submitted = scorecards.filter((s) => s.status === 'submitted')

  if (submitted.length === 0) {
    return (
      <div className={cardClass}>
        <p className="py-8 text-center text-sm text-gray-500">No feedback submitted yet.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {submitted.map((sc) => (
        <div key={sc.id} className={cardClass}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-sm font-medium text-gray-900">
                {sc.reviewer ? `${sc.reviewer.first_name} ${sc.reviewer.last_name}` : 'Unknown reviewer'}
              </p>
              <p className="text-xs text-gray-400">{formatDateTime(sc.submitted_at)}</p>
            </div>
            <div className="flex items-center gap-2">
              {sc.overall_recommendation && (
                <span
                  className={cn(
                    'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                    RECOMMENDATION_COLORS[sc.overall_recommendation as RecommendationType] ??
                      'bg-gray-100 text-gray-800'
                  )}
                >
                  {RECOMMENDATION_LABELS[sc.overall_recommendation as RecommendationType] ?? sc.overall_recommendation}
                </span>
              )}
              {sc.overall_score !== null && (
                <span className="text-sm font-medium text-gray-700">{sc.overall_score}/5</span>
              )}
            </div>
          </div>
          {(sc.strengths || sc.concerns) && (
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {sc.strengths && (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Strengths</p>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-gray-700">{sc.strengths}</p>
                </div>
              )}
              {sc.concerns && (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Concerns</p>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-gray-700">{sc.concerns}</p>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function ActivityTab({ stageHistory }: { stageHistory: StageHistoryRow[] }) {
  if (stageHistory.length === 0) {
    return (
      <div className={cardClass}>
        <p className="py-8 text-center text-sm text-gray-500">No stage changes recorded yet.</p>
      </div>
    )
  }

  return (
    <div className={cardClass}>
      <ul className="space-y-4">
        {stageHistory.map((entry) => (
          <li key={entry.id} className="flex gap-3 border-l-2 border-gray-200 pl-4">
            <div>
              <p className="text-sm text-gray-900">
                {entry.from_stage ? (
                  <>
                    <span className="font-medium">{entry.from_stage.name}</span> →{' '}
                  </>
                ) : null}
                <span className="font-medium">{entry.to_stage?.name ?? '—'}</span>
                {entry.changed_by_user ? (
                  <span className="text-gray-500">
                    {' '}
                    by {entry.changed_by_user.first_name} {entry.changed_by_user.last_name}
                  </span>
                ) : null}
              </p>
              {entry.notes && <p className="mt-0.5 text-sm text-gray-500">{entry.notes}</p>}
              <p className="text-xs text-gray-400">{formatDateTime(entry.changed_at)}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

function RecruiterNotes({
  applicationId,
  notes,
  onAdded,
}: {
  applicationId: string
  notes: RecruiterNoteRow[]
  onAdded: () => void
}) {
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleAdd() {
    if (!note.trim()) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch(`/api/applications/${applicationId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: note.trim() }),
      })
      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        setError(json.error?.message ?? 'Failed to add note')
        return
      }
      setNote('')
      onAdded()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={cardClass}>
      <h2 className="text-base font-semibold text-gray-900">Recruiter Notes</h2>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          placeholder="Add a note for the recruiting team…"
          className={cn(inputClass, 'sm:flex-1')}
        />
        <button
          type="button"
          onClick={() => void handleAdd()}
          disabled={submitting || !note.trim()}
          className={cn(primaryButtonClass, 'self-start')}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Note
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      {notes.length === 0 ? (
        <p className="mt-4 text-sm text-gray-500">No notes yet.</p>
      ) : (
        <ul className="mt-4 space-y-4">
          {notes.map((n) => (
            <li key={n.id} className="border-t border-gray-100 pt-4 first:border-t-0 first:pt-0">
              <p className="text-sm text-gray-700">{n.note}</p>
              <p className="mt-1 text-xs text-gray-400">
                {n.author ? `${n.author.first_name} ${n.author.last_name}` : 'Unknown'} · {formatDateTime(n.created_at)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
