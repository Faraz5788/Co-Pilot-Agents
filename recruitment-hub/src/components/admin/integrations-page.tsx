'use client'

import { useState } from 'react'
import {
  CheckCircle2,
  Clock,
  Landmark,
  Loader2,
  Mail,
  MessageSquare,
  RefreshCw,
  Shield,
  XCircle,
  Zap,
  type LucideIcon,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import type { IntegrationEventRow, IntegrationStatus } from '@/types/admin'

const EVENT_STATUS_COLORS: Record<IntegrationStatus, string> = {
  queued: 'bg-gray-100 text-gray-600',
  processing: 'bg-blue-100 text-blue-800',
  success: 'bg-emerald-100 text-emerald-800',
  failed: 'bg-red-100 text-red-800',
  retrying: 'bg-amber-100 text-amber-800',
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

interface ConnectionCardProps {
  name: string
  description: string
  icon: LucideIcon
  fields: Array<{ label: string; placeholder: string }>
}

function ConnectionCard({ name, description, icon: Icon, fields }: ConnectionCardProps) {
  const [testing, setTesting] = useState(false)
  const [result, setResult] = useState<'success' | 'failure' | null>(null)

  function testConnection() {
    setTesting(true)
    setResult(null)
    setTimeout(() => {
      setTesting(false)
      setResult('failure')
    }, 1200)
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300">
            <Icon className="h-5 w-5" />
          </span>
          <div>
            <p className="font-semibold text-gray-900 dark:text-gray-50">{name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
          </div>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
          <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
          Not Connected
        </span>
      </div>

      <div className="mt-5 space-y-3">
        {fields.map((field) => (
          <div key={field.label}>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">{field.label}</label>
            <input
              disabled
              placeholder={field.placeholder}
              className="mt-1 w-full cursor-not-allowed rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-400 dark:border-gray-800 dark:bg-gray-800/50"
            />
          </div>
        ))}
      </div>

      <div className="mt-5 flex items-center gap-3">
        <button
          type="button"
          onClick={testConnection}
          disabled={testing}
          className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          {testing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          Test Connection
        </button>
        <button
          type="button"
          disabled
          className="inline-flex cursor-not-allowed items-center gap-2 rounded-md bg-blue-600/50 px-3 py-1.5 text-sm font-medium text-white"
        >
          Connect
        </button>
        {result === 'failure' && (
          <span className="inline-flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400">
            <XCircle className="h-3.5 w-3.5" />
            No credentials configured
          </span>
        )}
      </div>
    </div>
  )
}

function ComingSoonCard({ name, icon: Icon }: { name: string; icon: LucideIcon }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/40">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-white text-gray-400 shadow-sm dark:bg-gray-800">
        <Icon className="h-4 w-4" />
      </span>
      <div>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{name}</p>
        <p className="text-xs text-gray-400 dark:text-gray-500">Coming soon</p>
      </div>
    </div>
  )
}

interface IntegrationsPageProps {
  events: IntegrationEventRow[]
}

export function IntegrationsPage({ events }: IntegrationsPageProps) {
  return (
    <div className="mx-auto max-w-6xl">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-50">Integrations</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Connect external systems to keep reference data and worker records in sync.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ConnectionCard
          name="Workday"
          description="Sync departments, positions, workers and requisitions"
          icon={Landmark}
          fields={[
            { label: 'Tenant URL', placeholder: 'https://your-tenant.workday.com' },
            { label: 'Client ID', placeholder: '••••••••••••••••' },
            { label: 'Client Secret', placeholder: '••••••••••••••••' },
          ]}
        />
        <ConnectionCard
          name="Microsoft 365"
          description="Calendar scheduling, mail and single sign-on"
          icon={Mail}
          fields={[
            { label: 'Tenant ID', placeholder: '00000000-0000-0000-0000-000000000000' },
            { label: 'Application (Client) ID', placeholder: '00000000-0000-0000-0000-000000000000' },
          ]}
        />
      </div>

      <div className="mt-8">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-50">More integrations</h2>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <ComingSoonCard name="Slack" icon={MessageSquare} />
          <ComingSoonCard name="DocuSign" icon={Shield} />
          <ComingSoonCard name="LinkedIn Recruiter" icon={Zap} />
          <ComingSoonCard name="Greenhouse" icon={CheckCircle2} />
        </div>
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-50">Integration Events</h2>
          <span className="inline-flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
            <Clock className="h-3.5 w-3.5" />
            Last {events.length} events
          </span>
        </div>

        <div className="mt-3 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <table className="w-full divide-y divide-gray-200 text-left text-sm dark:divide-gray-800">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Integration</th>
                <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Direction</th>
                <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Object</th>
                <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Status</th>
                <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Occurred</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {events.map((event) => (
                <tr key={event.id}>
                  <td className="whitespace-nowrap px-4 py-3 font-medium capitalize text-gray-900 dark:text-gray-50">
                    {event.integration}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 capitalize text-gray-600 dark:text-gray-300">
                    {event.direction}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-600 dark:text-gray-300">
                    {event.object_type}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <span
                      className={cn(
                        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize',
                        EVENT_STATUS_COLORS[event.status]
                      )}
                    >
                      {event.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-500 dark:text-gray-400">
                    {formatDateTime(event.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {events.length === 0 && (
            <div className="py-16 text-center text-sm text-gray-500 dark:text-gray-400">
              No integration activity yet.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
