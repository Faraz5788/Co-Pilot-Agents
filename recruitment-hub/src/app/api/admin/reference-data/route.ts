import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { createClient } from '@/lib/supabase/server'
import {
  getCompetencies,
  getCostCentres,
  getDepartments,
  getGrades,
  getJobProfiles,
  getLocations,
  getPositions,
} from '@/lib/services/admin'
import { createAuditLog } from '@/lib/services/audit'

// ---------------------------------------------------------------------------
// Generic reference-data CRUD, shared across the seven tables managed on the
// Reference Data admin page. There are no per-table `create*`/`update*`
// helpers in `admin.ts` for these (only getters), so this route writes
// directly via Supabase — the same pattern `admin.ts` itself uses — and
// records its own audit log entry for every mutation.
// ---------------------------------------------------------------------------

const ENTITY_TABLES = {
  departments: 'departments',
  locations: 'locations',
  cost_centres: 'cost_centres',
  job_profiles: 'job_profiles',
  positions: 'positions',
  grades: 'grades',
  competencies: 'competencies',
} as const

type EntityKey = keyof typeof ENTITY_TABLES

const entityEnum = z.enum([
  'departments',
  'locations',
  'cost_centres',
  'job_profiles',
  'positions',
  'grades',
  'competencies',
])

function singularEntityName(entity: EntityKey): string {
  return entity.replace(/s$/, '')
}

async function fetchEntity(supabase: Awaited<ReturnType<typeof createClient>>, entity: EntityKey) {
  switch (entity) {
    case 'departments':
      return getDepartments(supabase)
    case 'locations':
      return getLocations(supabase)
    case 'cost_centres':
      return getCostCentres(supabase)
    case 'job_profiles':
      return getJobProfiles(supabase)
    case 'positions':
      return getPositions(supabase)
    case 'grades':
      return getGrades(supabase)
    case 'competencies':
      return getCompetencies(supabase)
  }
}

// ---------------------------------------------------------------------------
// GET /api/admin/reference-data?entity=departments
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
  const parsedEntity = entityEnum.safeParse(searchParams.get('entity'))
  if (!parsedEntity.success) {
    return NextResponse.json({ error: 'A valid `entity` query param is required' }, { status: 400 })
  }

  try {
    const data = await fetchEntity(supabase, parsedEntity.data)
    return NextResponse.json({ data })
  } catch (error) {
    console.error(`Failed to fetch ${parsedEntity.data}:`, error)
    return NextResponse.json({ error: 'Failed to fetch reference data' }, { status: 500 })
  }
}

// ---------------------------------------------------------------------------
// POST /api/admin/reference-data — create a record in one of the reference
// data tables. Body: { entity: 'departments' | ..., values: {...} }
// ---------------------------------------------------------------------------

const mutationSchema = z.object({
  entity: entityEnum,
  values: z.record(z.string(), z.unknown()),
})

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

  const parsed = mutationSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: z.treeifyError(parsed.error) },
      { status: 400 }
    )
  }

  const { entity, values } = parsed.data
  const table = ENTITY_TABLES[entity]

  if (!values.name && !values.title) {
    return NextResponse.json({ error: 'A name is required' }, { status: 400 })
  }

  try {
    const { data, error } = await supabase.from(table).insert(values).select().single()
    if (error) throw error

    await createAuditLog(supabase, {
      userId: user.id,
      action: `${singularEntityName(entity)}.created`,
      entityType: singularEntityName(entity),
      entityId: data.id as string,
      newValues: values,
    })

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error(`Failed to create ${entity} record:`, error)
    return NextResponse.json({ error: 'Failed to create record' }, { status: 500 })
  }
}

// ---------------------------------------------------------------------------
// PATCH /api/admin/reference-data — update a record (e.g. toggle active).
// Body: { entity, id, values: {...} }
// ---------------------------------------------------------------------------

const patchSchema = z.object({
  entity: entityEnum,
  id: z.string().uuid('A valid id is required'),
  values: z.record(z.string(), z.unknown()),
})

export async function PATCH(request: NextRequest) {
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

  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: z.treeifyError(parsed.error) },
      { status: 400 }
    )
  }

  const { entity, id, values } = parsed.data
  const table = ENTITY_TABLES[entity]

  if (Object.keys(values).length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
  }

  try {
    const { data, error } = await supabase.from(table).update(values).eq('id', id).select().single()
    if (error) throw error

    await createAuditLog(supabase, {
      userId: user.id,
      action: `${singularEntityName(entity)}.updated`,
      entityType: singularEntityName(entity),
      entityId: id,
      newValues: values,
    })

    return NextResponse.json(data)
  } catch (error) {
    console.error(`Failed to update ${entity} record ${id}:`, error)
    return NextResponse.json({ error: 'Failed to update record' }, { status: 500 })
  }
}
