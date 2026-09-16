'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  AlertCircle,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock,
  FileEdit,
  FileText,
  Loader2,
  MapPin,
  Pencil,
  Repeat,
  Users,
  Video,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  EMPLOYMENT_TYPE_LABELS,
  INTERVIEW_STATUS_COLORS,
  INTERVIEW_STATUS_LABELS,
  INTERVIEW_TYPE_LABELS,
  OFFER_STATUS_COLORS,
  OFFER_STATUS_LABELS,
  REQUISITION_STATUS_COLORS,
  REQUISITION_STATUS_LABELS,
} from '@/lib/constants'
import type { RequisitionStatus } from '@/types/database'
import { RequisitionForm, requisitionToFormValues } from './requisition-form'
import type {
  PipelineStageColumn,
  RequisitionAuditLogRow,
  RequisitionInterviewRow,
  RequisitionOfferRow,
  RequisitionReferenceData,
  RequisitionRecord,
  RequisitionStageHistoryRow,
} from './types'

// ---------------------------------------------------------------------------
// Status transitions (mirrors src/app/api/requisitions/[id]/status/route.ts)
// ---------------------------------------------------------------------------

const VALID_TRANSITIONS: Record<RequisitionStatus, RequisitionStatus[]> = {
  draft: ['pending_approval', 'cancelled'],
  pending_approval: ['approved', 'draft', 'cancelled'],
  approved: ['open', 'cancelled'],
  open: ['on_hold', 'closed', 'cancelled'],
  on_hold: ['open', 'closed', 'cancelled'],
  closed: [],
  cancelled: [],
}

const STATUS_ACTION_LABELS: Record<RequisitionStatus, string> = {
  draft: 'Return to Draft',
  pending_approval: 'Submit for Approval',
  approved: 'Approve',
  open: 'Open Requisition',
  on_hold: 'Put On Hold',
  closed: 'Close Requisition',
  cancelled: 'Cancel Requisition',
}

const TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'pipeline', label: 'Pipeline' },
  { key: 'interviews', label: 'Interviews' },
  { key: 'offers', label: 'Offers' },
  { key: 'activity', label: 'Activity' },
] as const

type TabKey = (typeof TABS)[number]['key']

// ---------------------------------------------------------------------------
// Formatting helpers
// ---------------------------------------------------------------------------

function formatDate(value: string | null | undefined) {
  if (!value) return null
  try {
    return new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  } catch {
    return value
  }
}

function formatDateTime(value: string | null | undefined) {
  if (!value) return null
  try {
    return new Date(value).toLocaleString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return value
  }
}

function formatMoney(amount: number | null | undefined, currency: string) {
  if (amount == null) return null
  try {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(amount)
  } catch {
    return `${currency} ${amount.toLocaleString()}`
  }
}

function salaryRangeLabel(r: RequisitionRecord) {
  const min = formatMoney(r.salary_min, r.currency)
  const max = formatMoney(r.salary_max, r.currency)
  if (min && max) return `${min} – ${max}`
  if (min) return `From ${min}`
  if (max) return `Up to ${max}`
  return null
}

function userName(u: { first_name: string; last_name: string } | null | undefined) {
  return u ? `${u.first_name} ${u.last_name}` : null
}

// ---------------------------------------------------------------------------
// Small presentational building blocks
// ---------------------------------------------------------------------------

function StatusBadge({ status }: { status: RequisitionStatus }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium',
        REQUISITION_STATUS_COLORS[status] ?? 'bg-gray-100 text-gray-700'
      )}
    >
      {REQUISITION_STATUS_LABELS[status] ?? status}
    </span>
  )
}

function DetailItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">{label}</dt>
      <dd className="mt-1 text-sm text-gray-900">{value ?? <span className="text-gray-400">—</span>}</dd>
    </div>
  )
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">{title}</h2>
      <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</dl>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

interface RequisitionDetailProps {
  requisition: RequisitionRecord
  pipeline: PipelineStageColumn[]
  interviews: RequisitionInterviewRow[]
  offers: RequisitionOfferRow[]
  stageHistory: RequisitionStageHistoryRow[]
  auditLog: RequisitionAuditLogRow[]
  referenceData: RequisitionReferenceData
}

