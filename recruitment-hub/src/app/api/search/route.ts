import { NextRequest, NextResponse } from 'next/server'

import { createClient } from '@/lib/supabase/server'
import { globalSearch } from '@/lib/services/search'

// ---------------------------------------------------------------------------
// GET /api/search?q=...&limit=... — global search across candidates and
// requisitions
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
  const query = searchParams.get('q')?.trim() ?? ''
  const limit = Number.parseInt(searchParams.get('limit') ?? '', 10) || 10

  if (query.length < 2) {
    return NextResponse.json({ data: [] })
  }

  try {
    const results = await globalSearch(supabase, query, limit)
    return NextResponse.json({ data: results })
  } catch (error) {
    console.error('Search failed:', error)
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}
