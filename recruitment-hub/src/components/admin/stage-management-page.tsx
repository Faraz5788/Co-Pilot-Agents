'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowDown, ArrowUp, Check, Loader2, Pencil, Plus, X } from 'lucide-react'

import { cn } from '@/lib/utils'
import { useSyncedState } from '@/lib/hooks/use-synced-state'
import type { PipelineStageRow, StageType } from '@/types/admin'

const STAGE_TYPES: StageType[] = [
  'application',
  'screening',
  'review',
  'interview',
  'offer',
  'hired',
  'rejected',
  'withdrawn',
]

const STAGE_TYPE_LABELS: Record<StageType, string> = {
  application: 'Application',
  screening: 'Screening',
  review: 'Review',
  interview: 'Interview',
  offer: 'Offer',
  hired: 'Hired',
  rejected: 'Rejected',
  withdrawn: 'Withdrawn',
}

const STAGE_TYPE_COLORS: Record<StageType, string> = {
  application: 'bg-slate-100 text-slate-700',
  screening: 'bg-blue-100 text-blue-800',
  review: 'bg-indigo-100 text-indigo-800',
  interview: 'bg-violet-100 text-violet-800',
  offer: 'bg-amber-100 text-amber-800',
  hired: 'bg-emerald-100 text-emerald-800',
  rejected: 'bg-red-100 text-red-800',
  withdrawn: 'bg-gray-100 text-gray-600',
}

async function patchStage(id: string, values: Record<string, unknown>) {
  const res = await fetch('/api/admin/stages', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, ...values }),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new Error(body?.error ?? 'Failed to update stage')
  }
  return res.json()
}

interface StageManagementPageProps {
  stages: PipelineStageRow[]
}

