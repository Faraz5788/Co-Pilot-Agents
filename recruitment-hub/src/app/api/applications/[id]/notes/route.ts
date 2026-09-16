import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createAuditLog } from '@/lib/services/audit'

const noteSchema = z.object({
  note: z.string().trim().min(1, 'Note text is required').max(5_000),
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

  const { data, error } = await supabase
    .from('recruiter_notes')
    .select('id, note, created_at, author:users(id, first_name, last_name)')
    .eq('application_id', id)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: { code: 'internal_error', message: error.message } }, { status: 500 })
  }

  return NextResponse.json({ data: data ?? [] })
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

  const parsed = noteSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: 'validation_error', message: parsed.error.issues[0]?.message ?? 'Invalid input' } },
      { status: 400 }
    )
  }

  const { data: application } = await supabase.from('applications').select('id').eq('id', id).maybeSingle()
  if (!application) {
    return NextResponse.json({ error: { code: 'not_found', message: 'Application not found' } }, { status: 404 })
  }

  const { data, error } = await supabase
    .from('recruiter_notes')
    .insert({
      application_id: id,
      created_by: user.id,
      note: parsed.data.note,
    })
    .select('id, note, created_at, author:users(id, first_name, last_name)')
    .single()

  if (error) {
    return NextResponse.json({ error: { code: 'internal_error', message: error.message } }, { status: 500 })
  }

  await createAuditLog(supabase, {
    userId: user.id,
    action: 'application.note_added',
    entityType: 'application',
    entityId: id,
    newValues: { note: parsed.data.note },
  })

  return NextResponse.json({ data }, { status: 201 })
}
