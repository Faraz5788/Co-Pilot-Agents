'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CURRENCY_OPTIONS, EMPLOYMENT_TYPE_LABELS } from '@/lib/constants'
import type { RequisitionReferenceData, RequisitionRecord } from './types'

const EMPLOYMENT_TYPES = ['full_time', 'part_time', 'contract', 'temporary', 'intern'] as const
const FORM_CURRENCIES = ['GBP', 'USD', 'EUR']

interface RequisitionFormValues {
  title: string
  description: string
  employment_type: (typeof EMPLOYMENT_TYPES)[number]
  fte: string
  vacancy_count: string
  is_replacement: boolean
  department_id: string
  location_id: string
  cost_centre_id: string
  job_profile_id: string
  position_id: string
  hiring_manager_id: string
  lead_recruiter_id: string
  grade_id: string
  salary_min: string
  salary_max: string
  currency: string
  reason_for_hire: string
  target_start_date: string
  internal_notes: string
}

const EMPTY_VALUES: RequisitionFormValues = {
  title: '',
  description: '',
  employment_type: 'full_time',
  fte: '1.00',
  vacancy_count: '1',
  is_replacement: false,
  department_id: '',
  location_id: '',
  cost_centre_id: '',
  job_profile_id: '',
  position_id: '',
  hiring_manager_id: '',
  lead_recruiter_id: '',
  grade_id: '',
  salary_min: '',
  salary_max: '',
  currency: 'GBP',
  reason_for_hire: '',
  target_start_date: '',
  internal_notes: '',
}

export function requisitionToFormValues(requisition: RequisitionRecord): RequisitionFormValues {
  return {
    title: requisition.title ?? '',
    description: requisition.description ?? '',
    employment_type: requisition.employment_type ?? 'full_time',
    fte: requisition.fte != null ? String(requisition.fte) : '1.00',
    vacancy_count: requisition.vacancy_count != null ? String(requisition.vacancy_count) : '1',
    is_replacement: Boolean(requisition.is_replacement),
    department_id: requisition.department_id ?? '',
    location_id: requisition.location_id ?? '',
    cost_centre_id: requisition.cost_centre_id ?? '',
    job_profile_id: requisition.job_profile_id ?? '',
    position_id: requisition.position_id ?? '',
    hiring_manager_id: requisition.hiring_manager_id ?? '',
    lead_recruiter_id: requisition.lead_recruiter_id ?? '',
    grade_id: requisition.grade_id ?? '',
    salary_min: requisition.salary_min != null ? String(requisition.salary_min) : '',
    salary_max: requisition.salary_max != null ? String(requisition.salary_max) : '',
    currency: requisition.currency ?? 'GBP',
    reason_for_hire: requisition.reason_for_hire ?? '',
    target_start_date: requisition.target_start_date ?? '',
    internal_notes: requisition.internal_notes ?? '',
  }
}

interface RequisitionFormProps {
  mode: 'create' | 'edit'
  requisitionId?: string
  initialValues?: RequisitionFormValues
  referenceData: RequisitionReferenceData
  onCancel?: () => void
  onSaved?: (saved: RequisitionRecord) => void
}

type FormErrors = Partial<Record<keyof RequisitionFormValues, string>>

function labelClass() {
  return 'mb-1 block text-sm font-medium text-gray-700'
}
function inputClass(hasError?: boolean) {
  return cn(
    'w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500',
    hasError ? 'border-red-400' : 'border-gray-300'
  )
}
function fieldError(message?: string) {
  if (!message) return null
  return <p className="mt-1 text-xs text-red-600">{message}</p>
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">{title}</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>
    </div>
  )
}