export function StageManagementPage({ stages: initialStages }: StageManagementPageProps) {
  const router = useRouter()
  const sortedInitialStages = useMemo(
    () => [...initialStages].sort((a, b) => a.display_order - b.display_order),
    [initialStages]
  )
  const [stages, setStages] = useSyncedState(sortedInitialStages)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editType, setEditType] = useState<StageType>('screening')
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [showAddForm, setShowAddForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [newType, setNewType] = useState<StageType>('screening')
  const [newOrder, setNewOrder] = useState<number>(initialStages.length + 1)
  const [creating, setCreating] = useState(false)

  function openAddForm() {
    setNewOrder(stages.length + 1)
    setShowAddForm(true)
  }

  function startEdit(stage: PipelineStageRow) {
    setError(null)
    setEditingId(stage.id)
    setEditName(stage.name)
    setEditType(stage.stage_type)
  }

  function cancelEdit() {
    setEditingId(null)
  }

  async function saveEdit(stage: PipelineStageRow) {
    setBusyId(stage.id)
    setError(null)
    try {
      await patchStage(stage.id, { name: editName.trim(), stage_type: editType })
      setStages((prev) =>
        prev.map((s) => (s.id === stage.id ? { ...s, name: editName.trim(), stage_type: editType } : s))
      )
      setEditingId(null)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update stage')
    } finally {
      setBusyId(null)
    }
  }

  async function toggleActive(stage: PipelineStageRow) {
    setBusyId(stage.id)
    setError(null)
    try {
      await patchStage(stage.id, { active: !stage.active })
      setStages((prev) => prev.map((s) => (s.id === stage.id ? { ...s, active: !s.active } : s)))
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update stage')
    } finally {
      setBusyId(null)
    }
  }

  async function move(index: number, direction: -1 | 1) {
    const targetIndex = index + direction
    if (targetIndex < 0 || targetIndex >= stages.length) return

    const current = stages[index]
    const target = stages[targetIndex]

    setBusyId(current.id)
    setError(null)
    try {
      await Promise.all([
        patchStage(current.id, { display_order: target.display_order }),
        patchStage(target.id, { display_order: current.display_order }),
      ])

      setStages((prev) => {
        const next = [...prev]
        const a = { ...next[index], display_order: next[targetIndex].display_order }
        const b = { ...next[targetIndex], display_order: next[index].display_order }
        next[index] = b
        next[targetIndex] = a
        return next.sort((x, y) => x.display_order - y.display_order)
      })
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reorder stages')
    } finally {
      setBusyId(null)
    }
  }

  async function createStage() {
    if (!newName.trim()) {
      setError('Stage name is required')
      return
    }
    setCreating(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/stages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName.trim(),
          stage_type: newType,
          display_order: newOrder,
        }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => null)
        throw new Error(body?.error ?? 'Failed to create stage')
      }
      setNewName('')
      setNewType('screening')
      setShowAddForm(false)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create stage')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-50">Pipeline Stages</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Define the stages candidates move through, in order.
          </p>
        </div>
        <button
          type="button"
          onClick={() => (showAddForm ? setShowAddForm(false) : openAddForm())}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Add Stage
        </button>
      </div>

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-500/10 dark:text-red-400">
          {error}
        </div>
      )}

      {showAddForm && (
        <div className="mt-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-50">New stage</p>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-4">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Stage name"
              className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 sm:col-span-2"
            />
            <select
              value={newType}
              onChange={(e) => setNewType(e.target.value as StageType)}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
            >
              {STAGE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {STAGE_TYPE_LABELS[type]}
                </option>
              ))}
            </select>
            <input
              type="number"
              min={1}
              value={newOrder}
              onChange={(e) => setNewOrder(Number(e.target.value))}
              placeholder="Display order"
              className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
            />
          </div>
          <div className="mt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={creating}
              onClick={createStage}
              className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {creating && <Loader2 className="h-4 w-4 animate-spin" />}
              Create Stage
            </button>
          </div>
        </div>
      )}

      <ol className="mt-6 space-y-2">
        {stages.map((stage, index) => {
          const isEditing = editingId === stage.id
          const isBusy = busyId === stage.id

          return (
            <li
              key={stage.id}
              className={cn(
                'flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 shadow-sm dark:border-gray-800 dark:bg-gray-900',
                !stage.active && 'opacity-60'
              )}
            >
              <div className="flex flex-col gap-0.5">
                <button
                  type="button"
                  disabled={index === 0 || isBusy}
                  onClick={() => move(index, -1)}
                  className="rounded p-0.5 text-gray-400 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-30 dark:hover:text-gray-200"
                  aria-label="Move up"
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  disabled={index === stages.length - 1 || isBusy}
                  onClick={() => move(index, 1)}
                  className="rounded p-0.5 text-gray-400 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-30 dark:hover:text-gray-200"
                  aria-label="Move down"
                >
                  <ArrowDown className="h-4 w-4" />
                </button>
              </div>

              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                {index + 1}
              </span>

              {isEditing ? (
                <div className="flex flex-1 flex-wrap items-center gap-2">
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="min-w-[10rem] flex-1 rounded-md border border-gray-300 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                  />
                  <select
                    value={editType}
                    onChange={(e) => setEditType(e.target.value as StageType)}
                    className="rounded-md border border-gray-300 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                  >
                    {STAGE_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {STAGE_TYPE_LABELS[type]}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => saveEdit(stage)}
                    className="rounded-md bg-blue-600 p-1.5 text-white hover:bg-blue-700 disabled:opacity-60"
                    aria-label="Save"
                  >
                    {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="rounded-md border border-gray-300 p-1.5 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                    aria-label="Cancel"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex flex-1 items-center gap-2">
                    <span className="font-medium text-gray-900 dark:text-gray-50">{stage.name}</span>
                    {stage.is_default && (
                      <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-blue-700">
                        Default
                      </span>
                    )}
                    <span
                      className={cn(
                        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                        STAGE_TYPE_COLORS[stage.stage_type]
                      )}
                    >
                      {STAGE_TYPE_LABELS[stage.stage_type]}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => startEdit(stage)}
                    className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                    aria-label="Edit stage"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => toggleActive(stage)}
                    role="switch"
                    aria-checked={stage.active}
                    className={cn(
                      'relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors disabled:opacity-60',
                      stage.active ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-700'
                    )}
                  >
                    <span
                      className={cn(
                        'inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform',
                        stage.active ? 'translate-x-4' : 'translate-x-0.5'
                      )}
                    />
                  </button>
                </>
              )}
            </li>
          )
        })}
      </ol>

      {stages.length === 0 && (
        <div className="mt-6 rounded-lg border border-dashed border-gray-300 bg-white py-16 text-center text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400">
          No pipeline stages configured yet.
        </div>
      )}
    </div>
  )
}
