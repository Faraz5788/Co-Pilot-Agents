'use client'

import { useEffect, useState } from 'react'
import {
  Briefcase,
  Building,
  Calendar,
  CircleCheckBig,
  CircleX,
  Clock,
  DollarSign,
  Loader,
  Pencil,
  Send,
  Trash,
  User,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import {
  APPROVAL_STATUS_COLORS,
  APPROVAL_STATUS_LABELS,
  EMPLOYMENT_TYPE_LABELS,
  OFFER_STATUS_COLORS,
  OFFER_STATUS_LABELS,
} from '@/lib/constants'
import type { ApprovalStatus, EmploymentType, OfferStatus } from '@/types/database'

interface PersonRef {
  first_name: string
  last_name: string
  email?: string
  candidate_number?: string
}

export interface OfferRecord {
  id: string
  application_id: string
  status: OfferStatus
  job_title: string
  grade_id: string | null
  location_id: string | null
  employment_type: EmploymentType
  salary: number
  currency: string
  fte: number
  proposed_start_date: string | null
  bonus: string | null
  additional_terms: string | null
  created_by: string | null
  created_at: string
  updated_at: string
  application?: {
    id: string
    candidate?: PersonRef | null
    requisition?: { title: string; reference_number?: string } | null
  } | null
  grade?: { id: string; name: string } | null
  location?: { id: string; name: string; city?: string | null; country?: string | null } | null
}

interface ApprovalRecord {
  id: string
  approver_id: string
  status: ApprovalStatus
  requested_at: string
  responded_at: string | null
  comments: string | null
  approver?: { first_name: string; last_name: string } | null
}

interface HistoryEntry {
  id: string
  action: string
  created_at: string
  old_values: Record<string, unknown> | null
  new_values: Record<string, unknown> | null
}

export interface OfferApprover {
  id: string
  first_name: string
  last_name: string
}

export interface OfferDetailProps {
  offer: OfferRecord
  currentUserId: string | null
  approvers: OfferApprover[]
  onEdit?: () => void
  onChanged?: () => void
  onClose?: () => void
}

function formatMoney(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(amount)
  } catch {
    return `${currency} ${amount.toLocaleString()}`
  }
}

