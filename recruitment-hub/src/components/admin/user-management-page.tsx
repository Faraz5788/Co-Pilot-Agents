'use client'

import { Fragment, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDown, ChevronRight, Info, Loader2, Save, UserPlus, X } from 'lucide-react'

import { cn } from '@/lib/utils'
import { useSyncedState } from '@/lib/hooks/use-synced-state'
import type { AdminUserRow, RoleRow } from '@/types/admin'

const ROLE_BADGE_COLORS: Record<string, string> = {
  admin: 'bg-purple-100 text-purple-800',
  rec_admin: 'bg-indigo-100 text-indigo-800',
  recruiter: 'bg-blue-100 text-blue-800',
  hiring_manager: 'bg-amber-100 text-amber-800',
  interviewer: 'bg-emerald-100 text-emerald-800',
  hr_reward: 'bg-pink-100 text-pink-800',
}

const STATUS_BADGE_COLORS: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-800',
  inactive: 'bg-gray-100 text-gray-600',
  pending: 'bg-amber-100 text-amber-800',
}

function roleBadgeColor(name: string) {
  return ROLE_BADGE_COLORS[name] ?? 'bg-gray-100 text-gray-700'
}

function statusBadgeColor(status: string) {
  return STATUS_BADGE_COLORS[status] ?? 'bg-gray-100 text-gray-600'
}

