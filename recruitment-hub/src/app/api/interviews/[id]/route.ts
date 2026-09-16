import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { getInterview, updateInterview } from '@/lib/services/interviews'
import { interviewTypeEnum, locationTypeEnum } from '@/lib/validations/schemas'

const interviewStatusEnum = z.enum(['scheduled', 'confirmed', 'completed', 'cancelled', 'no_show'])

const updateInterviewBodySchema = z
  .object({
    interview_type: interviewTypeEnum,
    scheduled_start: z.iso.datetime({ offset: true }),
    scheduled_end: z.iso.datetime({ offset: true }),
    location_type: locationTypeEnum,
    location: z.string().trim().max(255).nullable(),
    meeting_url: z.url().nullable().or(z.literal('')),
    notes: z.string().max(2_000).nullable(),
    status: interviewStatusEnum,
    cancelled_reason: z.string().max(1_000).nullable(),
  })
  .partial()

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  try {
    const interview = await getInterview(supabase, id)
    return NextResponse.json(interview)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Interview not found' },
      { status: 404 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = updateInterviewBodySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  try {
    const interview = await updateInterview(supabase, id, parsed.data, user.id)
    return NextResponse.json(interview)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update interview' },
      { status: 500 }
    )
  }
}
