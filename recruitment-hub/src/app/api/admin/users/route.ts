import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { createClient, createServiceRoleClient } from '@/lib/supabase/server'
import { getUsers, assignUserRole } from '@/lib/services/admin'
import { createAuditLog } from '@/lib/services/audit'

// ---------------------------------------------------------------------------
// GET /api/admin/users — list all users with their assigned roles
// ---------------------------------------------------------------------------

export async function GET() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const users = await getUsers(supabase)
    return NextResponse.json({ data: users })
  } catch (error) {
    console.error('Failed to fetch users:', error)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}

// ---------------------------------------------------------------------------
// POST /api/admin/users — invite a new user
//
// Creates the Supabase Auth user via the Admin API (service role key),
// mirrors them into the `users` table, and optionally assigns an initial
// role. Requires SUPABASE_SERVICE_ROLE_KEY to be configured.
// ---------------------------------------------------------------------------

const inviteUserSchema = z.object({
  email: z.email('Must be a valid email address'),
  first_name: z.string().trim().min(1, 'First name is required').max(100),
  last_name: z.string().trim().min(1, 'Last name is required').max(100),
  role_id: z.string().uuid().optional(),
})

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser()

  if (!currentUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = inviteUserSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: z.treeifyError(parsed.error) },
      { status: 400 }
    )
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json(
      {
        error:
          'User invitations require SUPABASE_SERVICE_ROLE_KEY to be configured on the server. ' +
          'See scripts/setup-demo.ts for provisioning demo accounts instead.',
      },
      { status: 501 }
    )
  }

  const { email, first_name, last_name, role_id } = parsed.data

  try {
    const adminClient = createServiceRoleClient()

    const { data: invited, error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(email, {
      data: { first_name, last_name },
    })

    if (inviteError || !invited?.user) {
      throw inviteError ?? new Error('Failed to invite user')
    }

    const { error: profileError } = await adminClient.from('users').insert({
      id: invited.user.id,
      email,
      first_name,
      last_name,
      status: 'pending',
    })

    if (profileError) throw profileError

    if (role_id) {
      await assignUserRole(adminClient, invited.user.id, role_id, currentUser.id)
    }

    await createAuditLog(adminClient, {
      userId: currentUser.id,
      action: 'user.invited',
      entityType: 'user',
      entityId: invited.user.id,
      newValues: { email, first_name, last_name, role_id },
    })

    return NextResponse.json({ id: invited.user.id, email, first_name, last_name }, { status: 201 })
  } catch (error) {
    console.error('Failed to invite user:', error)
    const message = error instanceof Error ? error.message : 'Failed to invite user'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
