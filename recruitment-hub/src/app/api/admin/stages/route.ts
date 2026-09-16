import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { createClient } from '@/lib/supabase/server'
import { createPipelineStage, getPipelineStages, updatePipelineStage } from '@/lib/services/admin'

const stageTypeEnum = z.enum([
  'application',
  'screening',
  'review',
  'interview',
  'offer',
  'hired',
  'rejected',
  'withdrawn',
])

// ---------------------------------------------------------------------------
// GET /api/admin/stages — list pipeline stages, in display order
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
    const stages = await getPipelineStages(supabase)
    return NextResponse.json({ data: stages })
  } catch (error) {
    console.error('Failed to fetch pipeline stages:', error)
    return NextResponse.json({ error: 'Failed to fetch pipeline stages' }, { status: 500 })
  }
}

// ---------------------------------------------------------------------------
// POST /api/admin/stages — create a new pipeline stage
// ---------------------------------------------------------------------------

const createStageSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100),
  stage_type: stageTypeEnum,
  display_order: z.coerce.number().int().min(1),
  is_default: z.boolean().optional(),
  active: z.boolean().optional(),
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

  const parsed = createStageSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: z.treeifyError(parsed.error) },
      { status: 400 }
    )
  }

  try {
    const stage = await createPipelineStage(supabase, parsed.data, user.id)
    return NextResponse.json(stage, { status: 201 })
  } catch (error) {
    console.error('Failed to create pipeline stage:', error)
    return NextResponse.json({ error: 'Failed to create pipeline stage' }, { status: 500 })
  }
}

// ---------------------------------------------------------------------------
// PATCH /api/admin/stages — update a pipeline stage (name, type, order,
// active state, default flag — any subset)
// ---------------------------------------------------------------------------

const updateStageSchema = z
  .object({
    id: z.string().uuid('A valid stage id is required'),
    name: z.string().trim().min(1).max(100).optional(),
    stage_type: stageTypeEnum.optional(),
    display_order: z.coerce.number().int().min(1).optional(),
    is_default: z.boolean().optional(),
    active: z.boolean().optional(),
  })
  .refine(
    (data) =>
      data.name !== undefined ||
      data.stage_type !== undefined ||
      data.display_order !== undefined ||
      data.is_default !== undefined ||
      data.active !== undefined,
    { message: 'No fields to update' }
  )

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

  const parsed = updateStageSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: z.treeifyError(parsed.error) },
      { status: 400 }
    )
  }

  const { id, ...values } = parsed.data

  try {
    const stage = await updatePipelineStage(supabase, id, values, user.id)
    return NextResponse.json(stage)
  } catch (error) {
    console.error(`Failed to update pipeline stage ${id}:`, error)
    return NextResponse.json({ error: 'Failed to update pipeline stage' }, { status: 500 })
  }
}
