import { createClient } from '@/lib/supabase/server'
import { getRecruitmentAnalytics } from '@/lib/services/analytics'
import { AnalyticsPage } from '@/components/analytics/analytics-page'

export const metadata = {
  title: 'Analytics',
}

export default async function Analytics() {
  const supabase = await createClient()

  const [analytics, { data: departmentRows }] = await Promise.all([
    getRecruitmentAnalytics(supabase),
    supabase.from('departments').select('name').order('name'),
  ])

  const departments = (departmentRows ?? [])
    .map((d) => d.name as string)
    .filter(Boolean)

  return <AnalyticsPage data={analytics} departments={departments} />
}
