import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { getOffers, createOffer } from '@/lib/services/offers'
import { employmentTypeEnum } from '@/lib/validations/schemas'

const createOfferBodySchema = z.object({
  application_id: z.uuid(),
  job_title: z.string().trim().min(2, 'Job title is required').max(150),
  salary: z.number().positive('Salary must be greater than zero'),
  currency: z.string().length(3).toUpperCase().default('GBP'),
  grade_id: z.uuid().optional(),
  location_id: z.uuid().optional(),
  employment_type: employmentTypeEnum.default('full_time'),
  fte: z.number().min(0.1).max(1.5).default(1.0),
  proposed_start_date: z.iso.date().optional(),
  bonus: z.string().trim().max(255).optional(),
  additional_terms: z.string().max(5_000).optional(),
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
    const result = await getOffers(supabase, {
      status: searchParams.get('status') ?? undefined,
      page: searchParams.get('page') ? Number(searchParams.get('page')) : undefined,
      pageSize: searchParams.get('pageSize') ? Number(searchParams.get('pageSize')) : undefined,
    })

    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch offers' },
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

  const parsed = createOfferBodySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  try {
    const offer = await createOffer(supabase, parsed.data, user.id)
    return NextResponse.json(offer, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create offer' },
      { status: 500 }
    )
  }
}
