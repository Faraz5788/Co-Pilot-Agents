import { createClient } from '@/lib/supabase/server'
import { getRequisitions } from '@/lib/services/requisitions'
import { getDepartments, getLocations } from '@/lib/services/admin'
import { RequisitionListPage } from '@/components/requisitions/requisition-list-page'
import { ITEMS_PER_PAGE } from '@/lib/constants'
import type { RequisitionRecord } from '@/components/requisitions/types'

interface RequisitionsPageProps {
  searchParams: Promise<{
    status?: string
    department?: string
    location?: string
    search?: string
    page?: string
  }>
}

export default async function RequisitionsPage({ searchParams }: RequisitionsPageProps) {
  const params = await searchParams
  const supabase = await createClient()

  const parsedPage = Number.parseInt(params.page ?? '1', 10)
  const page = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1

  const [result, departments, locations] = await Promise.all([
    getRequisitions(supabase, {
      status: params.status || undefined,
      departmentId: params.department || undefined,
      locationId: params.location || undefined,
      search: params.search || undefined,
      page,
      pageSize: ITEMS_PER_PAGE,
    }),
    getDepartments(supabase),
    getLocations(supabase),
  ])

  return (
    <RequisitionListPage
      requisitions={result.data as unknown as RequisitionRecord[]}
      total={result.total}
      page={result.page}
      pageSize={result.pageSize}
      totalPages={result.totalPages}
      departments={departments}
      locations={locations}
      filters={{
        status: params.status ?? '',
        department: params.department ?? '',
        location: params.location ?? '',
        search: params.search ?? '',
      }}
    />
  )
}
