import { NextRequest, NextResponse } from 'next/server'

import { createClient } from '@/lib/supabase/server'
import { getDashboardMetrics, getRecruitmentAnalytics } from '@/lib/services/analytics'

// ---------------------------------------------------------------------------
// GET /api/analytics?type=dashboard|recruitment
//
// `dashboard` returns the at-a-glance metrics shown on the main dashboard.
// `recruitment` (the default) returns the fuller recruitment funnel /
// pipeline analytics used by the Analytics page.
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') ?? 'recruitment'

  try {
    if (type === 'dashboard') {
      const { data: roleRows } = await supabase
        .from('user_roles')
        .select('role:roles(name)')
        .eq('user_id', user.id)

      const roleNames = (roleRows ?? [])
        .map((row) => (row as unknown as { role: { name: string } | null }).role?.name)
        .filter((name): name is string => Boolean(name))

      const metrics = await getDashboardMetrics(supabase, user.id, roleNames)
      return NextResponse.json({ data: metrics })
    }

    const analytics = await getRecruitmentAnalytics(supabase)
    return NextResponse.json({ data: analytics })
  } catch (error) {
    console.error('Failed to fetch analytics:', error)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}
