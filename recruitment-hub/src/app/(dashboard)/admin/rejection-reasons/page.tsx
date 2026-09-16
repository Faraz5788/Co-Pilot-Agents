import { createClient } from '@/lib/supabase/server'
import { getRejectionReasons } from '@/lib/services/admin'
import { RejectionReasonPage } from '@/components/admin/rejection-reason-page'
import type { RejectionReasonRow } from '@/types/admin'

export const metadata = {
  title: 'Rejection Reasons',
}

export default async function AdminRejectionReasonsPage() {
  const supabase = await createClient()
  const reasons = await getRejectionReasons(supabase)

  return <RejectionReasonPage reasons={reasons as unknown as RejectionReasonRow[]} />
}
