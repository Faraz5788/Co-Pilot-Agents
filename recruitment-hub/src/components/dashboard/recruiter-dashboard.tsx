'use client'

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  Briefcase,
  CalendarClock,
  FileSignature,
  FileText,
  History,
  UserCheck,
  Users,
} from 'lucide-react'
import type { DashboardMetrics } from '@/lib/services/analytics'
import { StatCard } from '@/components/dashboard/stat-card'
import { ChartEmptyState } from '@/components/dashboard/empty-state'

const CHART_COLORS = [
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#06b6d4',
  '#f97316',
  '#ec4899',
]

interface RecruiterDashboardProps {
  metrics: DashboardMetrics
}

export function RecruiterDashboard({ metrics }: RecruiterDashboardProps) {
  const {
    openRequisitions,
    activeApplications,
    interviewsThisWeek,
    pendingOffers,
    hiredThisMonth,
    totalCandidates,
    applicationsByStage,
    applicationsBySource,
    requisitionsByStatus,
    recentActivity,
  } = metrics

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-50">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          A snapshot of your recruitment pipeline and hiring activity.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard
          title="Open Requisitions"
          value={openRequisitions}
          icon={<Briefcase className="h-5 w-5" />}
          color="border-l-blue-500"
        />
        <StatCard
          title="Active Applications"
          value={activeApplications}
          icon={<FileText className="h-5 w-5" />}
          color="border-l-emerald-500"
        />
        <StatCard
          title="Interviews This Week"
          value={interviewsThisWeek}
          icon={<CalendarClock className="h-5 w-5" />}
          color="border-l-amber-500"
        />
        <StatCard
          title="Pending Offers"
          value={pendingOffers}
          icon={<FileSignature className="h-5 w-5" />}
          color="border-l-violet-500"
        />
        <StatCard
          title="Hired This Month"
          value={hiredThisMonth}
          icon={<UserCheck className="h-5 w-5" />}
          color="border-l-pink-500"
        />
        <StatCard
          title="Total Candidates"
          value={totalCandidates}
          icon={<Users className="h-5 w-5" />}
          color="border-l-cyan-500"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-lg border bg-white shadow-sm p-6 dark:bg-gray-900 dark:border-gray-800 lg:col-span-2">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-50">
            Applications by Stage
          </h2>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
            Active applications currently sitting in each pipeline stage
          </p>
          <div className="mt-4 h-80">
            {applicationsByStage.length === 0 ? (
              <ChartEmptyState />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={applicationsByStage}
                  layout="vertical"
                  margin={{ top: 4, right: 24, bottom: 4, left: 8 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-gray-100 dark:text-gray-800" horizontal={false} />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                  <YAxis
                    type="category"
                    dataKey="stage"
                    width={140}
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(59,130,246,0.06)' }}
                    contentStyle={{ borderRadius: 8, fontSize: 12, border: '1px solid #e5e7eb' }}
                  />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={22}>
                    {applicationsByStage.map((entry, index) => (
                      <Cell key={entry.stage} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="rounded-lg border bg-white shadow-sm p-6 dark:bg-gray-900 dark:border-gray-800">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-50">
            Applications by Source
          </h2>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
            Where active applicants came from
          </p>
          <div className="mt-4 h-80">
            {applicationsBySource.length === 0 ? (
              <ChartEmptyState />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={applicationsBySource}
                    dataKey="count"
                    nameKey="source"
                    cx="50%"
                    cy="45%"
                    outerRadius={80}
                    paddingAngle={2}
                  >
                    {applicationsBySource.map((entry, index) => (
                      <Cell key={entry.source} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12, border: '1px solid #e5e7eb' }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-lg border bg-white shadow-sm p-6 dark:bg-gray-900 dark:border-gray-800">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-50">
            Requisitions by Status
          </h2>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
            Distribution across the requisition lifecycle
          </p>
          <div className="mt-4 h-80">
            {requisitionsByStatus.length === 0 ? (
              <ChartEmptyState />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={requisitionsByStatus}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="45%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={2}
                  >
                    {requisitionsByStatus.map((entry, index) => (
                      <Cell key={entry.status} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12, border: '1px solid #e5e7eb' }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Recent activity */}
        <div className="rounded-lg border bg-white shadow-sm p-6 dark:bg-gray-900 dark:border-gray-800 lg:col-span-2">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-50">Recent Activity</h2>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
            Latest actions across the recruitment workspace
          </p>
          <div className="mt-4 max-h-80 overflow-y-auto">
            {recentActivity.length === 0 ? (
              <ChartEmptyState icon={<History className="h-8 w-8" strokeWidth={1.5} />} />
            ) : (
              <ol className="relative space-y-5 border-l border-gray-200 pl-4 dark:border-gray-800">
                {recentActivity.map((item) => (
                  <li key={item.id} className="relative">
                    <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-blue-500 dark:border-gray-900" />
                    <p className="text-sm text-gray-800 dark:text-gray-200">
                      <span className="font-medium">
                        {item.user ? `${item.user.first_name} ${item.user.last_name}` : 'System'}
                      </span>{' '}
                      {formatActivityAction(item.action)}{' '}
                      <span className="text-gray-500 dark:text-gray-400">
                        {formatEntityType(item.entity_type)}
                      </span>
                    </p>
                    <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">
                      {formatRelativeTime(item.created_at)}
                    </p>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function formatActivityAction(action: string): string {
  return action.replace(/_/g, ' ').toLowerCase()
}

function formatEntityType(entityType: string): string {
  return entityType.replace(/_/g, ' ')
}

function formatRelativeTime(isoDate: string): string {
  const date = new Date(isoDate)
  const diffMs = Date.now() - date.getTime()
  const diffMin = Math.round(diffMs / 60000)

  if (diffMin < 1) return 'just now'
  if (diffMin < 60) return `${diffMin}m ago`
  const diffHr = Math.round(diffMin / 60)
  if (diffHr < 24) return `${diffHr}h ago`
  const diffDay = Math.round(diffHr / 24)
  if (diffDay < 7) return `${diffDay}d ago`
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}
