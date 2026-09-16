'use client'

import { CalendarClock, CheckCircle2, MessageSquareWarning, Video } from 'lucide-react'
import { StatCard } from '@/components/dashboard/stat-card'
import { ChartEmptyState } from '@/components/dashboard/empty-state'

export interface InterviewerQueueItem {
  id: string
  candidateName: string
  requisitionTitle: string
  scheduledStart: string
  interviewType: string
}

export interface InterviewerMetrics {
  upcomingInterviews: number
  interviewsThisWeek: number
  completedInterviews: number
  feedbackOutstanding: number
  queue: InterviewerQueueItem[]
}

interface InterviewerDashboardProps {
  metrics: InterviewerMetrics
}

/** Interview-focused dashboard: what's coming up and what feedback is owed. */
export function InterviewerDashboard({ metrics }: InterviewerDashboardProps) {
  const { upcomingInterviews, interviewsThisWeek, completedInterviews, feedbackOutstanding, queue } =
    metrics

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-50">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Your interview schedule and outstanding feedback at a glance.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Upcoming Interviews"
          value={upcomingInterviews}
          icon={<CalendarClock className="h-5 w-5" />}
          color="border-l-blue-500"
        />
        <StatCard
          title="Interviews This Week"
          value={interviewsThisWeek}
          icon={<Video className="h-5 w-5" />}
          color="border-l-cyan-500"
        />
        <StatCard
          title="Completed Interviews"
          value={completedInterviews}
          icon={<CheckCircle2 className="h-5 w-5" />}
          color="border-l-emerald-500"
        />
        <StatCard
          title="Feedback Outstanding"
          value={feedbackOutstanding}
          icon={<MessageSquareWarning className="h-5 w-5" />}
          color="border-l-rose-500"
          subtitle="Scorecards you still owe"
        />
      </div>

      <div className="rounded-lg border bg-white shadow-sm p-6 dark:bg-gray-900 dark:border-gray-800">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-50">Your Interview Queue</h2>
        <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">Next interviews on your calendar</p>
        <div className="mt-4">
          {queue.length === 0 ? (
            <ChartEmptyState message="No upcoming interviews scheduled" icon={<CalendarClock className="h-8 w-8" strokeWidth={1.5} />} />
          ) : (
            <ul className="divide-y divide-gray-100 dark:divide-gray-800">
              {queue.map((item) => (
                <li key={item.id} className="flex items-center justify-between gap-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-50">
                      {item.candidateName}
                    </p>
                    <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                      {item.requisitionTitle} &middot; {item.interviewType.replace(/_/g, ' ')}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                      {new Date(item.scheduledStart).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {new Date(item.scheduledStart).toLocaleTimeString(undefined, {
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
