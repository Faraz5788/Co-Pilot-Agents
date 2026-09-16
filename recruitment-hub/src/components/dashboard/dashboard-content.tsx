'use client'

import type { DashboardMetrics } from '@/lib/services/analytics'
import { RecruiterDashboard } from '@/components/dashboard/recruiter-dashboard'
import { HiringManagerDashboard, type HiringManagerMetrics } from '@/components/dashboard/hiring-manager-dashboard'
import { InterviewerDashboard, type InterviewerMetrics } from '@/components/dashboard/interviewer-dashboard'

export type DashboardContentProps =
  | { role: 'recruiter'; metrics: DashboardMetrics }
  | { role: 'hiring_manager'; metrics: HiringManagerMetrics }
  | { role: 'interviewer'; metrics: InterviewerMetrics }

/**
 * Picks the right role-specific dashboard to render. Kept as a client
 * component so the role switch (and any future client-side interactivity,
 * such as refreshing a single widget) doesn't have to live in the server
 * page itself.
 */
export function DashboardContent(props: DashboardContentProps) {
  switch (props.role) {
    case 'hiring_manager':
      return <HiringManagerDashboard metrics={props.metrics} />
    case 'interviewer':
      return <InterviewerDashboard metrics={props.metrics} />
    case 'recruiter':
    default:
      return <RecruiterDashboard metrics={props.metrics} />
  }
}
