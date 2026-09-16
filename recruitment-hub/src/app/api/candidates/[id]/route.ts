import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { getCandidate, updateCandidate } from '@/lib/services/candidates'

const candidateUpdateSchema = z.object({
  first_name: z.string().trim().min(1).max(100).optional(),
  middle_name: z.string().trim().max(100).optional().or(z.literal('')),
  last_name: z.string().trim().min(1).max(100).optional(),
  preferred_name: z.string().trim().max(100).optional().or(z.literal('')),
  email: z.string().trim().email().optional(),
  phone: z.string().trim().max(30).optional().or(z.literal('')),
  location: z.string().trim().max(150).optional().or(z.literal('')),
  linkedin_url: z.string().trim().url().optional().or(z.literal('')),
  source_id: z.string().uuid().optional().or(z.literal('')),
  current_employer: z.string().trim().max(150).optional().or(z.literal('')),
  current_job_title: z.string().trim().max(150).optional().or(z.literal('')),
  notice_period: z.string().trim().max(100).optional().or(z.literal('')),
  salary_expectation: z.union([z.number(), z.string(), z.null()]).optional(),
  currency: z.string().trim().max(10).optional().or(z.literal('')),
  right_to_work_status: z.string().trim().max(100).optional().or(z.literal('')),
  force: z.boolean().optional(),
})

function cleanValues(input: z.infer<typeof candidateUpdateSchema>) {
  const { force: _force, salary_expectation, email, ...rest } = input
  void _force

  const cleaned: Record<string, unknown> = {}
  if (email !== undefined) cleaned.email = email.trim().toLowerCase()

  for (const [key, value] of Object.entries(rest)) {
    if (value === undefined) continue
    cleaned[key] = value === '' ? null : value
  }

  if (salary_expectation !== undefined) {
    if (salary_expectation === '' || salary_expectation === null) {
      cleaned.salary_expectation = null
    } else {
      const num = Number(salary_expectation)
      cleaned.salary_expectation = Number.isFinite(num) ? num : null
    }
  }

  return cleaned
}

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: { code: 'unauthorized', message: 'Authentication required' } }, { status: 401 })
  }

  try {
    const candidate = await getCandidate(supabase, id)
    return NextResponse.json({ data: candidate })
  } catch {
    return NextResponse.json({ error: { code: 'not_found', message: 'Candidate not found' } }, { status: 404 })
  }
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

  const parsed = candidateUpdateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: 'validation_error', message: parsed.error.issues[0]?.message ?? 'Invalid input', details: parsed.error.issues } },
      { status: 400 }
    )
  }

  const values = cleanValues(parsed.data)
  if (Object.keys(values).length === 0) {
    return NextResponse.json({ error: { code: 'validation_error', message: 'No fields to update' } }, { status: 400 })
  }

  try {
    const candidate = await updateCandidate(supabase, id, values, user.id)
    return NextResponse.json({ data: candidate })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update candidate'
    const isUniqueViolation = message.includes('duplicate key')
    return NextResponse.json(
      { error: { code: isUniqueViolation ? 'duplicate_candidate' : 'internal_error', message: isUniqueViolation ? 'A candidate with this email already exists' : message } },
      { status: isUniqueViolation ? 409 : 500 }
    )
  }
}