export function RequisitionForm({
  mode,
  requisitionId,
  initialValues,
  referenceData,
  onCancel,
  onSaved,
}: RequisitionFormProps) {
  const router = useRouter()
  const [values, setValues] = useState<RequisitionFormValues>(initialValues ?? EMPTY_VALUES)
  const [errors, setErrors] = useState<FormErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [submittingAs, setSubmittingAs] = useState<'draft' | 'pending_approval' | 'save' | null>(null)

  const activeUsers = referenceData.users.filter((u) => u.status !== 'inactive')

  function setField<K extends keyof RequisitionFormValues>(key: K, value: RequisitionFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  function validate(): FormErrors {
    const next: FormErrors = {}

    if (values.title.trim().length < 3) {
      next.title = 'Title must be at least 3 characters'
    }
    if (!values.hiring_manager_id) {
      next.hiring_manager_id = 'Hiring manager is required'
    }

    const fte = Number(values.fte)
    if (!values.fte || Number.isNaN(fte) || fte <= 0 || fte > 1) {
      next.fte = 'FTE must be between 0.01 and 1.00'
    }

    const vacancyCount = Number(values.vacancy_count)
    if (!values.vacancy_count || !Number.isInteger(vacancyCount) || vacancyCount < 1) {
      next.vacancy_count = 'Vacancy count must be a whole number of at least 1'
    }

    if (values.salary_min && Number.isNaN(Number(values.salary_min))) {
      next.salary_min = 'Must be a number'
    }
    if (values.salary_max && Number.isNaN(Number(values.salary_max))) {
      next.salary_max = 'Must be a number'
    }
    if (
      values.salary_min &&
      values.salary_max &&
      !Number.isNaN(Number(values.salary_min)) &&
      !Number.isNaN(Number(values.salary_max)) &&
      Number(values.salary_max) < Number(values.salary_min)
    ) {
      next.salary_max = 'Maximum salary must be greater than or equal to minimum salary'
    }

    return next
  }

  function buildPayload(status?: 'draft' | 'pending_approval') {
    return {
      title: values.title.trim(),
      description: values.description.trim() || undefined,
      employment_type: values.employment_type,
      fte: Number(values.fte),
      vacancy_count: Number(values.vacancy_count),
      is_replacement: values.is_replacement,
      department_id: values.department_id || undefined,
      location_id: values.location_id || undefined,
      cost_centre_id: values.cost_centre_id || undefined,
      job_profile_id: values.job_profile_id || undefined,
      position_id: values.position_id || undefined,
      hiring_manager_id: values.hiring_manager_id,
      lead_recruiter_id: values.lead_recruiter_id || undefined,
      grade_id: values.grade_id || undefined,
      salary_min: values.salary_min ? Number(values.salary_min) : undefined,
      salary_max: values.salary_max ? Number(values.salary_max) : undefined,
      currency: values.currency,
      reason_for_hire: values.reason_for_hire.trim() || undefined,
      target_start_date: values.target_start_date || undefined,
      internal_notes: values.internal_notes.trim() || undefined,
      ...(status ? { status } : {}),
    }
  }

  async function handleSubmit(status?: 'draft' | 'pending_approval') {
    const validationErrors = validate()
    setErrors(validationErrors)
    setFormError(null)

    if (Object.keys(validationErrors).length > 0) {
      setFormError('Please fix the highlighted fields before continuing.')
      return
    }

    setSubmittingAs(mode === 'create' ? status ?? 'draft' : 'save')

    try {
      const endpoint = mode === 'create' ? '/api/requisitions' : `/api/requisitions/${requisitionId}`
      const method = mode === 'create' ? 'POST' : 'PATCH'
      const payload = mode === 'create' ? buildPayload(status) : buildPayload()

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => null)
        throw new Error(body?.error ?? 'Something went wrong. Please try again.')
      }

      const saved = await res.json()

      if (mode === 'create') {
        router.push(`/requisitions/${saved.id}`)
      } else if (onSaved) {
        onSaved(saved as RequisitionRecord)
      } else {
        router.push(`/requisitions/${requisitionId}`)
      }
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setSubmittingAs(null)
    }
  }

  function handleCancel() {
    if (onCancel) {
      onCancel()
    } else {
      router.back()
    }
  }

  const isSubmitting = submittingAs !== null

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        handleSubmit(mode === 'create' ? 'draft' : undefined)
      }}
      className="space-y-6"
    >
      {formError && (
        <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      <Section title="Basic Information">
        <div className="sm:col-span-2">
          <label className={labelClass()}>
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={values.title}
            onChange={(e) => setField('title', e.target.value)}
            className={inputClass(!!errors.title)}
            placeholder="e.g. Senior Software Engineer"
          />
          {fieldError(errors.title)}
        </div>

        <div className="sm:col-span-2">
          <label className={labelClass()}>Description</label>
          <textarea
            value={values.description}
            onChange={(e) => setField('description', e.target.value)}
            rows={4}
            className={inputClass()}
            placeholder="Role summary, responsibilities, requirements..."
          />
        </div>

        <div>
          <label className={labelClass()}>Employment Type</label>
          <select
            value={values.employment_type}
            onChange={(e) => setField('employment_type', e.target.value as RequisitionFormValues['employment_type'])}
            className={inputClass()}
          >
            {EMPLOYMENT_TYPES.map((type) => (
              <option key={type} value={type}>
                {EMPLOYMENT_TYPE_LABELS[type]}
              </option>
            ))}
          </select>
        </div>

        <div />

        <div>
          <label className={labelClass()}>FTE</label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            max="1"
            value={values.fte}
            onChange={(e) => setField('fte', e.target.value)}
            className={inputClass(!!errors.fte)}
          />
          {fieldError(errors.fte)}
        </div>

        <div>
          <label className={labelClass()}>Vacancy Count</label>
          <input
            type="number"
            step="1"
            min="1"
            value={values.vacancy_count}
            onChange={(e) => setField('vacancy_count', e.target.value)}
            className={inputClass(!!errors.vacancy_count)}
          />
          {fieldError(errors.vacancy_count)}
        </div>

        <div className="flex items-center gap-2 sm:col-span-2">
          <input
            id="is_replacement"
            type="checkbox"
            checked={values.is_replacement}
            onChange={(e) => setField('is_replacement', e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="is_replacement" className="text-sm text-gray-700">
            This is a replacement for an existing worker
          </label>
        </div>
      </Section>

      <Section title="Organisation">
        <div>
          <label className={labelClass()}>Department</label>
          <select
            value={values.department_id}
            onChange={(e) => setField('department_id', e.target.value)}
            className={inputClass()}
          >
            <option value="">Select department...</option>
            {referenceData.departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass()}>Location</label>
          <select
            value={values.location_id}
            onChange={(e) => setField('location_id', e.target.value)}
            className={inputClass()}
          >
            <option value="">Select location...</option>
            {referenceData.locations.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
                {l.city ? ` — ${l.city}` : ''}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass()}>Cost Centre</label>
          <select
            value={values.cost_centre_id}
            onChange={(e) => setField('cost_centre_id', e.target.value)}
            className={inputClass()}
          >
            <option value="">Select cost centre...</option>
            {referenceData.costCentres.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
                {c.code ? ` (${c.code})` : ''}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass()}>Job Profile</label>
          <select
            value={values.job_profile_id}
            onChange={(e) => setField('job_profile_id', e.target.value)}
            className={inputClass()}
          >
            <option value="">Select job profile...</option>
            {referenceData.jobProfiles.map((jp) => (
              <option key={jp.id} value={jp.id}>
                {jp.name}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className={labelClass()}>Position</label>
          <select
            value={values.position_id}
            onChange={(e) => setField('position_id', e.target.value)}
            className={inputClass()}
          >
            <option value="">Select position...</option>
            {referenceData.positions.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
                {p.department?.name ? ` — ${p.department.name}` : ''}
              </option>
            ))}
          </select>
        </div>
      </Section>

      <Section title="People">
        <div>
          <label className={labelClass()}>
            Hiring Manager <span className="text-red-500">*</span>
          </label>
          <select
            value={values.hiring_manager_id}
            onChange={(e) => setField('hiring_manager_id', e.target.value)}
            className={inputClass(!!errors.hiring_manager_id)}
          >
            <option value="">Select hiring manager...</option>
            {activeUsers.map((u) => (
              <option key={u.id} value={u.id}>
                {u.first_name} {u.last_name} ({u.email})
              </option>
            ))}
          </select>
          {fieldError(errors.hiring_manager_id)}
        </div>

        <div>
          <label className={labelClass()}>Lead Recruiter</label>
          <select
            value={values.lead_recruiter_id}
            onChange={(e) => setField('lead_recruiter_id', e.target.value)}
            className={inputClass()}
          >
            <option value="">Select lead recruiter...</option>
            {activeUsers.map((u) => (
              <option key={u.id} value={u.id}>
                {u.first_name} {u.last_name} ({u.email})
              </option>
            ))}
          </select>
        </div>
      </Section>

      <Section title="Compensation">
        <div>
          <label className={labelClass()}>Grade</label>
          <select
            value={values.grade_id}
            onChange={(e) => setField('grade_id', e.target.value)}
            className={inputClass()}
          >
            <option value="">Select grade...</option>
            {referenceData.grades.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass()}>Currency</label>
          <select
            value={values.currency}
            onChange={(e) => setField('currency', e.target.value)}
            className={inputClass()}
          >
            {FORM_CURRENCIES.map((code) => (
              <option key={code} value={code}>
                {code} — {CURRENCY_OPTIONS.find((c) => c.code === code)?.label ?? code}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass()}>Salary Minimum</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={values.salary_min}
            onChange={(e) => setField('salary_min', e.target.value)}
            className={inputClass(!!errors.salary_min)}
          />
          {fieldError(errors.salary_min)}
        </div>

        <div>
          <label className={labelClass()}>Salary Maximum</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={values.salary_max}
            onChange={(e) => setField('salary_max', e.target.value)}
            className={inputClass(!!errors.salary_max)}
          />
          {fieldError(errors.salary_max)}
        </div>
      </Section>

      <Section title="Additional">
        <div className="sm:col-span-2">
          <label className={labelClass()}>Reason for Hire</label>
          <textarea
            value={values.reason_for_hire}
            onChange={(e) => setField('reason_for_hire', e.target.value)}
            rows={3}
            className={inputClass()}
          />
        </div>

        <div>
          <label className={labelClass()}>Target Start Date</label>
          <input
            type="date"
            value={values.target_start_date}
            onChange={(e) => setField('target_start_date', e.target.value)}
            className={inputClass()}
          />
        </div>

        <div />

        <div className="sm:col-span-2">
          <label className={labelClass()}>Internal Notes</label>
          <textarea
            value={values.internal_notes}
            onChange={(e) => setField('internal_notes', e.target.value)}
            rows={3}
            className={inputClass()}
            placeholder="Not visible to candidates"
          />
        </div>
      </Section>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={handleCancel}
          disabled={isSubmitting}
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancel
        </button>

        {mode === 'create' ? (
          <>
            <button
              type="button"
              onClick={() => handleSubmit('draft')}
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submittingAs === 'draft' && <Loader2 className="h-4 w-4 animate-spin" />}
              Save as Draft
            </button>
            <button
              type="button"
              onClick={() => handleSubmit('pending_approval')}
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submittingAs === 'pending_approval' && <Loader2 className="h-4 w-4 animate-spin" />}
              Submit for Approval
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => handleSubmit()}
            disabled={isSubmitting}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submittingAs === 'save' && <Loader2 className="h-4 w-4 animate-spin" />}
            Save Changes
          </button>
        )}
      </div>
    </form>
  )
}