export function OfferDetail({ offer, currentUserId, approvers, onEdit, onChanged, onClose }: OfferDetailProps) {
  const [approval, setApproval] = useState<ApprovalRecord | null>(null)
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [loadingContext, setLoadingContext] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [approverId, setApproverId] = useState('')
  const [comments, setComments] = useState('')

  useEffect(() => {
    let cancelled = false

    async function loadContext() {
      setLoadingContext(true)
      const supabase = createClient()

      const [{ data: approvalRows }, { data: historyRows }] = await Promise.all([
        supabase
          .from('approvals')
          .select('*, approver:users(first_name, last_name)')
          .eq('object_type', 'offer')
          .eq('object_id', offer.id)
          .order('requested_at', { ascending: false })
          .limit(1),
        supabase
          .from('audit_log')
          .select('id, action, created_at, old_values, new_values')
          .eq('entity_type', 'offer')
          .eq('entity_id', offer.id)
          .order('created_at', { ascending: false })
          .limit(20),
      ])

      if (!cancelled) {
        setApproval((approvalRows?.[0] as ApprovalRecord | undefined) ?? null)
        setHistory((historyRows as HistoryEntry[] | null) ?? [])
        setLoadingContext(false)
      }
    }

    void loadContext()
    return () => {
      cancelled = true
    }
  }, [offer.id, offer.status])

  async function callApi(path: string, body: Record<string, unknown>, method: 'PATCH' | 'POST' = 'PATCH') {
    setBusy(true)
    setError(null)
    try {
      const response = await fetch(path, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!response.ok) {
        const data = await response.json().catch(() => null)
        throw new Error(data?.error ?? 'Request failed')
      }
      onChanged?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed')
    } finally {
      setBusy(false)
    }
  }

  const isApprover = Boolean(currentUserId) && approval?.approver_id === currentUserId

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="flex items-start justify-between gap-4 border-b border-gray-200 px-6 py-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-gray-900">{offer.job_title}</h2>
            <span
              className={cn(
                'inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium',
                OFFER_STATUS_COLORS[offer.status]
              )}
            >
              {OFFER_STATUS_LABELS[offer.status]}
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            {offer.application?.candidate
              ? `${offer.application.candidate.first_name} ${offer.application.candidate.last_name}`
              : 'Unknown candidate'}
            {' — '}
            {offer.application?.requisition?.title ?? 'Unknown requisition'}
          </p>
        </div>
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        ) : null}
      </div>

      <div className="space-y-6 px-6 py-5">
        {error ? (
          <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
        ) : null}

        {offer.status === 'accepted' ? (
          <div className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-800">
            <CircleCheckBig className="h-5 w-5 shrink-0" />
            <p className="text-sm font-medium">
              This offer has been accepted. Candidate onboarding can now proceed.
            </p>
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <DollarSign className="h-4 w-4 shrink-0 text-gray-400" />
            {formatMoney(offer.salary, offer.currency)} &middot; {offer.fte} FTE
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <Briefcase className="h-4 w-4 shrink-0 text-gray-400" />
            {EMPLOYMENT_TYPE_LABELS[offer.employment_type]}
            {offer.grade?.name ? ` — Grade ${offer.grade.name}` : ''}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <Building className="h-4 w-4 shrink-0 text-gray-400" />
            {offer.location
              ? [offer.location.name, offer.location.city].filter(Boolean).join(', ')
              : 'No location set'}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <Calendar className="h-4 w-4 shrink-0 text-gray-400" />
            {offer.proposed_start_date
              ? `Starts ${new Date(offer.proposed_start_date).toLocaleDateString(undefined, { dateStyle: 'medium' })}`
              : 'No start date set'}
          </div>
          {offer.bonus ? (
            <div className="flex items-center gap-2 text-sm text-gray-700 sm:col-span-2">
              <User className="h-4 w-4 shrink-0 text-gray-400" />
              Bonus: {offer.bonus}
            </div>
          ) : null}
        </div>

        {offer.additional_terms ? (
          <div>
            <h3 className="mb-1 text-sm font-semibold text-gray-900">Additional Terms</h3>
            <p className="whitespace-pre-line text-sm text-gray-600">{offer.additional_terms}</p>
          </div>
        ) : null}

        <div className="rounded-lg border border-gray-200 p-4">
          <h3 className="mb-2 text-sm font-semibold text-gray-900">Approval</h3>
          {loadingContext ? (
            <p className="text-sm text-gray-400">Loading...</p>
          ) : approval ? (
            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'inline-flex rounded-full px-2 py-0.5 text-xs font-medium',
                    APPROVAL_STATUS_COLORS[approval.status]
                  )}
                >
                  {APPROVAL_STATUS_LABELS[approval.status]}
                </span>
                <span>
                  Approver:{' '}
                  {approval.approver
                    ? `${approval.approver.first_name} ${approval.approver.last_name}`
                    : 'Unknown'}
                </span>
              </div>
              {approval.comments ? <p>Comments: {approval.comments}</p> : null}
            </div>
          ) : (
            <p className="text-sm text-gray-400">No approval requested yet.</p>
          )}
        </div>

        {history.length > 0 ? (
          <div>
            <h3 className="mb-2 text-sm font-semibold text-gray-900">Status Change History</h3>
            <ul className="space-y-2 border-l border-gray-200 pl-4">
              {history.map((entry) => (
                <li key={entry.id} className="text-sm text-gray-600">
                  <span className="flex items-center gap-1.5 font-medium text-gray-800">
                    <Clock className="h-3.5 w-3.5 text-gray-400" />
                    {entry.action.replace(/_/g, ' ')}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(entry.created_at).toLocaleString(undefined, {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="flex flex-wrap items-center gap-3 border-t border-gray-200 pt-4">
          {offer.status === 'draft' ? (
            <>
              {onEdit ? (
                <button
                  type="button"
                  onClick={onEdit}
                  className="flex items-center gap-2 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <Pencil className="h-4 w-4" /> Edit
                </button>
              ) : null}

              <div className="flex items-center gap-2">
                <select
                  value={approverId}
                  onChange={(e) => setApproverId(e.target.value)}
                  className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                >
                  <option value="">Select approver...</option>
                  {approvers.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.first_name} {a.last_name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  disabled={busy || !approverId}
                  onClick={() =>
                    callApi(`/api/offers/${offer.id}/status`, {
                      status: 'pending_approval',
                      approver_id: approverId,
                    })
                  }
                  className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {busy ? <Loader className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Submit for Approval
                </button>
              </div>

              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  if (confirm('This will withdraw the draft offer. Continue?')) {
                    void callApi(`/api/offers/${offer.id}/status`, { status: 'withdrawn' })
                  }
                }}
                className="ml-auto flex items-center gap-2 rounded-md border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
              >
                <Trash className="h-4 w-4" /> Delete
              </button>
            </>
          ) : null}

          {offer.status === 'pending_approval' && isApprover ? (
            <>
              <input
                type="text"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Comments (optional)"
                className="min-w-[220px] flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
              />
              <button
                type="button"
                disabled={busy}
                onClick={() => callApi(`/api/offers/${offer.id}/approve`, { comments }, 'POST')}
                className="flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <CircleCheckBig className="h-4 w-4" /> Approve
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => callApi(`/api/offers/${offer.id}/reject`, { comments }, 'POST')}
                className="flex items-center gap-2 rounded-md border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <CircleX className="h-4 w-4" /> Reject
              </button>
            </>
          ) : null}

          {offer.status === 'approved' ? (
            <button
              type="button"
              disabled={busy}
              onClick={() => callApi(`/api/offers/${offer.id}/status`, { status: 'sent' })}
              className="flex items-center gap-2 rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy ? <Loader className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Mark as Sent
            </button>
          ) : null}

          {offer.status === 'sent' ? (
            <>
              <button
                type="button"
                disabled={busy}
                onClick={() => callApi(`/api/offers/${offer.id}/status`, { status: 'accepted' })}
                className="flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <CircleCheckBig className="h-4 w-4" /> Mark as Accepted
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => callApi(`/api/offers/${offer.id}/status`, { status: 'declined' })}
                className="flex items-center gap-2 rounded-md border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <CircleX className="h-4 w-4" /> Mark as Declined
              </button>
            </>
          ) : null}
        </div>
      </div>
    </div>
  )
}
