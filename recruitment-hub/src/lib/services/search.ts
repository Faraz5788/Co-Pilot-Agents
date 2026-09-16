import { SupabaseClient } from '@supabase/supabase-js'

export interface SearchResult {
  type: 'candidate' | 'requisition'
  id: string
  title: string
  subtitle: string
  status?: string
  metadata?: Record<string, string>
}

export async function globalSearch(
  supabase: SupabaseClient,
  query: string,
  limit: number = 10
): Promise<SearchResult[]> {
  if (!query || query.length < 2) return []

  const searchTerm = `%${query}%`

  const [candidateResult, requisitionResult] = await Promise.all([
    supabase
      .from('candidates')
      .select('id, candidate_number, first_name, last_name, email, current_job_title, current_employer')
      .or(`first_name.ilike.${searchTerm},last_name.ilike.${searchTerm},email.ilike.${searchTerm},candidate_number.ilike.${searchTerm}`)
      .limit(limit),
    supabase
      .from('requisitions')
      .select('id, reference_number, title, status, department:departments(name), location:locations(name)')
      .or(`title.ilike.${searchTerm},reference_number.ilike.${searchTerm}`)
      .limit(limit),
  ])

  const results: SearchResult[] = []

  for (const c of candidateResult.data ?? []) {
    results.push({
      type: 'candidate',
      id: c.id,
      title: `${c.first_name} ${c.last_name}`,
      subtitle: [c.current_job_title, c.current_employer].filter(Boolean).join(' at ') || c.email,
      metadata: { number: c.candidate_number },
    })
  }

  for (const r of requisitionResult.data ?? []) {
    const dept = r.department as unknown as { name: string } | null
    const loc = r.location as unknown as { name: string } | null
    results.push({
      type: 'requisition',
      id: r.id,
      title: r.title,
      subtitle: [dept?.name, loc?.name].filter(Boolean).join(' · ') || r.reference_number,
      status: r.status,
      metadata: { reference: r.reference_number },
    })
  }

  return results
}
