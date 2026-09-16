import { createClient } from '@/lib/supabase/server'
import { getInterviews, getUpcomingInterviews } from '@/lib/services/interviews'
import { getApplications } from '@/lib/services/applications'
import { getUsers, getCompetencies } from '@/lib/services/admin'
import { InterviewListPage } from '@/components/interviews/interview-list-page'

interface InterviewsPageProps {
  searchParams: Promise<{
    status?: string
    from?: string
    to?: string
    page?: string
  }>
}

export default async function InterviewsPage({ searchParams }: InterviewsPageProps) {
  const params = await searchParams
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const page = params.page ? Number(params.page) || 1 : 1

  const [interviewsResult, upcomingInterviews, applicationsResult, users, competencies] =
    await Promise.all([
      getInterviews(supabase, {
        status: params.status,
        fromDate: params.from,
        toDate: params.to,
        page,
        pageSize: 25,
      }),
      user ? getUpcomingInterviews(supabase, user.id, 14) : Promise.resolve([]),
      getApplications(supabase, { status: 'active', pageSize: 100 }),
      getUsers(supabase),
      getCompetencies(supabase),
    ])

  // Supabase's zero-schema type inference treats embedded relations as
  // arrays regardless of actual cardinality; normalize the (to-one)
  // candidate/requisition embeds down to plain objects for the UI.
  const applications = applicationsResult.data.map((app) => {
    const candidate = Array.isArray(app.candidate) ? app.candidate[0] : app.candidate
    const requisition = Array.isArray(app.requisition) ? app.requisition[0] : app.requisition
    return { id: app.id, candidate, requisition }
  })

  return (
    <InterviewListPage
      interviews={interviewsResult.data}
      pagination={{
        page: interviewsResult.page,
        pageSize: interviewsResult.pageSize,
        total: interviewsResult.total,
        totalPages: interviewsResult.totalPages,
      }}
      upcomingInterviews={upcomingInterviews}
      applications={applications}
      users={users}
      competencies={competencies}
      currentUserId={user?.id ?? null}
    />
  )
}
