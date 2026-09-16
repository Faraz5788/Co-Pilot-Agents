import { SupabaseClient } from '@supabase/supabase-js'
import { createAuditLog } from './audit'

const CANDIDATE_SELECT = `
  *,
  source:sources(id, name, category),
  documents:candidate_documents(id, document_type, filename, mime_type, uploaded_at),
  applications:applications(
    id,
    application_status,
    application_date,
    current_stage:pipeline_stages(id, name, stage_type),
    requisition:requisitions(id, title, reference_number, status)
  )
`

const CANDIDATE_LIST_SELECT = `
  *,
  source:sources(id, name),
  applications:applications(id, application_status, requisition:requisitions(id, title, reference_number))
`

export async function getCandidates(
  supabase: SupabaseClient,
  params: {
    search?: string
    sourceId?: string
    location?: string
    page?: number
    pageSize?: number
  } = {}
) {
  const page = params.page ?? 1
  const pageSize = params.pageSize ?? 25
  const offset = (page - 1) * pageSize

  let query = supabase
    .from('candidates')
    .select(CANDIDATE_LIST_SELECT, { count: 'exact' })

  if (params.search) {
    query = query.or(
      `first_name.ilike.%${params.search}%,last_name.ilike.%${params.search}%,email.ilike.%${params.search}%,candidate_number.ilike.%${params.search}%`
    )
  }
  if (params.sourceId) query = query.eq('source_id', params.sourceId)
  if (params.location) query = query.ilike('location', `%${params.location}%`)

  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + pageSize - 1)

  if (error) throw error

  return {
    data: data ?? [],
    total: count ?? 0,
    page,
    pageSize,
    totalPages: Math.ceil((count ?? 0) / pageSize),
  }
}

export async function getCandidate(supabase: SupabaseClient, id: string) {
  const { data, error } = await supabase
    .from('candidates')
    .select(CANDIDATE_SELECT)
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function createCandidate(
  supabase: SupabaseClient,
  values: Record<string, unknown>,
  userId: string
) {
  const { data: candidateNumber } = await supabase.rpc('generate_candidate_number')

  const { data, error } = await supabase
    .from('candidates')
    .insert({
      ...values,
      candidate_number: candidateNumber || `CND-${Date.now()}`,
    })
    .select(CANDIDATE_SELECT)
    .single()

  if (error) throw error

  await createAuditLog(supabase, {
    userId,
    action: 'candidate.created',
    entityType: 'candidate',
    entityId: data.id,
    newValues: { first_name: values.first_name, last_name: values.last_name, email: values.email } as Record<string, unknown>,
  })

  return data
}

export async function updateCandidate(
  supabase: SupabaseClient,
  id: string,
  values: Record<string, unknown>,
  userId: string
) {
  const { data: existing } = await supabase
    .from('candidates')
    .select('*')
    .eq('id', id)
    .single()

  const { data, error } = await supabase
    .from('candidates')
    .update(values)
    .eq('id', id)
    .select(CANDIDATE_SELECT)
    .single()

  if (error) throw error

  await createAuditLog(supabase, {
    userId,
    action: 'candidate.updated',
    entityType: 'candidate',
    entityId: id,
    oldValues: existing as Record<string, unknown>,
    newValues: values as Record<string, unknown>,
  })

  return data
}

export async function checkDuplicateCandidate(
  supabase: SupabaseClient,
  email: string,
  phone?: string
) {
  const duplicates: Array<{ id: string; match_type: string; first_name: string; last_name: string; email: string }> = []

  const { data: emailMatch } = await supabase
    .from('candidates')
    .select('id, first_name, last_name, email')
    .eq('email', email.toLowerCase())

  if (emailMatch?.length) {
    duplicates.push(...emailMatch.map(c => ({ ...c, match_type: 'email' })))
  }

  if (phone) {
    const normalized = phone.replace(/\D/g, '')
    if (normalized.length >= 7) {
      const { data: phoneMatch } = await supabase
        .from('candidates')
        .select('id, first_name, last_name, email, phone')
        .not('phone', 'is', null)

      if (phoneMatch) {
        const matches = phoneMatch.filter(c => {
          const candidatePhone = c.phone?.replace(/\D/g, '') ?? ''
          return candidatePhone.includes(normalized) || normalized.includes(candidatePhone)
        })
        for (const m of matches) {
          if (!duplicates.some(d => d.id === m.id)) {
            duplicates.push({ id: m.id, first_name: m.first_name, last_name: m.last_name, email: m.email, match_type: 'phone' })
          }
        }
      }
    }
  }

  return duplicates
}
