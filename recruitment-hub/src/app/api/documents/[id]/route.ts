import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getDocumentUrl } from '@/lib/services/documents'

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

  const { data: document, error } = await supabase
    .from('candidate_documents')
    .select('id, storage_path, filename')
    .eq('id', id)
    .maybeSingle()

  if (error || !document) {
    return NextResponse.json({ error: { code: 'not_found', message: 'Document not found' } }, { status: 404 })
  }

  try {
    const url = await getDocumentUrl(supabase, document.storage_path, user.id, document.id)
    return NextResponse.json({ url, filename: document.filename })
  } catch (err) {
    return NextResponse.json(
      { error: { code: 'internal_error', message: err instanceof Error ? err.message : 'Failed to generate download link' } },
      { status: 500 }
    )
  }
}
