import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { getRequisitions, createRequisition } from '@/lib/services/requisitions'
import { ITEMS_PER_PAGE } from '@/lib/constants'

// ---------------------------------------------------------------------------
// Validation
//
// This mirrors the real `requisitions` table (see
// supabase/migrations/00001_initial_schema.sql), not the aspirational
// `Requisition` type in `@/types/database` used by the mock HRIS layer.
// ---------------------------------------------------------------------------

const optionalUuid = z
  .string()
  .trim()
  .uuid()
  .optional()
  .or(z.literal(''))
  .transform((v) => (v ? v : undefined))

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .or(z.literal(''))
    .transform((v) => (v ? v : undefined))

const optionalDate = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be a valid date (YYYY-MM-DD)')
  .optional()
  .or(z.literal(''))
  .transform((v) => (v ? v : undefined))

const optionalNumber = z
  .union([z.number(), z.string().trim(), z.null(), z.undefined()])
  .transform((v) => {
    if (v === null || v === undefined || v === '') return undefined
    const n = typeof v === 'number' ? v : Number(v)
    return Number.isFinite(n) ? n : undefined
  })
  .pipe(z.number().nonnegative().optional())

// Shared field definitions, exported (unrefined) so `[id]/route.ts` can
// build a `.partial()` version for PATCH — Zod v4 objects can't call
// `.partial()`/`.extend()` after `.refine()` has been applied to them.
export const requisitionFieldsSchema = z.object({
  title: z.string().trim().min(3, 'Title must be at least 3 characters').max(200),
  description: optionalText(10_000),
  employment_type: z.enum(['full_time', 'part_time', 'contract', 'temporary', 'intern']),
  fte: z.coerce.number().min(0.01, 'FTE must be greater than 0').max(1, 'FTE cannot exceed 1.00'),
  vacancy_count: z.coerce.number().int().min(1, 'At least one vacancy is required').max(999),
  is_replacement: z.boolean().default(false),

  department_id: optionalUuid,
  location_id: optionalUuid,
  cost_centre_id: optionalUuid,
  job_profile_id: optionalUuid,
  position_id: optionalUuid,

  hiring_manager_id: z.string().trim().uuid('Hiring manager is required'),
  lead_recruiter_id: optionalUuid,

  grade_id: optionalUuid,
  salary_min: optionalNumber,
  salary_max: optionalNumber,
  currency: z.string().trim().length(3).default('GBP'),

  reason_for_hire: optionalText(5_000),
  target_start_date: optionalDate,
  internal_notes: optionalText(5_000),
})

export function refineSalaryRange(data: { salary_min?: number; salary_max?: number }) {
  return data.salary_min === undefined || data.salary_max === undefined || data.salary_max >= data.salary_min
}

export const SALARY_RANGE_REFINEMENT = {
  message: 'Maximum salary must be greater than or equal to minimum salary',
  path: ['salary_max'],
}

export const createRequisitionApiSchema = requisitionFieldsSchema
  .extend({
    status: z.enum(['draft', 'pending_approval']).default('draft'),
  })
  .refine(refineSalaryRange, SALARY_RANGE_REFINEMENT)

export type CreateRequisitionApiInput = z.infer<typeof createRequisitionApiSchema>

// ---------------------------------------------------------------------------
// GET /api/requisitions — paginated list with filters
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const page = Number.parseInt(searchParams.get('page') ?? '1', 10) || 1
  const pageSize = Number.parseInt(searchParams.get('pageSize') ?? '', 10) || ITEMS_PER_PAGE

  try {
    const result = await getRequisitions(supabase, {
      status: searchParams.get('status') ?? undefined,
      departmentId: searchParams.get('department') ?? undefined,
      locationId: searchParams.get('location') ?? undefined,
      hiringManagerId: searchParams.get('hiringManagerId') ?? undefined,
      recruiterId: searchParams.get('recruiterId') ?? undefined,
      search: searchParams.get('search') ?? undefined,
      page,
      pageSize,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Failed to fetch requisitions:', error)
    return NextResponse.json({ error: 'Failed to fetch requisitions' }, { status: 500 })
  }
}

// ---------------------------------------------------------------------------
// POST /api/requisitions — create a new requisition
// ---------------------------------------------------------------------------

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

  const parsed = createRequisitionApiSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: z.treeifyError(parsed.error) },
      { status: 400 }
    )
  }

  try {
    const requisition = await createRequisition(supabase, parsed.data, user.id)
    return NextResponse.json(requisition, { status: 201 })
  } catch (error) {
    console.error('Failed to create requisition:', error)
    return NextResponse.json({ error: 'Failed to create requisition' }, { status: 500 })
  }
}
