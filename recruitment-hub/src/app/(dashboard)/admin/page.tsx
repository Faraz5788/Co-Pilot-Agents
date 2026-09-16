import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'
import { Database, GitBranch, Plug, Shield, Tag, UserCog, XCircle } from 'lucide-react'

import { createClient } from '@/lib/supabase/server'

export const metadata = {
  title: 'Administration',
}

interface AdminSection {
  title: string
  description: string
  href: string
  icon: LucideIcon
  accent: string
  count: number | null
  countLabel: string
}

async function getCount(
  supabase: Awaited<ReturnType<typeof createClient>>,
  table: string
): Promise<number> {
  const { count } = await supabase.from(table).select('id', { count: 'exact', head: true })
  return count ?? 0
}

export default async function AdminPage() {
  const supabase = await createClient()

  const [
    userCount,
    stageCount,
    sourceCount,
    reasonCount,
    departmentCount,
    locationCount,
    costCentreCount,
    jobProfileCount,
    positionCount,
    gradeCount,
    competencyCount,
    integrationEventCount,
    auditLogCount,
  ] = await Promise.all([
    getCount(supabase, 'users'),
    getCount(supabase, 'pipeline_stages'),
    getCount(supabase, 'sources'),
    getCount(supabase, 'rejection_reasons'),
    getCount(supabase, 'departments'),
    getCount(supabase, 'locations'),
    getCount(supabase, 'cost_centres'),
    getCount(supabase, 'job_profiles'),
    getCount(supabase, 'positions'),
    getCount(supabase, 'grades'),
    getCount(supabase, 'competencies'),
    getCount(supabase, 'integration_events'),
    getCount(supabase, 'audit_log'),
  ])

  const referenceDataCount =
    departmentCount +
    locationCount +
    costCentreCount +
    jobProfileCount +
    positionCount +
    gradeCount +
    competencyCount

  const sections: AdminSection[] = [
    {
      title: 'Users',
      description: 'Manage user accounts and role assignments.',
      href: '/admin/users',
      icon: UserCog,
      accent: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
      count: userCount,
      countLabel: userCount === 1 ? 'user' : 'users',
    },
    {
      title: 'Pipeline Stages',
      description: 'Configure the recruitment pipeline stages and their order.',
      href: '/admin/stages',
      icon: GitBranch,
      accent: 'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400',
      count: stageCount,
      countLabel: stageCount === 1 ? 'stage' : 'stages',
    },
    {
      title: 'Sources',
      description: 'Manage the candidate sourcing channels used across the system.',
      href: '/admin/sources',
      icon: Tag,
      accent: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
      count: sourceCount,
      countLabel: sourceCount === 1 ? 'source' : 'sources',
    },
    {
      title: 'Rejection Reasons',
      description: 'Maintain the standard reasons used when rejecting candidates.',
      href: '/admin/rejection-reasons',
      icon: XCircle,
      accent: 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400',
      count: reasonCount,
      countLabel: reasonCount === 1 ? 'reason' : 'reasons',
    },
    {
      title: 'Reference Data',
      description: 'Departments, locations, cost centres, job profiles and more.',
      href: '/admin/reference-data',
      icon: Database,
      accent: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
      count: referenceDataCount,
      countLabel: 'records',
    },
    {
      title: 'Integrations',
      description: 'Workday and Microsoft 365 connections and sync activity.',
      href: '/admin/integrations',
      icon: Plug,
      accent: 'bg-cyan-50 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-400',
      count: integrationEventCount,
      countLabel: integrationEventCount === 1 ? 'event' : 'events',
    },
    {
      title: 'Audit Logs',
      description: 'Review every change made across the system.',
      href: '/admin/audit-logs',
      icon: Shield,
      accent: 'bg-slate-100 text-slate-600 dark:bg-slate-500/10 dark:text-slate-400',
      count: auditLogCount,
      countLabel: auditLogCount === 1 ? 'entry' : 'entries',
    },
  ]

  return (
    <div className="mx-auto max-w-7xl">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-50">Administration</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Manage users, reference data and system configuration.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map((section) => {
          const Icon = section.icon
          return (
            <Link
              key={section.href}
              href={section.href}
              className="group flex flex-col rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-colors hover:border-gray-300 hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700"
            >
              <div className="flex items-start justify-between">
                <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${section.accent}`}>
                  <Icon className="h-5 w-5" />
                </span>
                {section.count !== null && (
                  <div className="text-right">
                    <p className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-50">
                      {section.count}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">{section.countLabel}</p>
                  </div>
                )}
              </div>
              <h2 className="mt-4 text-base font-semibold text-gray-900 group-hover:text-blue-600 dark:text-gray-50 dark:group-hover:text-blue-400">
                {section.title}
              </h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{section.description}</p>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
