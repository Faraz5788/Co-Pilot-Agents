'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Briefcase,
  Download,
  ExternalLink,
  FileText,
  Mail,
  MapPin,
  Phone,
  Plus,
  Upload,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { APPLICATION_STATUS_COLORS, APPLICATION_STATUS_LABELS } from '@/lib/constants'
import type { ApplicationStatus } from '@/types/database'
import { StageBadge } from '@/components/applications/stage-badge'
import { CandidateForm, type CandidateFormValues } from '@/components/candidates/candidate-form'

interface Source {
  id: string
  name: string
  category: string | null
}

interface CandidateApplicationRow {
  id: string
  application_status: string
  application_date: string
  current_stage: { id: string; name: string; stage_type: string } | null
  requisition: { id: string; title: string; reference_number: string; status: string } | null
}

interface CandidateRow {
  id: string
  candidate_number: string
  first_name: string
  middle_name: string | null
  last_name: string
  preferred_name: string | null
  email: string
  phone: string | null
  location: string | null
  linkedin_url: string | null
  source_id: string | null
  current_employer: string | null
  current_job_title: string | null
  notice_period: string | null
  salary_expectation: number | null
  currency: string | null
  right_to_work_status: string | null
  consent_given: boolean
  consent_date: string | null
  created_at: string
  updated_at: string
  source: Source | null
  applications: CandidateApplicationRow[] | null
}

interface CandidateDocumentRow {
  id: string
  document_type: string
  filename: string
  mime_type: string
  file_size: number | null
  uploaded_at: string
  uploaded_by_user?: { first_name: string; last_name: string } | null
}

interface AuditLogRow {
  id: string
  action: string
  entity_type: string
  created_at: string
  new_values: Record<string, unknown> | null
  user: { id: string; first_name: string; last_name: string; email: string } | null
}

interface OpenRequisitionRow {
  id: string
  reference_number: string
  title: string
  status: string
}

interface CandidateDetailProps {
  candidate: CandidateRow
  documents: CandidateDocumentRow[]
  activity: AuditLogRow[]
  openRequisitions: OpenRequisitionRow[]
  sources: Source[]
}

const cardClass = 'rounded-lg border border-gray-200 bg-white shadow-sm p-6'
const inputClass =
  'w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
const primaryButtonClass =
  'inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-60'
const secondaryButtonClass =
  'inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50'

const TABS = ['Overview', 'CV/Documents', 'Applications', 'Activity'] as const
type Tab = (typeof TABS)[number]

const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  cv: 'CV',
  cover_letter: 'Cover Letter',
  certificate: 'Certificate',
  reference: 'Reference',
  other: 'Other',
}

