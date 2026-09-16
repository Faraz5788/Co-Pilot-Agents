'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PipelineApplicationCandidate {
  id: string
  first_name: string
  last_name: string
  current_employer: string | null
  current_job_title: string | null
}

export interface PipelineApplication {
  id: string
  application_date: string
  created_at: string
  /**
   * When the application entered its current stage, if known. Falls back to
   * `created_at` (the application's creation date) when not provided, since
   * stage-entry timestamps live in `application_stage_history` and may not
   * always be joined in by the caller.
   */
  stage_entered_at?: string | null
  candidate: PipelineApplicationCandidate | null
}

export interface PipelineColumn {
  id: string
  name: string
  stage_type: string
  display_order: number
  applications: PipelineApplication[]
}

interface PipelineBoardProps {
  columns: PipelineColumn[]
  /** Called after a card is successfully moved to a new stage. */
  onMoved?: () => void
}

const cardClass = 'rounded-lg border border-gray-200 bg-white shadow-sm'

function daysSince(value: string) {
  const then = new Date(value).getTime()
  if (Number.isNaN(then)) return null
  const diffMs = Date.now() - then
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)))
}

export function PipelineBoard({ columns, onMoved }: PipelineBoardProps) {
  const router = useRouter()
  const [movingId, setMovingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const sortedColumns = [...columns].sort((a, b) => a.display_order - b.display_order)

  async function moveCard(applicationId: string, toStageId: string) {
    setMovingId(applicationId)
    setError(null)
    try {
      const res = await fetch(`/api/applications/${applicationId}/stage`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to_stage_id: toStageId }),
      })
      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        setError(json.error?.message ?? 'Failed to move application')
        return
      }
      if (onMoved) {
        onMoved()
      } else {
        router.refresh()
      }
    } finally {
      setMovingId(null)
    }
  }

  return (
    <div>
      {error && (
        <p className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {sortedColumns.map((column, columnIndex) => {
          const previousColumn = sortedColumns[columnIndex - 1]
          const nextColumn = sortedColumns[columnIndex + 1]

          return (
            <div key={column.id} className="w-72 flex-shrink-0">
              <div className="mb-3 flex items-center justify-between px-1">
                <h3 className="text-sm font-semibold text-gray-900">{column.name}</h3>
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                  {column.applications.length}
                </span>
              </div>
              <div className="space-y-3">
                {column.applications.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-gray-200 p-4 text-center text-xs text-gray-400">
                    No candidates
                  </div>
                ) : (
                  column.applications.map((app) => {
                    const entered = app.stage_entered_at ?? app.created_at
                    const days = daysSince(entered)
                    const isMoving = movingId === app.id

                    return (
                      <div
                        key={app.id}
                        onClick={() => router.push(`/applications/${app.id}`)}
                        className={cn(cardClass, 'cursor-pointer p-3 hover:border-blue-300 hover:shadow')}
                      >
                        <p className="text-sm font-medium text-gray-900">
                          {app.candidate ? `${app.candidate.first_name} ${app.candidate.last_name}` : 'Unknown candidate'}
                        </p>
                        <p className="mt-0.5 truncate text-xs text-gray-500">
                          {app.candidate?.current_job_title || app.candidate?.current_employer
                            ? [app.candidate?.current_job_title, app.candidate?.current_employer]
                                .filter(Boolean)
                                .join(' at ')
                            : 'No current role on file'}
                        </p>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-xs text-gray-400">
                            {days !== null ? `${days} day${days === 1 ? '' : 's'} in stage` : ''}
                          </span>
                          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              title={previousColumn ? `Move to ${previousColumn.name}` : undefined}
                              disabled={!previousColumn || isMoving}
                              onClick={() => previousColumn && void moveCard(app.id, previousColumn.id)}
                              className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-30"
                            >
                              <ChevronLeft className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              title={nextColumn ? `Move to ${nextColumn.name}` : undefined}
                              disabled={!nextColumn || isMoving}
                              onClick={() => nextColumn && void moveCard(app.id, nextColumn.id)}
                              className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-30"
                            >
                              <ChevronRight className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
