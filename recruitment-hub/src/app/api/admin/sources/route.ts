import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { createClient } from '@/lib/supabase/server'
import { createSource, getSources } from '@/lib/services/admin'
import { createAuditLog } from '@/lib/services/audit'

// ---------------------------------------------------------------------------
// GET /api/admin/sources — list candidate sources
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
    const sources = await getSources(supabase)
    return NextResponse.json({ data: sources })
  } catch (error) {
    console.error('Failed to fetch sources:', error)
    return NextResponse.json({ error: 'Failed to fetch sources' }, { status: 500 })
  }
}

// ---------------------------------------------------------------------------
// POST /api/admin/sources — create a new source
// ---------------------------------------------------------------------------

const createSourceSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100),
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

  const parsed = createSourceSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: z.treeifyError(parsed.error) },
      { status: 400 }
    )
  }

  try {
    const source = await createSource(supabase, parsed.data, user.id)
    return NextResponse.json(source, { status: 201 })
  } catch (error) {
    console.error('Failed to create source:', error)
    return NextResponse.json({ error: 'Failed to create source' }, { status: 500 })
  }
}

// ---------------------------------------------------------------------------
// PATCH /api/admin/sources — update a source (e.g. toggle active). There is
// no `updateSource` service helper yet, so this writes directly and records
// its own audit log entry, mirroring the pattern used in `admin.ts`.
// ---------------------------------------------------------------------------

const updateSourceSchema = z.object({
  id: z.string().uuid('A valid source id is required'),
  name: z.string().trim().min(1).max(100).optional(),
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

  const parsed = updateSourceSchema.safeParse(body)
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
    const { data, error } = await supabase.from('sources').update(values).eq('id', id).select().single()
    if (error) throw error

    await createAuditLog(supabase, {
      userId: user.id,
      action: 'source.updated',
      entityType: 'source',
      entityId: id,
      newValues: values,
    })

    return NextResponse.json(data)
  } catch (error) {
    console.error(`Failed to update source ${id}:`, error)
    return NextResponse.json({ error: 'Failed to update source' }, { status: 500 })
  }
}
