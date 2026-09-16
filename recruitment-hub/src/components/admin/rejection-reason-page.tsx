'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Plus, XCircle } from 'lucide-react'

import { cn } from '@/lib/utils'
import { useSyncedState } from '@/lib/hooks/use-synced-state'
import type { RejectionReasonRow } from '@/types/admin'

const CATEGORY_COLORS: Record<string, string> = {
  screening: 'bg-blue-100 text-blue-800',
  interview: 'bg-violet-100 text-violet-800',
  offer: 'bg-amber-100 text-amber-800',
  candidate_decision: 'bg-emerald-100 text-emerald-800',
  process: 'bg-slate-100 text-slate-700',
}

function categoryBadgeClass(category: string | null) {
  if (!category) return 'bg-gray-100 text-gray-600'
  return CATEGORY_COLORS[category] ?? 'bg-gray-100 text-gray-600'
}

interface RejectionReasonPageProps {
  reasons: RejectionReasonRow[]
}

export function RejectionReasonPage({ reasons: initialReasons }: RejectionReasonPageProps) {
  const router = useRouter()
  const [reasons, setReasons] = useSyncedState(initialReasons)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [creating, setCreating] = useState(false)

  async function createReason() {
    if (!name.trim()) {
      setError('Reason name is required')
      return
    }
    setCreating(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/rejection-reasons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), category: category.trim() || undefined }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => null)
        throw new Error(body?.error ?? 'Failed to create rejection reason')
      }
      setName('')
      setCategory('')
      setShowForm(false)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create rejection reason')
    } finally {
      setCreating(false)
    }
  }

  async function toggleActive(reason: RejectionReasonRow) {
    setBusyId(reason.id)
    setError(null)
    try {
      const res = await fetch('/api/admin/rejection-reasons', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: reason.id, active: !reason.active }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => null)
        throw new Error(body?.error ?? 'Failed to update rejection reason')
      }
      setReasons((prev) => prev.map((r) => (r.id === reason.id ? { ...r, active: !r.active } : r)))
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update rejection reason')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-50">Rejection Reasons</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Standard reasons recruiters can select when rejecting a candidate.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Add Reason
        </button>
      </div>

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-500/10 dark:text-red-400">
          {error}
        </div>
      )}

      {showForm && (
        <div className="mt-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-50">New rejection reason</p>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Reason name"
              className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 sm:col-span-2"
            />
            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Category (optional)"
              className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
            />
          </div>
          <div className="mt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={creating}
              onClick={createReason}
              className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {creating && <Loader2 className="h-4 w-4 animate-spin" />}
              Create Reason
            </button>
          </div>
        </div>
      )}

      <div className="mt-6 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <table className="w-full divide-y divide-gray-200 text-left text-sm dark:divide-gray-800">
          <thead className="bg-gray-50 dark:bg-gray-800/50">
            <tr>
              <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Name</th>
              <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Category</th>
              <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Active</th>
              <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {reasons.map((reason) => (
              <tr key={reason.id} className={cn(!reason.active && 'opacity-60')}>
                <td className="whitespace-nowrap px-4 py-3 font-medium text-gray-900 dark:text-gray-50">
                  <span className="inline-flex items-center gap-2">
                    <XCircle className="h-3.5 w-3.5 text-gray-400" />
                    {reason.name}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  {reason.category ? (
                    <span
                      className={cn(
                        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize',
                        categoryBadgeClass(reason.category)
                      )}
                    >
                      {reason.category.replace(/_/g, ' ')}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400">—</span>
                  )}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-gray-600 dark:text-gray-300">
                  {reason.active ? 'Active' : 'Inactive'}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right">
                  <button
                    type="button"
                    disabled={busyId === reason.id}
                    onClick={() => toggleActive(reason)}
                    className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                  >
                    {busyId === reason.id && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    {reason.active ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {reasons.length === 0 && (
          <div className="py-16 text-center text-sm text-gray-500 dark:text-gray-400">
            No rejection reasons configured yet.
          </div>
        )}
      </div>
    </div>
  )
}