function formatDate(value: string | null) {
  if (!value) return '—'
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

function formatFileSize(bytes: number | null) {
  if (!bytes) return ''
  const kb = bytes / 1024
  if (kb < 1024) return `${kb.toFixed(0)} KB`
  return `${(kb / 1024).toFixed(1)} MB`
}

function humanizeAction(action: string) {
  return action
    .split('.')
    .join(' ')
    .split('_')
    .join(' ')
}

export function CandidateDetail({ candidate, documents, activity, openRequisitions, sources }: CandidateDetailProps) {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('Overview')
  const [editing, setEditing] = useState(false)
  const [showAddApplication, setShowAddApplication] = useState(false)

  const fullName = [candidate.first_name, candidate.last_name].filter(Boolean).join(' ')

  if (editing) {
    const initial: Partial<CandidateFormValues> & { id: string } = {
      id: candidate.id,
      first_name: candidate.first_name,
      middle_name: candidate.middle_name ?? '',
      last_name: candidate.last_name,
      preferred_name: candidate.preferred_name ?? '',
      email: candidate.email,
      phone: candidate.phone ?? '',
      location: candidate.location ?? '',
      linkedin_url: candidate.linkedin_url ?? '',
      source_id: candidate.source_id ?? '',
      current_employer: candidate.current_employer ?? '',
      current_job_title: candidate.current_job_title ?? '',
      notice_period: candidate.notice_period ?? '',
      salary_expectation: candidate.salary_expectation ? String(candidate.salary_expectation) : '',
      currency: candidate.currency ?? '',
      right_to_work_status: candidate.right_to_work_status ?? '',
    }

    return (
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Edit Candidate</h1>
          <button type="button" onClick={() => setEditing(false)} className={secondaryButtonClass}>
            <X className="mr-2 h-4 w-4" />
            Close
          </button>
        </div>
        <CandidateForm sources={sources} candidate={initial} />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className={cn(cardClass, 'flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between')}>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-gray-900">{fullName}</h1>
            <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
              {candidate.candidate_number}
            </span>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
            {candidate.current_job_title && (
              <span className="flex items-center gap-1">
                <Briefcase className="h-4 w-4" />
                {candidate.current_job_title}
                {candidate.current_employer ? ` at ${candidate.current_employer}` : ''}
              </span>
            )}
            {candidate.location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {candidate.location}
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={() => setEditing(true)} className={secondaryButtonClass}>
            Edit
          </button>
          <button type="button" onClick={() => setShowAddApplication(true)} className={primaryButtonClass}>
            <Plus className="mr-2 h-4 w-4" />
            Add Application
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-6 border-b border-gray-200">
        <nav className="-mb-px flex gap-6">
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
              <h2 className="text-base font-semibold text-gray-900">Contact Information</h2>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <dt className="sr-only">Email</dt>
                  <dd className="text-gray-700">{candidate.email}</dd>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <dt className="sr-only">Phone</dt>
                  <dd className="text-gray-700">{candidate.phone || '—'}</dd>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <dt className="sr-only">Location</dt>
                  <dd className="text-gray-700">{candidate.location || '—'}</dd>
                </div>
                {candidate.linkedin_url && (
                  <div className="flex items-center gap-2">
                    <ExternalLink className="h-4 w-4 text-gray-400" />
                    <dd>
                      <a
                        href={candidate.linkedin_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        LinkedIn Profile
                      </a>
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            <div className={cardClass}>
              <h2 className="text-base font-semibold text-gray-900">Employment</h2>
              <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="text-gray-500">Current Employer</dt>
                  <dd className="mt-0.5 text-gray-900">{candidate.current_employer || '—'}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Current Job Title</dt>
                  <dd className="mt-0.5 text-gray-900">{candidate.current_job_title || '—'}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Notice Period</dt>
                  <dd className="mt-0.5 text-gray-900">{candidate.notice_period || '—'}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Salary Expectation</dt>
                  <dd className="mt-0.5 text-gray-900">
                    {candidate.salary_expectation
                      ? `${candidate.salary_expectation.toLocaleString()} ${candidate.currency ?? ''}`
                      : '—'}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500">Right to Work</dt>
                  <dd className="mt-0.5 text-gray-900">{candidate.right_to_work_status || '—'}</dd>
                </div>
              </dl>
            </div>

            <div className={cardClass}>
              <h2 className="text-base font-semibold text-gray-900">Source</h2>
              <dl className="mt-4 space-y-3 text-sm">
                <div>
                  <dt className="text-gray-500">Source</dt>
                  <dd className="mt-0.5 text-gray-900">{candidate.source?.name || '—'}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Category</dt>
                  <dd className="mt-0.5 text-gray-900">{candidate.source?.category || '—'}</dd>
                </div>
              </dl>
            </div>

            <div className={cardClass}>
              <h2 className="text-base font-semibold text-gray-900">Dates</h2>
              <dl className="mt-4 space-y-3 text-sm">
                <div>
                  <dt className="text-gray-500">Created</dt>
                  <dd className="mt-0.5 text-gray-900">{formatDateTime(candidate.created_at)}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Last Updated</dt>
                  <dd className="mt-0.5 text-gray-900">{formatDateTime(candidate.updated_at)}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Consent Given</dt>
                  <dd className="mt-0.5 text-gray-900">
                    {candidate.consent_given ? formatDate(candidate.consent_date) : 'No'}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        )}

        {tab === 'CV/Documents' && (
          <DocumentsTab candidateId={candidate.id} documents={documents} onChanged={() => router.refresh()} />
        )}

        {tab === 'Applications' && (
          <div className={cardClass}>
            {!candidate.applications || candidate.applications.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-500">No applications yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      {['Requisition', 'Stage', 'Status', 'Date Applied'].map((h) => (
                        <th
                          key={h}
                          className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {candidate.applications.map((app) => (
                      <tr
                        key={app.id}
                        onClick={() => router.push(`/applications/${app.id}`)}
                        className="cursor-pointer hover:bg-gray-50"
                      >
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {app.requisition?.title ?? '—'}
                          <span className="ml-2 text-xs text-gray-400">
                            {app.requisition?.reference_number}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {app.current_stage ? (
                            <StageBadge name={app.current_stage.name} stageType={app.current_stage.stage_type} />
                          ) : (
                            '—'
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm">
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
                        <td className="px-4 py-3 text-sm text-gray-500">{formatDate(app.application_date)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {tab === 'Activity' && (
          <div className={cardClass}>
            {activity.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-500">No activity recorded yet.</p>
            ) : (
              <ul className="space-y-4">
                {activity.map((entry) => (
                  <li key={entry.id} className="flex gap-3 border-l-2 border-gray-200 pl-4">
                    <div>
                      <p className="text-sm text-gray-900">
                        <span className="font-medium capitalize">{humanizeAction(entry.action)}</span>
                        {entry.user ? (
                          <span className="text-gray-500">
                            {' '}
                            by {entry.user.first_name} {entry.user.last_name}
                          </span>
                        ) : null}
                      </p>
                      <p className="text-xs text-gray-400">{formatDateTime(entry.created_at)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {showAddApplication && (
        <AddApplicationModal
          candidateId={candidate.id}
          requisitions={openRequisitions}
          onClose={() => setShowAddApplication(false)}
        />
      )}
    </div>
  )
}

function DocumentsTab({
  candidateId,
  documents,
  onChanged,
}: {
  candidateId: string
  documents: CandidateDocumentRow[]
  onChanged: () => void
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [documentType, setDocumentType] = useState('cv')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleDownload(documentId: string) {
    try {
      const res = await fetch(`/api/documents/${documentId}`)
      if (!res.ok) return
      const json = await res.json()
      if (json.url) window.open(json.url, '_blank', 'noopener,noreferrer')
    } catch {
      // Ignore: the user can retry the download.
    }
  }

  async function handleUpload(file: File) {
    setError(null)
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('candidate_id', candidateId)
      formData.append('document_type', documentType)
      formData.append('file', file)
      const res = await fetch('/api/documents', { method: 'POST', body: formData })
      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        setError(json.error?.message ?? 'Failed to upload document')
        return
      }
      onChanged()
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <div className={cardClass}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-base font-semibold text-gray-900">Documents</h2>
        <div className="flex items-center gap-2">
          <select value={documentType} onChange={(e) => setDocumentType(e.target.value)} className={cn(inputClass, 'w-40')}>
            {Object.entries(DOCUMENT_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <label className={cn(secondaryButtonClass, 'cursor-pointer')}>
            <Upload className="mr-2 h-4 w-4" />
            {uploading ? 'Uploading…' : 'Upload Document'}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx"
              className="hidden"
              disabled={uploading}
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) void handleUpload(file)
              }}
            />
          </label>
        </div>
      </div>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      {documents.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-500">No documents uploaded yet.</p>
      ) : (
        <ul className="mt-4 divide-y divide-gray-200">
          {documents.map((doc) => (
            <li key={doc.id} className="flex items-center justify-between gap-4 py-3">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 flex-shrink-0 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{doc.filename}</p>
                  <p className="text-xs text-gray-500">
                    {DOCUMENT_TYPE_LABELS[doc.document_type] ?? doc.document_type} ·{' '}
                    {formatFileSize(doc.file_size)} · Uploaded {formatDate(doc.uploaded_at)}
                    {doc.uploaded_by_user
                      ? ` by ${doc.uploaded_by_user.first_name} ${doc.uploaded_by_user.last_name}`
                      : ''}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => void handleDownload(doc.id)}
                className={secondaryButtonClass}
              >
                <Download className="mr-2 h-4 w-4" />
                Download
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function AddApplicationModal({
  candidateId,
  requisitions,
  onClose,
}: {
  candidateId: string
  requisitions: OpenRequisitionRow[]
  onClose: () => void
}) {
  const router = useRouter()
  const [requisitionId, setRequisitionId] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit() {
    if (!requisitionId) {
      setError('Please select a requisition')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidate_id: candidateId, requisition_id: requisitionId }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(json.error?.message ?? 'Failed to create application')
        return
      }
      onClose()
      router.push(`/applications/${json.data.id}`)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">Add Application</h2>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-4">
          <label className="mb-1 block text-sm font-medium text-gray-700">Requisition</label>
          <select
            className={inputClass}
            value={requisitionId}
            onChange={(e) => setRequisitionId(e.target.value)}
          >
            <option value="">Select an open requisition</option>
            {requisitions.map((r) => (
              <option key={r.id} value={r.id}>
                {r.title} ({r.reference_number})
              </option>
            ))}
          </select>
          {requisitions.length === 0 && (
            <p className="mt-2 text-xs text-gray-500">There are no open requisitions right now.</p>
          )}
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onClose} className={secondaryButtonClass}>
            Cancel
          </button>
          <button type="button" onClick={() => void handleSubmit()} disabled={submitting} className={primaryButtonClass}>
            {submitting ? 'Creating…' : 'Create Application'}
          </button>
        </div>
      </div>
    </div>
  )
}
