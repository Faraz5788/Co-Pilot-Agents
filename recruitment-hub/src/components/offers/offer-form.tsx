'use client'

import { useState } from 'react'
import { Loader, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { EMPLOYMENT_TYPE_LABELS } from '@/lib/constants'
import type { EmploymentType } from '@/types/database'
import type { OfferRecord, OfferApprover } from './offer-detail'

export interface ApplicationOption {
  id: string
  candidate?: { first_name: string; last_name: string } | null
  requisition?: { title: string; reference_number?: string } | null
}

export interface GradeOption {
  id: string
  name: string
}

export interface LocationOption {
  id: string
  name: string
  city?: string | null
}

export interface OfferFormProps {
  applications: ApplicationOption[]
  grades: GradeOption[]
  locations: LocationOption[]
  approvers: OfferApprover[]
  offer?: OfferRecord | null
  defaultApplicationId?: string
  onSaved: () => void
  onClose: () => void
}

const inputClasses =
  'w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none'

const OFFER_CURRENCIES = ['GBP', 'USD', 'EUR']

const EMPLOYMENT_TYPE_OPTIONS: EmploymentType[] = [
  'full_time',
  'part_time',
  'contract',
  'temporary',
  'intern',
]

function applicationLabel(app: ApplicationOption) {
  const candidateName = app.candidate
    ? `${app.candidate.first_name} ${app.candidate.last_name}`
    : 'Unknown candidate'
  return `${candidateName} — ${app.requisition?.title ?? 'Unknown requisition'}`
}

export function OfferForm({
  applications,
  grades,
  locations,
  approvers,
  offer,
  defaultApplicationId,
  onSaved,
  onClose,
}: OfferFormProps) {
  const isEditing = Boolean(offer)

  const [applicationId, setApplicationId] = useState(
    offer?.application_id ?? defaultApplicationId ?? ''
  )
  const [jobTitle, setJobTitle] = useState(offer?.job_title ?? '')
  const [salary, setSalary] = useState(offer ? String(offer.salary) : '')
  const [currency, setCurrency] = useState(offer?.currency ?? 'GBP')
  const [gradeId, setGradeId] = useState(offer?.grade_id ?? '')
  const [locationId, setLocationId] = useState(offer?.location_id ?? '')
  const [employmentType, setEmploymentType] = useState<EmploymentType>(
    offer?.employment_type ?? 'full_time'
  )
  const [fte, setFte] = useState(offer ? String(offer.fte) : '1.00')
  const [startDate, setStartDate] = useState(offer?.proposed_start_date ?? '')
  const [bonus, setBonus] = useState(offer?.bonus ?? '')
  const [additionalTerms, setAdditionalTerms] = useState(offer?.additional_terms ?? '')
  const [approverId, setApproverId] = useState('')

  const [submitting, setSubmitting] = useState<'draft' | 'approval' | null>(null)
  const [error, setError] = useState<string | null>(null)

  function buildPayload() {
    return {
      application_id: applicationId,
      job_title: jobTitle.trim(),
      salary: Number(salary),
      currency,
      grade_id: gradeId || undefined,
      location_id: locationId || undefined,
      employment_type: employmentType,
      fte: Number(fte),
      proposed_start_date: startDate || undefined,
      bonus: bonus.trim() || undefined,
      additional_terms: additionalTerms.trim() || undefined,
    }
  }

  async function saveOffer() {
    const payload = buildPayload()
    const url = isEditing ? `/api/offers/${offer!.id}` : '/api/offers'
    const method = isEditing ? 'PATCH' : 'POST'

    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const body = await response.json().catch(() => null)
      throw new Error(body?.error ?? 'Failed to save offer')
    }

    return response.json()
  }

  async function handleSaveDraft(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!applicationId || !jobTitle.trim() || !salary) {
      setError('Application, job title and salary are required')
      return
    }

    setSubmitting('draft')
    try {
      await saveOffer()
      onSaved()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save offer')
    } finally {
      setSubmitting(null)
    }
  }

  async function handleSubmitForApproval() {
    setError(null)

    if (!applicationId || !jobTitle.trim() || !salary) {
      setError('Application, job title and salary are required')
      return
    }
    if (!approverId) {
      setError('Please select an approver')
      return
    }

    setSubmitting('approval')
    try {
      const saved = await saveOffer()
      const response = await fetch(`/api/offers/${saved.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'pending_approval', approver_id: approverId }),
      })
      if (!response.ok) {
        const body = await response.json().catch(() => null)
        throw new Error(body?.error ?? 'Failed to submit offer for approval')
      }
      onSaved()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit offer for approval')
    } finally {
      setSubmitting(null)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {isEditing ? 'Edit Offer' : 'New Offer'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSaveDraft} className="space-y-5 px-6 py-5">
          {error ? (
            <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
          ) : null}

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Application</label>
            <select
              value={applicationId}
              onChange={(e) => setApplicationId(e.target.value)}
              className={inputClasses}
              disabled={isEditing}
              required
            >
              <option value="">Select an application...</option>
              {applications.map((app) => (
                <option key={app.id} value={app.id}>
                  {applicationLabel(app)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Job Title</label>
            <input
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              className={inputClasses}
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Salary</label>
              <input
                type="number"
                min={0}
                step="0.01"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                className={inputClasses}
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className={inputClasses}
              >
                {OFFER_CURRENCIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Grade</label>
              <select
                value={gradeId}
                onChange={(e) => setGradeId(e.target.value)}
                className={inputClasses}
              >
                <option value="">No grade</option>
                {grades.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Location</label>
              <select
                value={locationId}
                onChange={(e) => setLocationId(e.target.value)}
                className={inputClasses}
              >
                <option value="">No location</option>
                {locations.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                    {l.city ? ` (${l.city})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Employment Type
              </label>
              <select
                value={employmentType}
                onChange={(e) => setEmploymentType(e.target.value as EmploymentType)}
                className={inputClasses}
              >
                {EMPLOYMENT_TYPE_OPTIONS.map((value) => (
                  <option key={value} value={value}>
                    {EMPLOYMENT_TYPE_LABELS[value]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">FTE</label>
              <input
                type="number"
                min={0.1}
                max={1.5}
                step="0.05"
                value={fte}
                onChange={(e) => setFte(e.target.value)}
                className={inputClasses}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Proposed Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={inputClasses}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Bonus</label>
              <input
                type="text"
                value={bonus}
                onChange={(e) => setBonus(e.target.value)}
                placeholder="e.g. 10% annual performance bonus"
                className={inputClasses}
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Additional Terms
            </label>
            <textarea
              value={additionalTerms}
              onChange={(e) => setAdditionalTerms(e.target.value)}
              rows={4}
              className={inputClasses}
            />
          </div>

          <div className="rounded-lg border border-gray-200 p-4">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Approver <span className="text-gray-400">(required to submit for approval)</span>
            </label>
            <select
              value={approverId}
              onChange={(e) => setApproverId(e.target.value)}
              className={inputClasses}
            >
              <option value="">Select approver...</option>
              {approvers.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.first_name} {a.last_name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap justify-end gap-3 border-t border-gray-200 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting !== null}
              className={cn(
                'flex items-center gap-2 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50',
                submitting !== null && 'cursor-not-allowed opacity-60'
              )}
            >
              {submitting === 'draft' ? <Loader className="h-4 w-4 animate-spin" /> : null}
              Save as Draft
            </button>
            <button
              type="button"
              disabled={submitting !== null}
              onClick={handleSubmitForApproval}
              className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting === 'approval' ? <Loader className="h-4 w-4 animate-spin" /> : null}
              Submit for Approval
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
