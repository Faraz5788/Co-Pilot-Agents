'use client'

import { Briefcase, CalendarClock, ClipboardList, MessageSquareWarning } from 'lucide-react'
import { StatCard } from '@/components/dashboard/stat-card'

export interface HiringManagerMetrics {
  myVacancies: number
  candidatesAwaitingReview: number
  upcomingInterviews: number
  feedbackOutstanding: number
}

interface HiringManagerDashboardProps {
  metrics: HiringManagerMetrics
}

/**
 * Simplified, action-oriented dashboard for hiring managers: just the four
 * numbers that tell them whether anything needs their attention today.
 */
export function HiringManagerDashboard({ metrics }: HiringManagerDashboardProps) {
  const { myVacancies, candidatesAwaitingReview, upcomingInterviews, feedbackOutstanding } = metrics

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-50">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          A quick look at your open roles and what needs your attention.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="My Vacancies"
          value={myVacancies}
          icon={<Briefcase className="h-5 w-5" />}
          color="border-l-blue-500"
          subtitle="Open requisitions you own"
        />
        <StatCard
          title="Candidates Awaiting Review"
          value={candidatesAwaitingReview}
          icon={<ClipboardList className="h-5 w-5" />}
          color="border-l-amber-500"
          subtitle="Waiting on your decision"
        />
        <StatCard
          title="Upcoming Interviews"
          value={upcomingInterviews}
          icon={<CalendarClock className="h-5 w-5" />}
          color="border-l-emerald-500"
          subtitle="Scheduled for your vacancies"
        />
        <StatCard
          title="Feedback Outstanding"
          value={feedbackOutstanding}
          icon={<MessageSquareWarning className="h-5 w-5" />}
          color="border-l-rose-500"
          subtitle="Completed interviews needing a scorecard"
        />
      </div>

      {candidatesAwaitingReview === 0 &&
      upcomingInterviews === 0 &&
      feedbackOutstanding === 0 ? (
        <div className="rounded-lg border bg-white shadow-sm p-6 text-center dark:bg-gray-900 dark:border-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            You&apos;re all caught up — nothing needs your attention right now.
          </p>
        </div>
      ) : (
        <div className="rounded-lg border bg-white shadow-sm p-6 dark:bg-gray-900 dark:border-gray-800">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-50">Suggested next steps</h2>
          <ul className="mt-3 space-y-2 text-sm text-gray-600 dark:text-gray-300">
            {candidatesAwaitingReview > 0 && (
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                Review {candidatesAwaitingReview} candidate{candidatesAwaitingReview === 1 ? '' : 's'} waiting in your pipeline.
              </li>
            )}
            {upcomingInterviews > 0 && (
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Prepare for {upcomingInterviews} upcoming interview{upcomingInterviews === 1 ? '' : 's'}.
              </li>
            )}
            {feedbackOutstanding > 0 && (
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                Submit feedback for {feedbackOutstanding} completed interview{feedbackOutstanding === 1 ? '' : 's'}.
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  )
}
