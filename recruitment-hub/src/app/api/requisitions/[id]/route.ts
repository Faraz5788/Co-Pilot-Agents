import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { getRequisition, updateRequisition } from '@/lib/services/requisitions'
import { requisitionFieldsSchema, refineSalaryRange, SALARY_RANGE_REFINEMENT } from '../route'

// PATCH allows updating any subset of the create fields, plus `status`
// (though status transitions with side effects should go through
// `/api/requisitions/[id]/status`).
const updateRequisitionApiSchema = requisitionFieldsSchema
  .partial()
  .extend({
    status: z
      .enum(['draft', 'pending_approval', 'approved', 'open', 'on_hold', 'closed', 'cancelled'])
      .optional(),
  })
  .refine(refineSalaryRange, SALARY_RANGE_REFINEMENT)

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function GET(_request: NextRequest, { params }: RouteContext) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const requisition = await getRequisition(supabase, id)
    return NextResponse.json(requisition)
  } catch (error) {
    console.error(`Failed to fetch requisition ${id}:`, error)
    return NextResponse.json({ error: 'Requisition not found' }, { status: 404 })
  }
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

  const parsed = updateRequisitionApiSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: z.treeifyError(parsed.error) },
      { status: 400 }
    )
  }

  if (Object.keys(parsed.data).length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
  }

  try {
    // updateRequisition (in src/lib/services/requisitions.ts) already writes
    // an audit_log entry (action: 'requisition.updated') with old/new values.
    const requisition = await updateRequisition(supabase, id, parsed.data, user.id)
    return NextResponse.json(requisition)
  } catch (error) {
    console.error(`Failed to update requisition ${id}:`, error)
    return NextResponse.json({ error: 'Failed to update requisition' }, { status: 500 })
  }
}
