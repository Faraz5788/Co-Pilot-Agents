'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Plus, Tag } from 'lucide-react'

import { cn } from '@/lib/utils'
import { useSyncedState } from '@/lib/hooks/use-synced-state'
import type { SourceRow } from '@/types/admin'

const CATEGORY_OPTIONS = [
  { value: 'job_board', label: 'Job Board' },
  { value: 'referral', label: 'Referral' },
  { value: 'agency', label: 'Agency' },
  { value: 'social', label: 'Social' },
  { value: 'career_site', label: 'Career Site' },
  { value: 'internal', label: 'Internal' },
  { value: 'other', label: 'Other' },
]

const CATEGORY_COLORS: Record<string, string> = {
  job_board: 'bg-blue-100 text-blue-800',
  referral: 'bg-emerald-100 text-emerald-800',
  agency: 'bg-violet-100 text-violet-800',
  social: 'bg-pink-100 text-pink-800',
  career_site: 'bg-amber-100 text-amber-800',
  internal: 'bg-slate-100 text-slate-700',
  other: 'bg-gray-100 text-gray-600',
}

function categoryLabel(category: string | null) {
  if (!category) return 'Uncategorised'
  return CATEGORY_OPTIONS.find((c) => c.value === category)?.label ?? category
}

interface SourceManagementPageProps {
  sources: SourceRow[]
}

export function SourceManagementPage({ sources: initialSources }: SourceManagementPageProps) {
  const router = useRouter()
  const [sources, setSources] = useSyncedState(initialSources)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [category, setCategory] = useState('job_board')
  const [creating, setCreating] = useState(false)

  async function createSource() {
    if (!name.trim()) {
      setError('Source name is required')
      return
    }
    setCreating(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), category }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => null)
        throw new Error(body?.error ?? 'Failed to create source')
      }
      setName('')
      setCategory('job_board')
      setShowForm(false)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create source')
    } finally {
      setCreating(false)
    }
  }

  async function toggleActive(source: SourceRow) {
    setBusyId(source.id)
    setError(null)
    try {
      const res = await fetch('/api/admin/sources', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: source.id, active: !source.active }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => null)
        throw new Error(body?.error ?? 'Failed to update source')
      }
      setSources((prev) => prev.map((s) => (s.id === source.id ? { ...s, active: !s.active } : s)))
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update source')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-50">Sources</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Channels candidates can be attributed to when they apply.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Add Source
        </button>
      </div>

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-500/10 dark:text-red-400">
          {error}
        </div>
      )}

      {showForm && (
        <div className="mt-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-50">New source</p>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Source name"
              className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 sm:col-span-2"
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
            >
              {CATEGORY_OPTIONS.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
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
              onClick={createSource}
              className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {creating && <Loader2 className="h-4 w-4 animate-spin" />}
              Create Source
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
            {sources.map((source) => (
              <tr key={source.id} className={cn(!source.active && 'opacity-60')}>
                <td className="whitespace-nowrap px-4 py-3 font-medium text-gray-900 dark:text-gray-50">
                  <span className="inline-flex items-center gap-2">
                    <Tag className="h-3.5 w-3.5 text-gray-400" />
                    {source.name}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <span
                    className={cn(
                      'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                      CATEGORY_COLORS[source.category ?? ''] ?? 'bg-gray-100 text-gray-600'
                    )}
                  >
                    {categoryLabel(source.category)}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-gray-600 dark:text-gray-300">
                  {source.active ? 'Active' : 'Inactive'}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right">
                  <button
                    type="button"
                    disabled={busyId === source.id}
                    onClick={() => toggleActive(source)}
                    className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                  >
                    {busyId === source.id && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    {source.active ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {sources.length === 0 && (
          <div className="py-16 text-center text-sm text-gray-500 dark:text-gray-400">
            No sources configured yet.
          </div>
        )}
      </div>
    </div>
  )
}
