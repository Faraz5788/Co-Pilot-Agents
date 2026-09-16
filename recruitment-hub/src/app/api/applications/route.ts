import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { getApplications, createApplication } from '@/lib/services/applications'

const createApplicationSchema = z.object({
  candidate_id: z.string().uuid('A valid candidate is required'),
  requisition_id: z.string().uuid('A valid requisition is required'),
  assigned_recruiter_id: z.string().uuid().optional().or(z.literal('')),
  source_id: z.string().uuid().optional().or(z.literal('')),
  salary_expectation: z.union([z.number(), z.string(), z.null()]).optional(),
  notice_period: z.string().trim().max(100).optional().or(z.literal('')),
})

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: { code: 'unauthorized', message: 'Authentication required' } }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const page = Number(searchParams.get('page') ?? '1') || 1
  const pageSize = Number(searchParams.get('pageSize') ?? '25') || 25

  try {
    const result = await getApplications(supabase, {
      requisitionId: searchParams.get('requisitionId') ?? undefined,
      candidateId: searchParams.get('candidateId') ?? undefined,
      stageId: searchParams.get('stage') ?? undefined,
      status: searchParams.get('status') ?? undefined,
      recruiterId: searchParams.get('recruiter') ?? undefined,
      search: searchParams.get('search') ?? undefined,
      page,
      pageSize,
    })

    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      { error: { code: 'internal_error', message: error instanceof Error ? error.message : 'Failed to load applications' } },
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
    return NextResponse.json({ error: { code: 'unauthorized', message: 'Authentication required' } }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  if (!body) {
    return NextResponse.json({ error: { code: 'invalid_json', message: 'Invalid request body' } }, { status: 400 })
  }

  const parsed = createApplicationSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: 'validation_error', message: parsed.error.issues[0]?.message ?? 'Invalid input', details: parsed.error.issues } },
      { status: 400 }
    )
  }

  const { candidate_id, requisition_id, assigned_recruiter_id, source_id, salary_expectation, notice_period } =
    parsed.data

  try {
    const [{ data: candidate }, { data: requisition }, { data: existingApplication }] = await Promise.all([
      supabase.from('candidates').select('id').eq('id', candidate_id).maybeSingle(),
      supabase.from('requisitions').select('id').eq('id', requisition_id).maybeSingle(),
      supabase
        .from('applications')
        .select('id')
        .eq('candidate_id', candidate_id)
        .eq('requisition_id', requisition_id)
        .maybeSingle(),
    ])

    if (!candidate) {
      return NextResponse.json({ error: { code: 'not_found', message: 'Candidate not found' } }, { status: 400 })
    }
    if (!requisition) {
      return NextResponse.json({ error: { code: 'not_found', message: 'Requisition not found' } }, { status: 400 })
    }
    if (existingApplication) {
      return NextResponse.json(
        { error: { code: 'duplicate_application', message: 'This candidate already has an application for this requisition' } },
        { status: 409 }
      )
    }

    const values: Parameters<typeof createApplication>[1] = {
      candidate_id,
      requisition_id,
    }
    if (assigned_recruiter_id) values.assigned_recruiter_id = assigned_recruiter_id
    if (source_id) values.source_id = source_id
    if (notice_period) values.notice_period = notice_period
    if (salary_expectation !== undefined && salary_expectation !== '' && salary_expectation !== null) {
      const num = Number(salary_expectation)
      if (Number.isFinite(num)) values.salary_expectation = num
    }

    const application = await createApplication(supabase, values, user.id)
    return NextResponse.json({ data: application }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: { code: 'internal_error', message: error instanceof Error ? error.message : 'Failed to create application' } },
      { status: 500 }
    )
  }
}
