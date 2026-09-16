import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { rejectApplication } from '@/lib/services/applications'

const rejectSchema = z.object({
  rejection_reason_id: z.string().uuid('A valid rejection reason is required'),
  notes: z.string().trim().max(2_000).optional().or(z.literal('')),
})

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function POST(request: NextRequest, { params }: RouteParams) {
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

  const parsed = rejectSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: 'validation_error', message: parsed.error.issues[0]?.message ?? 'Invalid input', details: parsed.error.issues } },
      { status: 400 }
    )
  }

  try {
    const [{ data: application }, { data: reason }] = await Promise.all([
      supabase.from('applications').select('id').eq('id', id).maybeSingle(),
      supabase.from('rejection_reasons').select('id').eq('id', parsed.data.rejection_reason_id).maybeSingle(),
    ])

    if (!application) {
      return NextResponse.json({ error: { code: 'not_found', message: 'Application not found' } }, { status: 404 })
    }
    if (!reason) {
      return NextResponse.json({ error: { code: 'not_found', message: 'Rejection reason not found' } }, { status: 400 })
    }

    const updated = await rejectApplication(
      supabase,
      id,
      parsed.data.rejection_reason_id,
      user.id,
      parsed.data.notes || undefined
    )

    return NextResponse.json({ data: updated })
  } catch (error) {
    return NextResponse.json(
      { error: { code: 'internal_error', message: error instanceof Error ? error.message : 'Failed to reject application' } },
      { status: 500 }
    )
  }
}
