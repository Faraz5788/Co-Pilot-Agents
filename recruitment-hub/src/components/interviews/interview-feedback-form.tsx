'use client'

import { useState } from 'react'
import { Loader, Star, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  INTERVIEW_TYPE_LABELS,
  RECOMMENDATION_COLORS,
  RECOMMENDATION_LABELS,
} from '@/lib/constants'
import type { InterviewType, RecommendationType } from '@/types/database'

export interface Competency {
  id: string
  name: string
  description?: string | null
  category?: string | null
}

export interface FeedbackInterview {
  id: string
  interview_type: InterviewType
  scheduled_start: string
  application?: {
    candidate?: { first_name: string; last_name: string } | null
  } | null
}

export interface InterviewFeedbackFormProps {
  open: boolean
  onClose: () => void
  onSubmitted: () => void
  interview: FeedbackInterview
  competencies: Competency[]
}

const inputClasses =
  'w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none'

const RECOMMENDATION_OPTIONS: RecommendationType[] = ['strong_yes', 'yes', 'mixed', 'no', 'strong_no']

function StarRating({
  value,
  onChange,
}: {
  value: number
  onChange: (value: number) => void
}) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className="rounded p-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label={`Rate ${n} out of 5`}
        >
          <Star
            className={cn(
              'h-5 w-5',
              n <= value ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
            )}
          />
        </button>
      ))}
    </div>
  )
}

export function InterviewFeedbackForm({
  open,
  onClose,
  onSubmitted,
  interview,
  competencies,
}: InterviewFeedbackFormProps) {
  const [scores, setScores] = useState<Record<string, number>>({})
  const [comments, setComments] = useState<Record<string, string>>({})
  const [strengths, setStrengths] = useState('')
  const [concerns, setConcerns] = useState('')
  const [overallScore, setOverallScore] = useState<number>(3)
  const [recommendation, setRecommendation] = useState<RecommendationType>('yes')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      const feedback = competencies
        .filter((c) => scores[c.id] > 0)
        .map((c) => ({
          competency_id: c.id,
          score: scores[c.id],
          comments: comments[c.id] || undefined,
        }))

      const response = await fetch(`/api/interviews/${interview.id}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          overall_recommendation: recommendation,
          overall_score: overallScore,
          strengths: strengths || undefined,
          concerns: concerns || undefined,
          feedback,
        }),
      })

      if (!response.ok) {
        const body = await response.json().catch(() => null)
        throw new Error(body?.error ?? 'Failed to submit feedback')
      }

      onSubmitted()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit feedback')
    } finally {
      setSubmitting(false)
    }
  }

  if (!open) return null

  const candidateName = interview.application?.candidate
    ? `${interview.application.candidate.first_name} ${interview.application.candidate.last_name}`
    : 'Candidate'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white shadow-xl">
        <div className="flex items-start justify-between border-b border-gray-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Interview Scorecard</h2>
            <p className="mt-0.5 text-sm text-gray-500">
              {candidateName} &middot; {INTERVIEW_TYPE_LABELS[interview.interview_type]} &middot;{' '}
              {new Date(interview.scheduled_start).toLocaleString(undefined, {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 px-6 py-5">
          {error ? (
            <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
          ) : null}

          {competencies.length > 0 ? (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900">Competency Ratings</h3>
              {competencies.map((c) => (
                <div key={c.id} className="rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{c.name}</p>
                      {c.description ? (
                        <p className="text-xs text-gray-500">{c.description}</p>
                      ) : null}
                    </div>
                    <StarRating
                      value={scores[c.id] ?? 0}
                      onChange={(v) => setScores((prev) => ({ ...prev, [c.id]: v }))}
                    />
                  </div>
                  <textarea
                    value={comments[c.id] ?? ''}
                    onChange={(e) =>
                      setComments((prev) => ({ ...prev, [c.id]: e.target.value }))
                    }
                    rows={2}
                    placeholder="Comments (optional)"
                    className={cn(inputClasses, 'mt-3')}
                  />
                </div>
              ))}
            </div>
          ) : null}

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Strengths</label>
            <textarea
              value={strengths}
              onChange={(e) => setStrengths(e.target.value)}
              rows={3}
              className={inputClasses}
              placeholder="What stood out positively?"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Concerns</label>
            <textarea
              value={concerns}
              onChange={(e) => setConcerns(e.target.value)}
              rows={3}
              className={inputClasses}
              placeholder="Any areas of concern?"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Overall Score</label>
              <select
                value={overallScore}
                onChange={(e) => setOverallScore(Number(e.target.value))}
                className={inputClasses}
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    {n} / 5
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Overall Recommendation
              </label>
              <select
                value={recommendation}
                onChange={(e) => setRecommendation(e.target.value as RecommendationType)}
                className={inputClasses}
              >
                {RECOMMENDATION_OPTIONS.map((value) => (
                  <option key={value} value={value}>
                    {RECOMMENDATION_LABELS[value]}
                  </option>
                ))}
              </select>
              <span
                className={cn(
                  'mt-2 inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium',
                  RECOMMENDATION_COLORS[recommendation]
                )}
              >
                {RECOMMENDATION_LABELS[recommendation]}
              </span>
            </div>
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
              Submit Feedback
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
