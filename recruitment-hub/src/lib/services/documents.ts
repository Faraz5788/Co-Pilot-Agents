import { SupabaseClient } from '@supabase/supabase-js'
import { createAuditLog } from './audit'

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export function validateFile(file: { type: string; size: number; name: string }) {
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return { valid: false, error: 'Only PDF and Word documents are allowed' }
  }
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: 'File size must be under 10MB' }
  }
  return { valid: true, error: null }
}

export async function uploadDocument(
  supabase: SupabaseClient,
  candidateId: string,
  file: File,
  documentType: string,
  userId: string
) {
  const validation = validateFile(file)
  if (!validation.valid) throw new Error(validation.error!)

  const ext = file.name.split('.').pop() || 'pdf'
  const storagePath = `candidates/${candidateId}/${Date.now()}-${crypto.randomUUID()}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('documents')
    .upload(storagePath, file, {
      contentType: file.type,
      upsert: false,
    })

  if (uploadError) throw uploadError

  const { data, error: dbError } = await supabase
    .from('candidate_documents')
    .insert({
      candidate_id: candidateId,
      document_type: documentType,
      storage_path: storagePath,
      filename: file.name,
      mime_type: file.type,
      file_size: file.size,
      uploaded_by: userId,
    })
    .select()
    .single()

  if (dbError) throw dbError

  await createAuditLog(supabase, {
    userId,
    action: 'document.uploaded',
    entityType: 'candidate_document',
    entityId: data.id,
    newValues: { candidate_id: candidateId, filename: file.name, document_type: documentType },
  })

  return data
}

export async function getDocumentUrl(
  supabase: SupabaseClient,
  storagePath: string,
  userId: string,
  documentId?: string
) {
  const { data, error } = await supabase.storage
    .from('documents')
    .createSignedUrl(storagePath, 300) // 5 minute expiry

  if (error) throw error

  if (documentId) {
    await createAuditLog(supabase, {
      userId,
      action: 'document.accessed',
      entityType: 'candidate_document',
      entityId: documentId,
    })
  }

  return data.signedUrl
}

export async function deleteDocument(
  supabase: SupabaseClient,
  documentId: string,
  userId: string
) {
  const { data: doc } = await supabase
    .from('candidate_documents')
    .select('*')
    .eq('id', documentId)
    .single()

  if (!doc) throw new Error('Document not found')

  await supabase.storage.from('documents').remove([doc.storage_path])

  const { error } = await supabase
    .from('candidate_documents')
    .delete()
    .eq('id', documentId)

  if (error) throw error

  await createAuditLog(supabase, {
    userId,
    action: 'document.deleted',
    entityType: 'candidate_document',
    entityId: documentId,
    oldValues: { filename: doc.filename, candidate_id: doc.candidate_id },
  })
}

export async function getCandidateDocuments(
  supabase: SupabaseClient,
  candidateId: string
) {
  const { data, error } = await supabase
    .from('candidate_documents')
    .select('*, uploaded_by_user:users!candidate_documents_uploaded_by_fkey(first_name, last_name)')
    .eq('candidate_id', candidateId)
    .order('uploaded_at', { ascending: false })

  if (error) throw error
  return data ?? []
}
