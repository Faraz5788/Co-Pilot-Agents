import { createClient } from '@/lib/supabase/server'
import { getOffers } from '@/lib/services/offers'
import { getApplications } from '@/lib/services/applications'
import { getGrades, getLocations, getUsers } from '@/lib/services/admin'
import { OfferListPage } from '@/components/offers/offer-list-page'

interface OffersPageProps {
  searchParams: Promise<{
    status?: string
    page?: string
  }>
}

const APPROVER_ROLE_NAMES = ['hiring_manager', 'hr_reward']

export default async function OffersPage({ searchParams }: OffersPageProps) {
  const params = await searchParams
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const page = params.page ? Number(params.page) || 1 : 1

  const [offersResult, applicationsResult, grades, locations, users] = await Promise.all([
    getOffers(supabase, { status: params.status, page, pageSize: 25 }),
    getApplications(supabase, { status: 'active', pageSize: 100 }),
    getGrades(supabase),
    getLocations(supabase),
    getUsers(supabase),
  ])

  const approvers = (
    users as Array<{
      id: string
      first_name: string
      last_name: string
      user_roles?: { role?: { name?: string } | null }[]
    }>
  )
    .filter((u) =>
      (u.user_roles ?? []).some((ur) =>
        APPROVER_ROLE_NAMES.includes((ur.role?.name ?? '').toLowerCase())
      )
    )
    .map((u) => ({ id: u.id, first_name: u.first_name, last_name: u.last_name }))

  // Supabase's zero-schema type inference treats embedded relations as
  // arrays regardless of actual cardinality; normalize the (to-one)
  // candidate/requisition embeds down to plain objects for the UI.
  const applications = applicationsResult.data.map((app) => {
    const candidate = Array.isArray(app.candidate) ? app.candidate[0] : app.candidate
    const requisition = Array.isArray(app.requisition) ? app.requisition[0] : app.requisition
    return { id: app.id, candidate, requisition }
  })

  return (
    <OfferListPage
      offers={offersResult.data}
      pagination={{
        page: offersResult.page,
        pageSize: offersResult.pageSize,
        total: offersResult.total,
        totalPages: offersResult.totalPages,
      }}
      applications={applications}
      grades={grades}
      locations={locations}
      approvers={approvers}
      currentUserId={user?.id ?? null}
    />
  )
}