function formatRoleLabel(name: string) {
  return name
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function formatRelativeTime(isoDate: string) {
  const date = new Date(isoDate)
  const diffMs = Date.now() - date.getTime()
  const diffMin = Math.round(diffMs / 60000)

  if (diffMin < 1) return 'just now'
  if (diffMin < 60) return `${diffMin}m ago`
  const diffHr = Math.round(diffMin / 60)
  if (diffHr < 24) return `${diffHr}h ago`
  const diffDay = Math.round(diffHr / 24)
  if (diffDay < 30) return `${diffDay}d ago`
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function userRoleIds(user: AdminUserRow): string[] {
  return (user.user_roles ?? [])
    .map((ur) => ur.role?.id)
    .filter((id): id is string => Boolean(id))
}

interface UserManagementPageProps {
  users: AdminUserRow[]
  roles: RoleRow[]
}

export function UserManagementPage({ users: initialUsers, roles }: UserManagementPageProps) {
  const router = useRouter()
  const [users, setUsers] = useSyncedState(initialUsers)
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null)
  const [selectedRoleIds, setSelectedRoleIds] = useState<Set<string>>(new Set())
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showInviteNote, setShowInviteNote] = useState(false)

  const sortedRoles = useMemo(() => [...roles].sort((a, b) => a.name.localeCompare(b.name)), [roles])

  function toggleExpand(user: AdminUserRow) {
    setError(null)
    if (expandedUserId === user.id) {
      setExpandedUserId(null)
      return
    }
    setExpandedUserId(user.id)
    setSelectedRoleIds(new Set(userRoleIds(user)))
  }

  function toggleRoleChecked(roleId: string) {
    setSelectedRoleIds((prev) => {
      const next = new Set(prev)
      if (next.has(roleId)) next.delete(roleId)
      else next.add(roleId)
      return next
    })
  }

  async function saveRoles(user: AdminUserRow) {
    setSaving(true)
    setError(null)

    const currentIds = new Set(userRoleIds(user))
    const toAdd = [...selectedRoleIds].filter((id) => !currentIds.has(id))
    const toRemove = [...currentIds].filter((id) => !selectedRoleIds.has(id))

    try {
      await Promise.all([
        ...toAdd.map((roleId) =>
          fetch(`/api/admin/users/${user.id}/roles`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ role_id: roleId }),
          }).then(async (res) => {
            if (!res.ok) throw new Error((await res.json().catch(() => null))?.error ?? 'Failed to assign role')
          })
        ),
        ...toRemove.map((roleId) =>
          fetch(`/api/admin/users/${user.id}/roles`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ role_id: roleId }),
          }).then(async (res) => {
            if (!res.ok) throw new Error((await res.json().catch(() => null))?.error ?? 'Failed to remove role')
          })
        ),
      ])

      // Optimistically reflect the new role set locally, then reconcile with
      // the server on the next render.
      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id
            ? {
                ...u,
                user_roles: sortedRoles
                  .filter((r) => selectedRoleIds.has(r.id))
                  .map((role) => ({ role })),
              }
            : u
        )
      )
      setExpandedUserId(null)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update roles')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-7xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-50">Users</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {users.length} user{users.length === 1 ? '' : 's'} with access to the system
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowInviteNote((v) => !v)}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <UserPlus className="h-4 w-4" />
          Invite User
        </button>
      </div>

      {showInviteNote && (
        <div className="mt-4 flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800 dark:border-blue-900 dark:bg-blue-500/10 dark:text-blue-300">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          <div className="flex-1">
            User invitations require the Supabase Auth Admin API. Run{' '}
            <code className="rounded bg-blue-100 px-1 py-0.5 font-mono text-xs dark:bg-blue-500/20">
              npx tsx scripts/setup-demo.ts
            </code>{' '}
            to provision the demo accounts, or wire up{' '}
            <code className="rounded bg-blue-100 px-1 py-0.5 font-mono text-xs dark:bg-blue-500/20">
              POST /api/admin/users
            </code>{' '}
            to your own invitation flow.
          </div>
          <button
            type="button"
            onClick={() => setShowInviteNote(false)}
            className="shrink-0 text-blue-500 hover:text-blue-700 dark:text-blue-400"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-500/10 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="mt-6 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <table className="w-full divide-y divide-gray-200 text-left text-sm dark:divide-gray-800">
          <thead className="bg-gray-50 dark:bg-gray-800/50">
            <tr>
              <th className="w-8 px-4 py-3" />
              <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Name</th>
              <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Email</th>
              <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Roles</th>
              <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Status</th>
              <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Last Active</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {users.map((user) => {
              const isExpanded = expandedUserId === user.id
              const userRoles = (user.user_roles ?? [])
                .map((ur) => ur.role)
                .filter((r): r is RoleRow => r !== null)

              return (
                <Fragment key={user.id}>
                  <tr
                    onClick={() => toggleExpand(user)}
                    className={cn(
                      'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/40',
                      isExpanded && 'bg-gray-50 dark:bg-gray-800/40'
                    )}
                  >
                    <td className="px-4 py-3 text-gray-400">
                      {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-gray-900 dark:text-gray-50">
                      {user.first_name} {user.last_name}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-600 dark:text-gray-300">{user.email}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        {userRoles.length === 0 ? (
                          <span className="text-xs text-gray-400">No roles</span>
                        ) : (
                          userRoles.map((role) => (
                            <span
                              key={role.id}
                              className={cn(
                                'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                                roleBadgeColor(role.name)
                              )}
                            >
                              {formatRoleLabel(role.name)}
                            </span>
                          ))
                        )}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <span
                        className={cn(
                          'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize',
                          statusBadgeColor(user.status)
                        )}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-500 dark:text-gray-400">
                      {formatRelativeTime(user.updated_at)}
                    </td>
                  </tr>

                  {isExpanded && (
                    <tr className="bg-gray-50/70 dark:bg-gray-800/20">
                      <td colSpan={6} className="px-4 py-4">
                        <div className="rounded-md border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-50">
                            Manage roles for {user.first_name} {user.last_name}
                          </p>
                          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                            {sortedRoles.map((role) => (
                              <label
                                key={role.id}
                                className="flex cursor-pointer items-start gap-2 rounded-md border border-gray-200 p-2.5 text-sm hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/40"
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedRoleIds.has(role.id)}
                                  onChange={() => toggleRoleChecked(role.id)}
                                  className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span>
                                  <span className="block font-medium text-gray-900 dark:text-gray-50">
                                    {formatRoleLabel(role.name)}
                                  </span>
                                  {role.description && (
                                    <span className="block text-xs text-gray-500 dark:text-gray-400">
                                      {role.description}
                                    </span>
                                  )}
                                </span>
                              </label>
                            ))}
                          </div>
                          <div className="mt-4 flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setExpandedUserId(null)}
                              className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              disabled={saving}
                              onClick={() => saveRoles(user)}
                              className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                              Save Roles
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              )
            })}
          </tbody>
        </table>

        {users.length === 0 && (
          <div className="py-16 text-center text-sm text-gray-500 dark:text-gray-400">No users found.</div>
        )}
      </div>
    </div>
  )
}
