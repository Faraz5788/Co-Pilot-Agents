import { NextRequest, NextResponse } from 'next/server'

import { createClient } from '@/lib/supabase/server'
import { getAuditLogs } from '@/lib/services/audit'

// ---------------------------------------------------------------------------
// GET /api/admin/audit-logs — paginated, filterable audit log listing
//
// Query params: entityType, entityId, userId, action, from, to, page, pageSize
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
  const page = Number.parseInt(searchParams.get('page') ?? '1', 10) || 1
  const pageSize = Number.parseInt(searchParams.get('pageSize') ?? '', 10) || 25

  try {
    const result = await getAuditLogs(supabase, {
      entityType: searchParams.get('entityType') ?? undefined,
      entityId: searchParams.get('entityId') ?? undefined,
      userId: searchParams.get('userId') ?? undefined,
      action: searchParams.get('action') ?? undefined,
      from: searchParams.get('from') ?? undefined,
      to: searchParams.get('to') ?? undefined,
      page,
      pageSize,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Failed to fetch audit logs:', error)
    return NextResponse.json({ error: 'Failed to fetch audit logs' }, { status: 500 })
  }
}
