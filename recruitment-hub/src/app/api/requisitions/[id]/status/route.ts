import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { getRequisition, updateRequisitionStatus } from '@/lib/services/requisitions'
import type { RequisitionStatus } from '@/types/database'

const statusEnum = z.enum([
  'draft',
  'pending_approval',
  'approved',
  'open',
  'on_hold',
  'closed',
  'cancelled',
])

const statusChangeSchema = z.object({
  status: statusEnum,
})

// Valid forward/backward transitions. A requisition can't, for example,
// jump straight from `draft` to `open` — it has to be submitted and
// approved first.
const VALID_TRANSITIONS: Record<RequisitionStatus, RequisitionStatus[]> = {
  draft: ['pending_approval', 'cancelled'],
  pending_approval: ['approved', 'draft', 'cancelled'],
  approved: ['open', 'cancelled'],
  open: ['on_hold', 'closed', 'cancelled'],
  on_hold: ['open', 'closed', 'cancelled'],
  closed: [],
  cancelled: [],
}

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = statusChangeSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: z.treeifyError(parsed.error) },
      { status: 400 }
    )
  }

  let current
  try {
    current = await getRequisition(supabase, id)
  } catch (error) {
    console.error(`Failed to load requisition ${id}:`, error)
    return NextResponse.json({ error: 'Requisition not found' }, { status: 404 })
  }

  const currentStatus = current.status as RequisitionStatus
  const nextStatus = parsed.data.status

  if (currentStatus === nextStatus) {
    return NextResponse.json({ error: `Requisition is already ${currentStatus}` }, { status: 400 })
  }

  const allowed = VALID_TRANSITIONS[currentStatus] ?? []
  if (!allowed.includes(nextStatus)) {
    return NextResponse.json(
      {
        error: `Cannot change status from "${currentStatus}" to "${nextStatus}". Allowed next statuses: ${
          allowed.length ? allowed.join(', ') : 'none (this is a terminal status)'
        }.`,
      },
      { status: 400 }
    )
  }

  try {
    const requisition = await updateRequisitionStatus(supabase, id, nextStatus, user.id)
    return NextResponse.json(requisition)
  } catch (error) {
    console.error(`Failed to update requisition ${id} status:`, error)
    return NextResponse.json({ error: 'Failed to update requisition status' }, { status: 500 })
  }
}
