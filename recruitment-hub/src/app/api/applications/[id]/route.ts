import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { getApplication } from '@/lib/services/applications'
import { createAuditLog } from '@/lib/services/audit'

const updateApplicationSchema = z.object({
  assigned_recruiter_id: z.string().uuid().optional().or(z.literal('')),
  source_id: z.string().uuid().optional().or(z.literal('')),
  salary_expectation: z.union([z.number(), z.string(), z.null()]).optional(),
  notice_period: z.string().trim().max(100).optional().or(z.literal('')),
  screening_summary: z.string().trim().max(10_000).optional().or(z.literal('')),
  withdrawal_reason: z.string().trim().max(1_000).optional().or(z.literal('')),
})

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
    const application = await getApplication(supabase, id)
    return NextResponse.json({ data: application })
  } catch {
    return NextResponse.json({ error: { code: 'not_found', message: 'Application not found' } }, { status: 404 })
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

  const parsed = updateApplicationSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: 'validation_error', message: parsed.error.issues[0]?.message ?? 'Invalid input', details: parsed.error.issues } },
      { status: 400 }
    )
  }

  const values: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(parsed.data)) {
    if (value === undefined) continue
    values[key] = value === '' ? null : value
  }
  if (values.salary_expectation !== undefined && values.salary_expectation !== null) {
    const num = Number(values.salary_expectation)
    values.salary_expectation = Number.isFinite(num) ? num : null
  }

  if (Object.keys(values).length === 0) {
    return NextResponse.json({ error: { code: 'validation_error', message: 'No fields to update' } }, { status: 400 })
  }

  try {
    const { data: existing } = await supabase.from('applications').select('*').eq('id', id).maybeSingle()
    if (!existing) {
      return NextResponse.json({ error: { code: 'not_found', message: 'Application not found' } }, { status: 404 })
    }

    const { data, error } = await supabase
      .from('applications')
      .update(values)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    await createAuditLog(supabase, {
      userId: user.id,
      action: 'application.updated',
      entityType: 'application',
      entityId: id,
      oldValues: existing as Record<string, unknown>,
      newValues: values,
    })

    return NextResponse.json({ data })
  } catch (error) {
    return NextResponse.json(
      { error: { code: 'internal_error', message: error instanceof Error ? error.message : 'Failed to update application' } },
      { status: 500 }
    )
  }
}
