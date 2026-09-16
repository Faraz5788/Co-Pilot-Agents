'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle, Upload, X } from 'lucide-react'
import { CURRENCY_OPTIONS } from '@/lib/constants'

export interface AdminSource {
  id: string
  name: string
  category: string | null
}

export interface CandidateFormValues {
  id?: string
  first_name: string
  middle_name: string
  last_name: string
  preferred_name: string
  email: string
  phone: string
  location: string
  linkedin_url: string
  source_id: string
  current_employer: string
  current_job_title: string
  notice_period: string
  salary_expectation: string
  currency: string
  right_to_work_status: string
}

interface CandidateFormProps {
  sources: AdminSource[]
  candidate?: Partial<CandidateFormValues> & { id: string }
}

interface DuplicateMatch {
  id: string
  candidate_number: string
  first_name: string
  last_name: string
  email: string
}

const inputClass =
  'w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
const labelClass = 'block text-sm font-medium text-gray-700 mb-1'
const cardClass = 'rounded-lg border border-gray-200 bg-white shadow-sm p-6'
const primaryButtonClass =
  'inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-60'
const secondaryButtonClass =
  'inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50'

const ALLOWED_FILE_EXTENSIONS = ['.pdf', '.doc', '.docx']
const MAX_FILE_SIZE = 10 * 1024 * 1024

const RIGHT_TO_WORK_OPTIONS = [
  'Citizen',
  'Permanent Resident',
  'Work Visa',
  'Requires Sponsorship',
  'Other',
]

function emptyValues(): CandidateFormValues {
  return {
    first_name: '',
    middle_name: '',
    last_name: '',
    preferred_name: '',
    email: '',
    phone: '',
    location: '',
    linkedin_url: '',
    source_id: '',
    current_employer: '',
    current_job_title: '',
    notice_period: '',
    salary_expectation: '',
    currency: '',
    right_to_work_status: '',
  }
}

