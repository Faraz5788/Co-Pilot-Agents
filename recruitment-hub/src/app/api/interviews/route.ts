import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { getInterviews, createInterview } from '@/lib/services/interviews'
import { interviewTypeEnum, locationTypeEnum } from '@/lib/validations/schemas'

const createInterviewBodySchema = z
  .object({
    application_id: z.uuid(),
    interview_type: interviewTypeEnum,
    scheduled_start: z.iso.datetime({ message: 'Must be a valid ISO date-time', offset: true }),
    scheduled_end: z.iso.datetime({ message: 'Must be a valid ISO date-time', offset: true }),
    location_type: locationTypeEnum.default('remote'),
    location: z.string().trim().max(255).optional(),
    meeting_url: z.url({ message: 'Must be a valid URL' }).optional().or(z.literal('')),
    notes: z.string().max(2_000).optional(),
    interviewer_ids: z.array(z.uuid()).min(1, 'At least one interviewer is required').max(10),
  })
  .refine((data) => new Date(data.scheduled_end) > new Date(data.scheduled_start), {
    message: 'End time must be after start time',
    path: ['scheduled_end'],
  })
  .refine((data) => data.location_type === 'remote' || !!data.location, {
    message: 'A location is required for in-person or hybrid interviews',
    path: ['location'],
  })

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const searchParams = request.nextUrl.searchParams

  try {
    const result = await getInterviews(supabase, {
      applicationId: searchParams.get('applicationId') ?? undefined,
      interviewerId: searchParams.get('interviewerId') ?? undefined,
      status: searchParams.get('status') ?? undefined,
      fromDate: searchParams.get('fromDate') ?? undefined,
      toDate: searchParams.get('toDate') ?? undefined,
      page: searchParams.get('page') ? Number(searchParams.get('page')) : undefined,
      pageSize: searchParams.get('pageSize') ? Number(searchParams.get('pageSize')) : undefined,
    })

    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch interviews' },
      { status: 500 }
    )
  }
}

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

  const parsed = createInterviewBodySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  try {
    const d = parsed.data
    const interview = await createInterview(
      supabase,
      {
        application_id: d.application_id,
        interview_type: d.interview_type,
        scheduled_start: d.scheduled_start,
        scheduled_end: d.scheduled_end,
        location_type: d.location_type,
        location: d.location || undefined,
        meeting_url: d.meeting_url || undefined,
        notes: d.notes || undefined,
        interviewer_ids: d.interviewer_ids,
      },
      user.id
    )

    return NextResponse.json(interview, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create interview' },
      { status: 500 }
    )
  }
}
