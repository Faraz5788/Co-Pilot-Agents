'use client'

import { useMemo, useState } from 'react'
import { Loader, MapPin, Video, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { INTERVIEW_TYPE_LABELS } from '@/lib/constants'
import type { InterviewType, LocationType } from '@/types/database'

export interface ApplicationOption {
  id: string
  candidate?: { first_name: string; last_name: string; candidate_number?: string } | null
  requisition?: { title: string; reference_number?: string } | null
}

export interface UserOption {
  id: string
  first_name: string
  last_name: string
  email: string
}

export interface ScheduleInterviewDialogProps {
  open: boolean
  onClose: () => void
  onScheduled: () => void
  applications: ApplicationOption[]
  users: UserOption[]
  defaultApplicationId?: string
}

const inputClasses =
  'w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none'

function applicationLabel(app: ApplicationOption) {
  const candidateName = app.candidate
    ? `${app.candidate.first_name} ${app.candidate.last_name}`
    : 'Unknown candidate'
  const requisitionTitle = app.requisition?.title ?? 'Unknown requisition'
  return `${candidateName} — ${requisitionTitle}`
}

export function ScheduleInterviewDialog({
  open,
  onClose,
  onScheduled,
  applications,
  users,
  defaultApplicationId,
}: ScheduleInterviewDialogProps) {
  const [applicationId, setApplicationId] = useState(defaultApplicationId ?? '')
  const [applicationSearch, setApplicationSearch] = useState('')
  const [interviewType, setInterviewType] = useState<InterviewType>('telephone_screen')
  const [date, setDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [locationType, setLocationType] = useState<LocationType>('remote')
  const [location, setLocation] = useState('')
  const [meetingUrl, setMeetingUrl] = useState('')
  const [interviewerIds, setInterviewerIds] = useState<string[]>([])
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const filteredApplications = useMemo(() => {
    if (!applicationSearch.trim()) return applications
    const q = applicationSearch.trim().toLowerCase()
    return applications.filter((app) => applicationLabel(app).toLowerCase().includes(q))
  }, [applications, applicationSearch])

  function toggleInterviewer(userId: string) {
    setInterviewerIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    )
  }

  function resetForm() {
    setApplicationId(defaultApplicationId ?? '')
    setApplicationSearch('')
    setInterviewType('telephone_screen')
    setDate('')
    setStartTime('')
    setEndTime('')
    setLocationType('remote')
    setLocation('')
    setMeetingUrl('')
    setInterviewerIds([])
    setNotes('')
    setError(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!applicationId) {
      setError('Please select an application')
      return
    }
    if (!date || !startTime || !endTime) {
      setError('Please provide a date, start time and end time')
      return
    }
    if (interviewerIds.length === 0) {
      setError('Please select at least one interviewer')
      return
    }

    const scheduledStart = new Date(`${date}T${startTime}`)
    const scheduledEnd = new Date(`${date}T${endTime}`)

    if (Number.isNaN(scheduledStart.getTime()) || Number.isNaN(scheduledEnd.getTime())) {
      setError('Please provide a valid date and time')
      return
    }
    if (scheduledEnd <= scheduledStart) {
      setError('End time must be after start time')
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch('/api/interviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          application_id: applicationId,
          interview_type: interviewType,
          scheduled_start: scheduledStart.toISOString(),
          scheduled_end: scheduledEnd.toISOString(),
          location_type: locationType,
          location: locationType !== 'remote' ? location : undefined,
          meeting_url: locationType !== 'in_person' ? meetingUrl || undefined : undefined,
          notes: notes || undefined,
          interviewer_ids: interviewerIds,
        }),
      })

      if (!response.ok) {
        const body = await response.json().catch(() => null)
        throw new Error(body?.error ?? 'Failed to schedule interview')
      }

      resetForm()
      onScheduled()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to schedule interview')
    } finally {
      setSubmitting(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Schedule Interview</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 px-6 py-5">
          {error ? (
            <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
          ) : null}

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Application</label>
            <input
              type="text"
              placeholder="Search candidate or requisition..."
              value={applicationSearch}
              onChange={(e) => setApplicationSearch(e.target.value)}
              className={cn(inputClasses, 'mb-2')}
            />
            <select
              value={applicationId}
              onChange={(e) => setApplicationId(e.target.value)}
              className={inputClasses}
              required
            >
              <option value="">Select an application...</option>
              {filteredApplications.map((app) => (
                <option key={app.id} value={app.id}>
                  {applicationLabel(app)}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Interview Type</label>
              <select
                value={interviewType}
                onChange={(e) => setInterviewType(e.target.value as InterviewType)}
                className={inputClasses}
              >
                {Object.entries(INTERVIEW_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={inputClasses}
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Start Time</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className={inputClasses}
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">End Time</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className={inputClasses}
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Location Type</label>
            <select
              value={locationType}
              onChange={(e) => setLocationType(e.target.value as LocationType)}
              className={inputClasses}
            >
              <option value="remote">Remote</option>
              <option value="in_person">In Person</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </div>

          {locationType !== 'remote' ? (
            <div>
              <label className="mb-1 flex items-center gap-1.5 text-sm font-medium text-gray-700">
                <MapPin className="h-4 w-4 text-gray-400" /> Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. London Office, Floor 3, Room 2"
                className={inputClasses}
              />
            </div>
          ) : null}

          {locationType !== 'in_person' ? (
            <div>
              <label className="mb-1 flex items-center gap-1.5 text-sm font-medium text-gray-700">
                <Video className="h-4 w-4 text-gray-400" /> Meeting URL
              </label>
              <input
                type="url"
                value={meetingUrl}
                onChange={(e) => setMeetingUrl(e.target.value)}
                placeholder="https://..."
                className={inputClasses}
              />
            </div>
          ) : null}

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Interviewers</label>
            <div className="max-h-40 space-y-1.5 overflow-y-auto rounded-md border border-gray-200 p-3">
              {users.length === 0 ? (
                <p className="text-sm text-gray-400">No users available</p>
              ) : (
                users.map((u) => (
                  <label key={u.id} className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={interviewerIds.includes(u.id)}
                      onChange={() => toggleInterviewer(u.id)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    {u.first_name} {u.last_name}
                    <span className="text-gray-400">({u.email})</span>
                  </label>
                ))
              )}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className={inputClasses}
              placeholder="Additional notes for the interview panel..."
            />
          </div>

          <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? <Loader className="h-4 w-4 animate-spin" /> : null}
              Schedule Interview
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