export function CandidateForm({ sources, candidate }: CandidateFormProps) {
  const router = useRouter()
  const isEdit = Boolean(candidate?.id)
  const [values, setValues] = useState<CandidateFormValues>({
    ...emptyValues(),
    ...candidate,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [duplicates, setDuplicates] = useState<DuplicateMatch[]>([])
  const [checkingDuplicates, setCheckingDuplicates] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function update<K extends keyof CandidateFormValues>(key: K, value: CandidateFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  async function handleEmailBlur() {
    const email = values.email.trim()
    if (isEdit || !email || !/^\S+@\S+\.\S+$/.test(email)) {
      setDuplicates([])
      return
    }
    setCheckingDuplicates(true)
    try {
      const res = await fetch(`/api/candidates?search=${encodeURIComponent(email)}&pageSize=5`)
      if (!res.ok) return
      const json = await res.json()
      const matches: DuplicateMatch[] = (json.data ?? []).filter(
        (c: DuplicateMatch) => c.email.toLowerCase() === email.toLowerCase()
      )
      setDuplicates(matches)
    } catch {
      // Non-blocking: duplicate check failures shouldn't stop the user.
    } finally {
      setCheckingDuplicates(false)
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0] ?? null
    setFileError(null)
    if (!selected) {
      setFile(null)
      return
    }
    const ext = `.${selected.name.split('.').pop()?.toLowerCase()}`
    if (!ALLOWED_FILE_EXTENSIONS.includes(ext)) {
      setFileError('Only PDF and Word documents (.pdf, .doc, .docx) are allowed')
      setFile(null)
      return
    }
    if (selected.size > MAX_FILE_SIZE) {
      setFileError('File size must be under 10MB')
      setFile(null)
      return
    }
    setFile(selected)
  }

  function validate(): boolean {
    const nextErrors: Record<string, string> = {}
    if (!values.first_name.trim()) nextErrors.first_name = 'First name is required'
    if (!values.last_name.trim()) nextErrors.last_name = 'Last name is required'
    if (!values.email.trim()) {
      nextErrors.email = 'Email is required'
    } else if (!/^\S+@\S+\.\S+$/.test(values.email.trim())) {
      nextErrors.email = 'Enter a valid email address'
    }
    if (values.linkedin_url.trim() && !/^https?:\/\//i.test(values.linkedin_url.trim())) {
      nextErrors.linkedin_url = 'Enter a valid URL starting with http(s)://'
    }
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  function buildPayload(force: boolean) {
    return {
      ...values,
      salary_expectation: values.salary_expectation ? Number(values.salary_expectation) : null,
      force,
    }
  }

  async function uploadCv(candidateId: string) {
    if (!file) return
    const formData = new FormData()
    formData.append('candidate_id', candidateId)
    formData.append('document_type', 'cv')
    formData.append('file', file)
    await fetch('/api/documents', { method: 'POST', body: formData })
  }

  async function submit(force: boolean) {
    setSubmitError(null)
    if (!validate()) return
    setSubmitting(true)
    try {
      const url = isEdit ? `/api/candidates/${candidate!.id}` : '/api/candidates'
      const method = isEdit ? 'PATCH' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildPayload(force)),
      })

      if (res.status === 409) {
        const json = await res.json()
        setDuplicates(json.duplicates ?? [])
        setSubmitError('A candidate with matching details already exists.')
        return
      }

      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        setSubmitError(json.error?.message ?? 'Something went wrong. Please try again.')
        return
      }

      const json = await res.json()
      const savedId = json.data?.id ?? candidate?.id
      if (savedId) {
        await uploadCv(savedId)
        router.push(`/candidates/${savedId}`)
        router.refresh()
      } else {
        router.push('/candidates')
      }
    } catch {
      setSubmitError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        void submit(false)
      }}
      className="space-y-6"
    >
      {duplicates.length > 0 && (
        <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-500" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-amber-800">Possible duplicate candidate</h3>
            <ul className="mt-2 space-y-1 text-sm text-amber-700">
              {duplicates.map((d) => (
                <li key={d.id}>
                  <a href={`/candidates/${d.id}`} className="underline hover:no-underline" target="_blank" rel="noreferrer">
                    {d.first_name} {d.last_name}
                  </a>{' '}
                  ({d.email}) · {d.candidate_number}
                </li>
              ))}
            </ul>
            {!isEdit && (
              <button
                type="button"
                onClick={() => void submit(true)}
                disabled={submitting}
                className="mt-3 text-sm font-medium text-amber-800 underline hover:no-underline"
              >
                Create anyway
              </button>
            )}
          </div>
        </div>
      )}

      {submitError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {submitError}
        </div>
      )}

      <div className={cardClass}>
        <h2 className="text-base font-semibold text-gray-900">Personal Details</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>First Name *</label>
            <input
              className={inputClass}
              value={values.first_name}
              onChange={(e) => update('first_name', e.target.value)}
            />
            {errors.first_name && <p className="mt-1 text-xs text-red-600">{errors.first_name}</p>}
          </div>
          <div>
            <label className={labelClass}>Middle Name</label>
            <input
              className={inputClass}
              value={values.middle_name}
              onChange={(e) => update('middle_name', e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass}>Last Name *</label>
            <input
              className={inputClass}
              value={values.last_name}
              onChange={(e) => update('last_name', e.target.value)}
            />
            {errors.last_name && <p className="mt-1 text-xs text-red-600">{errors.last_name}</p>}
          </div>
          <div>
            <label className={labelClass}>Preferred Name</label>
            <input
              className={inputClass}
              value={values.preferred_name}
              onChange={(e) => update('preferred_name', e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass}>Email *</label>
            <input
              type="email"
              className={inputClass}
              value={values.email}
              onChange={(e) => update('email', e.target.value)}
              onBlur={() => void handleEmailBlur()}
            />
            {checkingDuplicates && <p className="mt-1 text-xs text-gray-400">Checking for duplicates…</p>}
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
          </div>
          <div>
            <label className={labelClass}>Phone</label>
            <input
              className={inputClass}
              value={values.phone}
              onChange={(e) => update('phone', e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass}>Location</label>
            <input
              className={inputClass}
              value={values.location}
              onChange={(e) => update('location', e.target.value)}
              placeholder="City, Country"
            />
          </div>
          <div>
            <label className={labelClass}>LinkedIn URL</label>
            <input
              className={inputClass}
              value={values.linkedin_url}
              onChange={(e) => update('linkedin_url', e.target.value)}
              placeholder="https://linkedin.com/in/..."
            />
            {errors.linkedin_url && <p className="mt-1 text-xs text-red-600">{errors.linkedin_url}</p>}
          </div>
          <div>
            <label className={labelClass}>Source</label>
            <select
              className={inputClass}
              value={values.source_id}
              onChange={(e) => update('source_id', e.target.value)}
            >
              <option value="">Select a source</option>
              {sources.map((source) => (
                <option key={source.id} value={source.id}>
                  {source.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className={cardClass}>
        <h2 className="text-base font-semibold text-gray-900">Employment</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Current Employer</label>
            <input
              className={inputClass}
              value={values.current_employer}
              onChange={(e) => update('current_employer', e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass}>Current Job Title</label>
            <input
              className={inputClass}
              value={values.current_job_title}
              onChange={(e) => update('current_job_title', e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass}>Notice Period</label>
            <input
              className={inputClass}
              value={values.notice_period}
              onChange={(e) => update('notice_period', e.target.value)}
              placeholder="e.g. 4 weeks"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Salary Expectation</label>
              <input
                type="number"
                min="0"
                className={inputClass}
                value={values.salary_expectation}
                onChange={(e) => update('salary_expectation', e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>Currency</label>
              <select
                className={inputClass}
                value={values.currency}
                onChange={(e) => update('currency', e.target.value)}
              >
                <option value="">—</option>
                {CURRENCY_OPTIONS.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className={labelClass}>Right to Work Status</label>
            <select
              className={inputClass}
              value={values.right_to_work_status}
              onChange={(e) => update('right_to_work_status', e.target.value)}
            >
              <option value="">Select status</option>
              {RIGHT_TO_WORK_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className={cardClass}>
        <h2 className="text-base font-semibold text-gray-900">CV / Resume</h2>
        <p className="mt-1 text-sm text-gray-500">PDF or Word document, up to 10MB.</p>
        <div className="mt-4">
          {file ? (
            <div className="flex items-center justify-between rounded-md border border-gray-200 px-3 py-2 text-sm">
              <span className="truncate text-gray-700">{file.name}</span>
              <button
                type="button"
                onClick={() => {
                  setFile(null)
                  if (fileInputRef.current) fileInputRef.current.value = ''
                }}
                className="ml-2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-gray-300 px-6 py-8 text-sm text-gray-500 hover:border-gray-400">
              <Upload className="mb-2 h-6 w-6 text-gray-400" />
              Click to upload a CV
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
          )}
          {fileError && <p className="mt-2 text-xs text-red-600">{fileError}</p>}
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className={secondaryButtonClass}
          disabled={submitting}
        >
          Cancel
        </button>
        <button type="submit" className={primaryButtonClass} disabled={submitting}>
          {submitting ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Candidate'}
        </button>
      </div>
    </form>
  )
}
