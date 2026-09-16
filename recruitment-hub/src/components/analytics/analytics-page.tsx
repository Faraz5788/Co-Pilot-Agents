'use client'

import { useState } from 'react'
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
  CalendarRange,
  Clock,
  FileStack,
  Filter,
  HandCoins,
  TrendingUp,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { StatCard } from '@/components/dashboard/stat-card'
import { ChartEmptyState } from '@/components/dashboard/empty-state'
import type { getRecruitmentAnalytics } from '@/lib/services/analytics'

export type RecruitmentAnalytics = Awaited<ReturnType<typeof getRecruitmentAnalytics>>

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

const DATE_RANGE_OPTIONS = ['Last 30 days', 'Last quarter', 'Last 12 months', 'All time']

interface AnalyticsPageProps {
  data: RecruitmentAnalytics
  departments?: string[]
}

export function AnalyticsPage({ data, departments = [] }: AnalyticsPageProps) {
  const [dateRange, setDateRange] = useState(DATE_RANGE_OPTIONS[3])
  const [department, setDepartment] = useState('All Departments')

  const hireRate =
    data.totalApplications > 0
      ? Math.round((data.hiredApplications / data.totalApplications) * 100)
      : 0

  const applicationsByStatus = [
    { status: 'Active', count: data.activeApplications },
    { status: 'Hired', count: data.hiredApplications },
    { status: 'Rejected', count: data.rejectedApplications },
    { status: 'Withdrawn', count: data.withdrawnApplications },
  ].filter((s) => s.count > 0)

  const funnelData = data.pipelineConversion.map((stage, index, all) => {
    const prev = index === 0 ? stage.count : all[index - 1].count
    const conversion = prev > 0 ? Math.round((stage.count / prev) * 100) : 0
    return { ...stage, conversion: index === 0 ? 100 : conversion }
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-50">Analytics</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Recruitment performance and pipeline health across the organization.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-md border bg-white px-2 py-1.5 text-sm text-gray-600 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-300">
            <Filter className="h-3.5 w-3.5 text-gray-400" />
            <span className="hidden sm:inline text-xs text-gray-400">Filters</span>
          </div>
          <label className="flex items-center gap-1.5 rounded-md border bg-white px-3 py-1.5 text-sm text-gray-700 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-200">
            <CalendarRange className="h-3.5 w-3.5 text-gray-400" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="bg-transparent text-sm outline-none"
            >
              {DATE_RANGE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-1.5 rounded-md border bg-white px-3 py-1.5 text-sm text-gray-700 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-200">
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="bg-transparent text-sm outline-none"
            >
              <option>All Departments</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <StatCard
          title="Total Applications"
          value={data.totalApplications}
          icon={<FileStack className="h-5 w-5" />}
          color="border-l-blue-500"
        />
        <StatCard
          title="Open Requisitions"
          value={data.openRequisitions}
          icon={<CalendarRange className="h-5 w-5" />}
          color="border-l-cyan-500"
        />
        <StatCard
          title="Hire Rate"
          value={`${hireRate}%`}
          icon={<TrendingUp className="h-5 w-5" />}
          color="border-l-emerald-500"
          subtitle={`${data.hiredApplications} hired`}
        />
        <StatCard
          title="Avg. Time to Hire"
          value={data.avgTimeToHire !== null ? `${data.avgTimeToHire}d` : 'N/A'}
          icon={<Clock className="h-5 w-5" />}
          color="border-l-amber-500"
        />
        <StatCard
          title="Offer Acceptance"
          value={`${data.offerAcceptanceRate}%`}
          icon={<HandCoins className="h-5 w-5" />}
          color="border-l-violet-500"
          subtitle={`${data.acceptedOffers} of ${data.acceptedOffers + data.declinedOffers} decided`}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Pipeline funnel */}
        <div className="rounded-lg border bg-white shadow-sm p-6 dark:bg-gray-900 dark:border-gray-800 lg:col-span-2">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-50">Pipeline Funnel</h2>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
            Candidate volume and stage-to-stage conversion
          </p>
          <div className="mt-4 h-80">
            {funnelData.every((s) => s.count === 0) ? (
              <ChartEmptyState />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={funnelData} margin={{ top: 8, right: 8, bottom: 8, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-gray-100 dark:text-gray-800" vertical={false} />
                  <XAxis
                    dataKey="stage"
                    tick={{ fontSize: 11, fill: '#6b7280' }}
                    interval={0}
                    angle={-20}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                  <Tooltip
                    cursor={{ fill: 'rgba(59,130,246,0.06)' }}
                    contentStyle={{ borderRadius: 8, fontSize: 12, border: '1px solid #e5e7eb' }}
                    formatter={(value, name, item) => {
                      if (name === 'count') {
                        const conv = (item.payload as { conversion: number }).conversion
                        return [`${value} candidates (${conv}% conversion)`, 'Count']
                      }
                      return [value, name]
                    }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={48}>
                    {funnelData.map((entry, index) => (
                      <Cell key={entry.stage} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Applications by status */}
        <div className="rounded-lg border bg-white shadow-sm p-6 dark:bg-gray-900 dark:border-gray-800">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-50">
            Applications by Status
          </h2>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">All applications on record</p>
          <div className="mt-4 h-80">
            {applicationsByStatus.length === 0 ? (
              <ChartEmptyState />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={applicationsByStatus}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="45%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                  >
                    {applicationsByStatus.map((entry, index) => (
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
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Recruiter workload */}
        <div className="rounded-lg border bg-white shadow-sm p-6 dark:bg-gray-900 dark:border-gray-800 lg:col-span-2">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-50">Recruiter Workload</h2>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
            Active applications assigned per recruiter
          </p>
          <div className="mt-4 h-80">
            {data.recruiterWorkload.length === 0 ? (
              <ChartEmptyState />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.recruiterWorkload}
                  layout="vertical"
                  margin={{ top: 4, right: 24, bottom: 4, left: 8 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-gray-100 dark:text-gray-800" horizontal={false} />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                  <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 12, fill: '#6b7280' }} />
                  <Tooltip
                    cursor={{ fill: 'rgba(59,130,246,0.06)' }}
                    contentStyle={{ borderRadius: 8, fontSize: 12, border: '1px solid #e5e7eb' }}
                  />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={22}>
                    {data.recruiterWorkload.map((entry, index) => (
                      <Cell key={entry.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Offer acceptance breakdown */}
        <div className="rounded-lg border bg-white shadow-sm p-6 dark:bg-gray-900 dark:border-gray-800">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-50">Offer Acceptance Rate</h2>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">Accepted vs. declined offers</p>

          {data.totalOffers === 0 ? (
            <ChartEmptyState icon={<HandCoins className="h-8 w-8" strokeWidth={1.5} />} />
          ) : (
            <div className="mt-6 space-y-5">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-semibold text-gray-900 dark:text-gray-50">
                  {data.offerAcceptanceRate}%
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">acceptance rate</span>
              </div>

              <div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                  <div
                    className="h-full rounded-full bg-emerald-500"
                    style={{ width: `${data.offerAcceptanceRate}%` }}
                  />
                </div>
              </div>

              <dl className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <dt className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" /> Accepted
                  </dt>
                  <dd className="font-medium text-gray-900 dark:text-gray-50">{data.acceptedOffers}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <span className="h-2 w-2 rounded-full bg-rose-400" /> Declined
                  </dt>
                  <dd className="font-medium text-gray-900 dark:text-gray-50">{data.declinedOffers}</dd>
                </div>
                <div className="flex items-center justify-between border-t border-gray-100 pt-3 dark:border-gray-800">
                  <dt className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <span className="h-2 w-2 rounded-full bg-gray-300 dark:bg-gray-700" /> Total Offers
                    Extended
                  </dt>
                  <dd className="font-medium text-gray-900 dark:text-gray-50">{data.totalOffers}</dd>
                </div>
              </dl>
            </div>
          )}
        </div>
      </div>

      {/* Interview completion */}
      <div className="rounded-lg border bg-white shadow-sm p-6 dark:bg-gray-900 dark:border-gray-800">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-50">Interview Activity</h2>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <MiniStat label="Total Interviews" value={data.totalInterviews} />
          <MiniStat label="Completed" value={data.completedInterviews} />
          <MiniStat label="Total Offers" value={data.totalOffers} />
          <MiniStat
            label="Closed Requisitions"
            value={data.closedRequisitions}
          />
        </div>
      </div>
    </div>
  )
}

function MiniStat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className={cn('rounded-md bg-gray-50 p-4 dark:bg-gray-800/60')}>
      <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{label}</p>
      <p className="mt-1 text-xl font-semibold text-gray-900 dark:text-gray-50">{value}</p>
    </div>
  )
}
