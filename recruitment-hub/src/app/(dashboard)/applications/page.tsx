import { createClient } from '@/lib/supabase/server'
import { getApplications } from '@/lib/services/applications'
import { getPipelineStages, getUsers } from '@/lib/services/admin'
import { ApplicationListPage, type ApplicationsResult } from '@/components/applications/application-list-page'

interface ApplicationsPageProps {
  searchParams: Promise<{
    search?: string
    stage?: string
    status?: string
    recruiter?: string
    page?: string
  }>
}

export default async function ApplicationsPage({ searchParams }: ApplicationsPageProps) {
  const params = await searchParams
  const supabase = await createClient()

  const page = params.page ? Math.max(1, parseInt(params.page, 10) || 1) : 1

  const [applicationsResult, stages, users] = await Promise.all([
    getApplications(supabase, {
      search: params.search,
      stageId: params.stage,
      status: params.status,
      recruiterId: params.recruiter,
      page,
      pageSize: 25,
    }),
    getPipelineStages(supabase),
    getUsers(supabase),
  ])

  const recruiters = users.filter((user: { user_roles?: Array<{ role?: { name?: string } }> }) =>
    (user.user_roles ?? []).some((assignment) => assignment.role?.name === 'recruiter')
  )

  return (
    <ApplicationListPage
      initialData={applicationsResult as unknown as ApplicationsResult}
      stages={stages}
      recruiters={recruiters.length > 0 ? recruiters : users}
      initialFilters={{
        search: params.search ?? '',
        stage: params.stage ?? '',
        status: params.status ?? '',
        recruiter: params.recruiter ?? '',
      }}
    />
  )
}
