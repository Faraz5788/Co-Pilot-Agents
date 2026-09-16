import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { createClient } from '@/lib/supabase/server'
import { assignUserRole, removeUserRole } from '@/lib/services/admin'

interface RouteContext {
  params: Promise<{ id: string }>
}

const roleBodySchema = z.object({
  role_id: z.string().uuid('A valid role_id is required'),
})

// ---------------------------------------------------------------------------
// POST /api/admin/users/[id]/roles — assign a role to a user
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest, { params }: RouteContext) {
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

  const parsed = roleBodySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: z.treeifyError(parsed.error) },
      { status: 400 }
    )
  }

  try {
    const assignment = await assignUserRole(supabase, id, parsed.data.role_id, user.id)
    return NextResponse.json(assignment, { status: 201 })
  } catch (error) {
    console.error(`Failed to assign role to user ${id}:`, error)
    return NextResponse.json({ error: 'Failed to assign role' }, { status: 500 })
  }
}

// ---------------------------------------------------------------------------
// DELETE /api/admin/users/[id]/roles — remove a role from a user
// ---------------------------------------------------------------------------

export async function DELETE(request: NextRequest, { params }: RouteContext) {
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

  const parsed = roleBodySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: z.treeifyError(parsed.error) },
      { status: 400 }
    )
  }

  try {
    await removeUserRole(supabase, id, parsed.data.role_id, user.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(`Failed to remove role from user ${id}:`, error)
    return NextResponse.json({ error: 'Failed to remove role' }, { status: 500 })
  }
}
