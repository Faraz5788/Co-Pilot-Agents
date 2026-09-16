import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { getCandidates, createCandidate, checkDuplicateCandidate } from '@/lib/services/candidates'

const candidateInputSchema = z.object({
  first_name: z.string().trim().min(1, 'First name is required').max(100),
  middle_name: z.string().trim().max(100).optional().or(z.literal('')),
  last_name: z.string().trim().min(1, 'Last name is required').max(100),
  preferred_name: z.string().trim().max(100).optional().or(z.literal('')),
  email: z.string().trim().email('Must be a valid email address'),
  phone: z.string().trim().max(30).optional().or(z.literal('')),
  location: z.string().trim().max(150).optional().or(z.literal('')),
  linkedin_url: z.string().trim().url('Must be a valid URL').optional().or(z.literal('')),
  source_id: z.string().uuid().optional().or(z.literal('')),
  current_employer: z.string().trim().max(150).optional().or(z.literal('')),
  current_job_title: z.string().trim().max(150).optional().or(z.literal('')),
  notice_period: z.string().trim().max(100).optional().or(z.literal('')),
  salary_expectation: z.union([z.number(), z.string(), z.null()]).optional(),
  currency: z.string().trim().max(10).optional().or(z.literal('')),
  right_to_work_status: z.string().trim().max(100).optional().or(z.literal('')),
  force: z.boolean().optional(),
})

function cleanValues(input: z.infer<typeof candidateInputSchema>) {
  const { force: _force, salary_expectation, email, ...rest } = input
  void _force

  const cleaned: Record<string, unknown> = { email: email.trim().toLowerCase() }

  for (const [key, value] of Object.entries(rest)) {
    if (value === '' || value === undefined) {
      cleaned[key] = null
    } else {
      cleaned[key] = value
    }
  }

  if (salary_expectation === '' || salary_expectation === undefined || salary_expectation === null) {
    cleaned.salary_expectation = null
  } else {
    const num = Number(salary_expectation)
    cleaned.salary_expectation = Number.isFinite(num) ? num : null
  }

  return cleaned
}

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
    const result = await getCandidates(supabase, {
      search: searchParams.get('search') ?? undefined,
      sourceId: searchParams.get('source') ?? undefined,
      location: searchParams.get('location') ?? undefined,
      page,
      pageSize,
    })

    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      { error: { code: 'internal_error', message: error instanceof Error ? error.message : 'Failed to load candidates' } },
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

  const parsed = candidateInputSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: 'validation_error', message: parsed.error.issues[0]?.message ?? 'Invalid input', details: parsed.error.issues } },
      { status: 400 }
    )
  }

  const values = cleanValues(parsed.data)

  try {
    if (!parsed.data.force) {
      const duplicates = await checkDuplicateCandidate(
        supabase,
        values.email as string,
        (values.phone as string | null) ?? undefined
      )
      if (duplicates.length > 0) {
        return NextResponse.json({ error: { code: 'duplicate_candidate', message: 'A matching candidate already exists' }, duplicates }, { status: 409 })
      }
    }

    const candidate = await createCandidate(supabase, values, user.id)
    return NextResponse.json({ data: candidate }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create candidate'
    const isUniqueViolation = typeof message === 'string' && message.includes('duplicate key')
    return NextResponse.json(
      { error: { code: isUniqueViolation ? 'duplicate_candidate' : 'internal_error', message: isUniqueViolation ? 'A candidate with this email already exists' : message } },
      { status: isUniqueViolation ? 409 : 500 }
    )
  }
}
