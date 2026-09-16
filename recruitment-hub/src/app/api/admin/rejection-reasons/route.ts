import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { createClient } from '@/lib/supabase/server'
import { createRejectionReason, getRejectionReasons } from '@/lib/services/admin'
import { createAuditLog } from '@/lib/services/audit'

// ---------------------------------------------------------------------------
// GET /api/admin/rejection-reasons — list rejection reasons
// ---------------------------------------------------------------------------

export async function GET() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const reasons = await getRejectionReasons(supabase)
    return NextResponse.json({ data: reasons })
  } catch (error) {
    console.error('Failed to fetch rejection reasons:', error)
    return NextResponse.json({ error: 'Failed to fetch rejection reasons' }, { status: 500 })
  }
}

// ---------------------------------------------------------------------------
// POST /api/admin/rejection-reasons — create a new rejection reason
// ---------------------------------------------------------------------------

const createReasonSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(150),
  category: z.string().trim().max(50).optional(),
})

export async function POST(request: NextRequest) {
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

  const parsed = createReasonSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: z.treeifyError(parsed.error) },
      { status: 400 }
    )
  }

  try {
    const reason = await createRejectionReason(supabase, parsed.data, user.id)
    return NextResponse.json(reason, { status: 201 })
  } catch (error) {
    console.error('Failed to create rejection reason:', error)
    return NextResponse.json({ error: 'Failed to create rejection reason' }, { status: 500 })
  }
}

// ---------------------------------------------------------------------------
// PATCH /api/admin/rejection-reasons — update a reason (e.g. toggle active)
// ---------------------------------------------------------------------------

const updateReasonSchema = z.object({
  id: z.string().uuid('A valid rejection reason id is required'),
  name: z.string().trim().min(1).max(150).optional(),
  category: z.string().trim().max(50).optional(),
  active: z.boolean().optional(),
})

export async function PATCH(request: NextRequest) {
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

  const parsed = updateReasonSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: z.treeifyError(parsed.error) },
      { status: 400 }
    )
  }

  const { id, ...values } = parsed.data
  if (Object.keys(values).length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
  }

  try {
    const { data, error } = await supabase
      .from('rejection_reasons')
      .update(values)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error

    await createAuditLog(supabase, {
      userId: user.id,
      action: 'rejection_reason.updated',
      entityType: 'rejection_reason',
      entityId: id,
      newValues: values,
    })

    return NextResponse.json(data)
  } catch (error) {
    console.error(`Failed to update rejection reason ${id}:`, error)
    return NextResponse.json({ error: 'Failed to update rejection reason' }, { status: 500 })
  }
}
