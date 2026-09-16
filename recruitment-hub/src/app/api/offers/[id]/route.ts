import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { getOffer, updateOffer } from '@/lib/services/offers'
import { employmentTypeEnum } from '@/lib/validations/schemas'

const updateOfferBodySchema = z
  .object({
    job_title: z.string().trim().min(2).max(150),
    salary: z.number().positive(),
    currency: z.string().length(3).toUpperCase(),
    grade_id: z.uuid().nullable(),
    location_id: z.uuid().nullable(),
    employment_type: employmentTypeEnum,
    fte: z.number().min(0.1).max(1.5),
    proposed_start_date: z.iso.date().nullable(),
    bonus: z.string().trim().max(255).nullable(),
    additional_terms: z.string().max(5_000).nullable(),
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
    const offer = await getOffer(supabase, id)
    return NextResponse.json(offer)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Offer not found' },
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

  const parsed = updateOfferBodySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  try {
    const offer = await updateOffer(supabase, id, parsed.data, user.id)
    return NextResponse.json(offer)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update offer' },
      { status: 500 }
    )
  }
}
