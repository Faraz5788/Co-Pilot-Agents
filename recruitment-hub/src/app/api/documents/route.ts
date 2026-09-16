import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { uploadDocument, validateFile } from '@/lib/services/documents'

const ALLOWED_DOCUMENT_TYPES = ['cv', 'cover_letter', 'certificate', 'reference', 'other']

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: { code: 'unauthorized', message: 'Authentication required' } }, { status: 401 })
  }

  const formData = await request.formData().catch(() => null)
  if (!formData) {
    return NextResponse.json({ error: { code: 'invalid_form', message: 'Expected multipart/form-data' } }, { status: 400 })
  }

  const candidateId = formData.get('candidate_id')
  const documentTypeRaw = formData.get('document_type')
  const file = formData.get('file')

  if (typeof candidateId !== 'string' || !candidateId) {
    return NextResponse.json({ error: { code: 'validation_error', message: 'candidate_id is required' } }, { status: 400 })
  }

  const documentType = typeof documentTypeRaw === 'string' && documentTypeRaw ? documentTypeRaw : 'cv'
  if (!ALLOWED_DOCUMENT_TYPES.includes(documentType)) {
    return NextResponse.json({ error: { code: 'validation_error', message: 'Invalid document_type' } }, { status: 400 })
  }

  if (!(file instanceof File)) {
    return NextResponse.json({ error: { code: 'validation_error', message: 'A file is required' } }, { status: 400 })
  }

  const validation = validateFile({ type: file.type, size: file.size, name: file.name })
  if (!validation.valid) {
    return NextResponse.json({ error: { code: 'invalid_file', message: validation.error } }, { status: 400 })
  }

  try {
    const { data: candidate } = await supabase.from('candidates').select('id').eq('id', candidateId).maybeSingle()
    if (!candidate) {
      return NextResponse.json({ error: { code: 'not_found', message: 'Candidate not found' } }, { status: 400 })
    }

    const document = await uploadDocument(supabase, candidateId, file, documentType, user.id)
    return NextResponse.json({ data: document }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: { code: 'internal_error', message: error instanceof Error ? error.message : 'Failed to upload document' } },
      { status: 500 }
    )
  }
}