export function RequisitionDetail({
  requisition: initialRequisition,
  pipeline,
  interviews,
  offers,
  stageHistory,
  auditLog,
  referenceData,
}: RequisitionDetailProps) {
  const router = useRouter()
  const [requisition, setRequisition] = useState<RequisitionRecord>(initialRequisition)
  const [activeTab, setActiveTab] = useState<TabKey>('overview')
  const [isEditing, setIsEditing] = useState(false)
  const [statusMenuOpen, setStatusMenuOpen] = useState(false)
  const [statusUpdating, setStatusUpdating] = useState<RequisitionStatus | null>(null)
  const [statusError, setStatusError] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!statusMenuOpen) return
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setStatusMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [statusMenuOpen])

  const nextStatuses = VALID_TRANSITIONS[requisition.status] ?? []
  const totalCandidates = useMemo(
    () => pipeline.reduce((sum, stage) => sum + stage.applications.length, 0),
    [pipeline]
  )

  async function handleStatusChange(next: RequisitionStatus) {
    setStatusMenuOpen(false)
    setStatusError(null)
    setStatusUpdating(next)

    try {
      const res = await fetch(`/api/requisitions/${requisition.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => null)
        throw new Error(body?.error ?? 'Failed to update status')
      }

      const updated = await res.json()
      setRequisition((prev) => ({ ...prev, ...updated }))
      router.refresh()
    } catch (err) {
      setStatusError(err instanceof Error ? err.message : 'Failed to update status')
    } finally {
      setStatusUpdating(null)
    }
  }

  if (isEditing) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Edit Requisition</h1>
          <p className="mt-1 text-sm text-gray-500">{requisition.reference_number}</p>
        </div>
        <RequisitionForm
          mode="edit"
          requisitionId={requisition.id}
          initialValues={requisitionToFormValues(requisition)}
          referenceData={referenceData}
          onCancel={() => setIsEditing(false)}
          onSaved={(updated) => {
            setRequisition((prev) => ({ ...prev, ...updated }))
            setIsEditing(false)
            router.refresh()
          }}
        />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-gray-200 pb-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold text-gray-900">{requisition.title}</h1>
            <StatusBadge status={requisition.status} />
          </div>
          <p className="mt-1 text-sm text-gray-500">{requisition.reference_number}</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50"
          >
            <Pencil className="h-4 w-4" />
            Edit
          </button>

          {nextStatuses.length > 0 && (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setStatusMenuOpen((open) => !open)}
                disabled={statusUpdating !== null}
                className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {statusUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                Change Status
                <ChevronDown className="h-4 w-4" />
              </button>

              {statusMenuOpen && (
                <div className="absolute right-0 z-10 mt-2 w-56 rounded-md border border-gray-200 bg-white py-1 shadow-lg">
                  {nextStatuses.map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => handleStatusChange(status)}
                      className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                    >
                      {STATUS_ACTION_LABELS[status]}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {statusError && (
        <div className="mt-4 flex items-start gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <span>{statusError}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="mt-6 border-b border-gray-200">
        <nav className="-mb-px flex gap-6 overflow-x-auto">
          {TABS.map((tab) => {
            const count =
              tab.key === 'pipeline'
                ? totalCandidates
                : tab.key === 'interviews'
                  ? interviews.length
                  : tab.key === 'offers'
                    ? offers.length
                    : tab.key === 'activity'
                      ? stageHistory.length + auditLog.length
                      : null

            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'whitespace-nowrap border-b-2 px-1 py-3 text-sm font-medium',
                  activeTab === tab.key
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                )}
              >
                {tab.label}
                {count !== null && <span className="ml-1.5 text-xs text-gray-400">({count})</span>}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab panels */}
      <div className="mt-6">
        {activeTab === 'overview' && <OverviewTab requisition={requisition} />}
        {activeTab === 'pipeline' && <PipelineTab pipeline={pipeline} />}
        {activeTab === 'interviews' && <InterviewsTab interviews={interviews} />}
        {activeTab === 'offers' && <OffersTab offers={offers} />}
        {activeTab === 'activity' && <ActivityTab stageHistory={stageHistory} auditLog={auditLog} />}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Overview
// ---------------------------------------------------------------------------

function OverviewTab({ requisition: r }: { requisition: RequisitionRecord }) {
  return (
    <div className="space-y-6">
      <Card title="Basic Information">
        <div className="sm:col-span-2">
          <DetailItem label="Description" value={r.description} />
        </div>
        <DetailItem label="Employment Type" value={EMPLOYMENT_TYPE_LABELS[r.employment_type] ?? r.employment_type} />
        <DetailItem label="FTE" value={r.fte} />
        <DetailItem label="Vacancy Count" value={r.vacancy_count} />
        <DetailItem label="Replacement Hire" value={r.is_replacement ? 'Yes' : 'No'} />
      </Card>

      <Card title="Organisation">
        <DetailItem label="Department" value={r.department?.name} />
        <DetailItem
          label="Location"
          value={r.location ? [r.location.name, r.location.city, r.location.country].filter(Boolean).join(', ') : null}
        />
        <DetailItem label="Cost Centre" value={r.cost_centre?.name} />
        <DetailItem label="Job Profile" value={r.job_profile?.name} />
        <DetailItem label="Position" value={r.position?.title} />
      </Card>

      <Card title="People">
        <DetailItem label="Hiring Manager" value={userName(r.hiring_manager)} />
        <DetailItem label="Lead Recruiter" value={userName(r.lead_recruiter)} />
      </Card>

      <Card title="Compensation">
        <DetailItem label="Grade" value={r.grade?.name} />
        <DetailItem label="Salary Range" value={salaryRangeLabel(r)} />
        <DetailItem label="Currency" value={r.currency} />
      </Card>

      <Card title="Additional">
        <div className="sm:col-span-2">
          <DetailItem label="Reason for Hire" value={r.reason_for_hire} />
        </div>
        <DetailItem label="Target Start Date" value={formatDate(r.target_start_date)} />
        <DetailItem label="Requested Date" value={formatDate(r.requested_date)} />
        <DetailItem label="Approved Date" value={formatDate(r.approved_date)} />
        <DetailItem label="Opened Date" value={formatDate(r.opened_date)} />
        <DetailItem label="Closed Date" value={formatDate(r.closed_date)} />
        <div className="sm:col-span-2">
          <DetailItem label="Internal Notes" value={r.internal_notes} />
        </div>
      </Card>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Pipeline (simplified kanban board)
// ---------------------------------------------------------------------------

function PipelineTab({ pipeline }: { pipeline: PipelineStageColumn[] }) {
  if (pipeline.length === 0 || pipeline.every((s) => s.applications.length === 0)) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white py-16 text-center">
        <Users className="h-10 w-10 text-gray-300" />
        <p className="mt-4 text-sm font-medium text-gray-900">No candidates in the pipeline yet</p>
      </div>
    )
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {pipeline.map((stage) => (
        <div key={stage.id} className="w-72 flex-shrink-0 rounded-lg border border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between border-b border-gray-200 px-3 py-2">
            <p className="text-sm font-medium text-gray-700">{stage.name}</p>
            <span className="rounded-full bg-white px-2 py-0.5 text-xs font-medium text-gray-500 shadow-sm">
              {stage.applications.length}
            </span>
          </div>
          <div className="space-y-2 p-2">
            {stage.applications.length === 0 && (
              <p className="px-2 py-4 text-center text-xs text-gray-400">No candidates</p>
            )}
            {stage.applications.map((app) => (
              <div key={app.id} className="rounded-md border border-gray-200 bg-white p-3 shadow-sm">
                <p className="text-sm font-medium text-gray-900">
                  {app.candidate ? `${app.candidate.first_name} ${app.candidate.last_name}` : 'Unknown candidate'}
                </p>
                {app.candidate?.current_job_title && (
                  <p className="mt-0.5 text-xs text-gray-500">{app.candidate.current_job_title}</p>
                )}
                <div className="mt-2 flex items-center justify-between text-xs text-gray-400">
                  <span>Applied {formatDate(app.application_date)}</span>
                </div>
                {app.assigned_recruiter && (
                  <p className="mt-1 text-xs text-gray-400">
                    Recruiter: {app.assigned_recruiter.first_name} {app.assigned_recruiter.last_name}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Interviews
// ---------------------------------------------------------------------------

function InterviewsTab({ interviews }: { interviews: RequisitionInterviewRow[] }) {
  if (interviews.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white py-16 text-center">
        <Calendar className="h-10 w-10 text-gray-300" />
        <p className="mt-4 text-sm font-medium text-gray-900">No interviews scheduled</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {interviews.map((interview) => {
        const statusKey = interview.status as keyof typeof INTERVIEW_STATUS_COLORS
        const typeKey = interview.interview_type as keyof typeof INTERVIEW_TYPE_LABELS
        const candidate = interview.application?.candidate
        const interviewers = interview.interviewers?.map((i) => i.user).filter(Boolean) ?? []

        return (
          <div key={interview.id} className="rounded-lg border bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-medium text-gray-900">
                  {candidate ? `${candidate.first_name} ${candidate.last_name}` : 'Unknown candidate'}
                </p>
                <p className="text-sm text-gray-500">{INTERVIEW_TYPE_LABELS[typeKey] ?? interview.interview_type}</p>
              </div>
              <span
                className={cn(
                  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                  INTERVIEW_STATUS_COLORS[statusKey] ?? 'bg-gray-100 text-gray-700'
                )}
              >
                {INTERVIEW_STATUS_LABELS[statusKey] ?? interview.status}
              </span>
            </div>

            <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-600">
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-gray-400" />
                {formatDateTime(interview.scheduled_start)}
              </span>
              {interview.location_type === 'remote' && interview.meeting_url ? (
                <span className="inline-flex items-center gap-1.5">
                  <Video className="h-4 w-4 text-gray-400" />
                  Remote
                </span>
              ) : interview.location ? (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  {interview.location}
                </span>
              ) : null}
              {interviewers.length > 0 && (
                <span className="inline-flex items-center gap-1.5">
                  <Users className="h-4 w-4 text-gray-400" />
                  {interviewers.map((u) => `${u!.first_name} ${u!.last_name}`).join(', ')}
                </span>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Offers
// ---------------------------------------------------------------------------

function OffersTab({ offers }: { offers: RequisitionOfferRow[] }) {
  if (offers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white py-16 text-center">
        <FileText className="h-10 w-10 text-gray-300" />
        <p className="mt-4 text-sm font-medium text-gray-900">No offers made yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {offers.map((offer) => {
        const statusKey = offer.status as keyof typeof OFFER_STATUS_COLORS
        const candidate = offer.application?.candidate

        return (
          <div key={offer.id} className="rounded-lg border bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-medium text-gray-900">
                  {candidate ? `${candidate.first_name} ${candidate.last_name}` : 'Unknown candidate'}
                </p>
                <p className="text-sm text-gray-500">{offer.job_title}</p>
              </div>
              <span
                className={cn(
                  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                  OFFER_STATUS_COLORS[statusKey] ?? 'bg-gray-100 text-gray-700'
                )}
              >
                {OFFER_STATUS_LABELS[statusKey] ?? offer.status}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-600">
              <span>{formatMoney(offer.salary, offer.currency)}</span>
              {offer.proposed_start_date && <span>Start: {formatDate(offer.proposed_start_date)}</span>}
              <span className="text-gray-400">Created {formatDate(offer.created_at)}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Activity (audit log + stage history, merged into a single timeline)
// ---------------------------------------------------------------------------

interface TimelineEntry {
  id: string
  date: string
  icon: React.ComponentType<{ className?: string }>
  title: string
  description?: string | null
  actor?: string | null
}

function ActivityTab({
  stageHistory,
  auditLog,
}: {
  stageHistory: RequisitionStageHistoryRow[]
  auditLog: RequisitionAuditLogRow[]
}) {
  const entries: TimelineEntry[] = useMemo(() => {
    const fromAudit: TimelineEntry[] = auditLog.map((log) => ({
      id: `audit-${log.id}`,
      date: log.created_at,
      icon: FileEdit,
      title: log.action.replace(/[._]/g, ' '),
      actor: log.user ? `${log.user.first_name} ${log.user.last_name}` : null,
    }))

    const fromStages: TimelineEntry[] = stageHistory.map((h) => ({
      id: `stage-${h.id}`,
      date: h.changed_at,
      icon: Repeat,
      title: `${h.application?.candidate ? `${h.application.candidate.first_name} ${h.application.candidate.last_name}` : 'A candidate'} moved ${
        h.from_stage ? `from ${h.from_stage.name} ` : ''
      }to ${h.to_stage?.name ?? 'a new stage'}`,
      description: h.notes,
      actor: h.changed_by_user ? `${h.changed_by_user.first_name} ${h.changed_by_user.last_name}` : null,
    }))

    return [...fromAudit, ...fromStages].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [stageHistory, auditLog])

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white py-16 text-center">
        <CheckCircle2 className="h-10 w-10 text-gray-300" />
        <p className="mt-4 text-sm font-medium text-gray-900">No activity recorded yet</p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm">
      <ul className="space-y-6">
        {entries.map((entry, idx) => {
          const Icon = entry.icon
          return (
            <li key={entry.id} className="relative flex gap-3">
              {idx < entries.length - 1 && (
                <span className="absolute left-3.5 top-8 h-full w-px bg-gray-200" aria-hidden />
              )}
              <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                <Icon className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1 pb-1">
                <p className="text-sm capitalize text-gray-900">{entry.title}</p>
                {entry.description && <p className="mt-0.5 text-sm text-gray-500">{entry.description}</p>}
                <p className="mt-1 text-xs text-gray-400">
                  {formatDateTime(entry.date)}
                  {entry.actor ? ` · ${entry.actor}` : ''}
                </p>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
