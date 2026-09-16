import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { moveApplicationStage } from '@/lib/services/applications'

const stageSchema = z.object({
  to_stage_id: z.string().uuid('A valid target stage is required'),
  notes: z.string().trim().max(2_000).optional().or(z.literal('')),
})

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: { code: 'unauthorized', message: 'Authentication required' } }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  if (!body) {
    return NextResponse.json({ error: { code: 'invalid_json', message: 'Invalid request body' } }, { status: 400 })
  }

  const parsed = stageSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: 'validation_error', message: parsed.error.issues[0]?.message ?? 'Invalid input', details: parsed.error.issues } },
      { status: 400 }
    )
  }

  try {
    const application = await moveApplicationStage(
      supabase,
      id,
      parsed.data.to_stage_id,
      user.id,
      parsed.data.notes || undefined
    )
    return NextResponse.json({ data: application })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to move application stage'
    const isNotFound = message === 'Application not found' || message === 'Target stage not found'
    return NextResponse.json(
      { error: { code: isNotFound ? 'not_found' : 'internal_error', message } },
      { status: isNotFound ? (message === 'Application not found' ? 404 : 400) : 500 }
    )
  }
}
