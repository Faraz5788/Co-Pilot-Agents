import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import {
  approveOffer,
  submitOfferForApproval,
  updateOfferStatus,
} from '@/lib/services/offers'
import { offerStatusEnum } from '@/lib/validations/schemas'

const updateStatusBodySchema = z.object({
  status: offerStatusEnum,
  approver_id: z.uuid().optional(),
  comments: z.string().max(2_000).optional(),
})

/**
 * Transitions an offer's status. Encodes the approval workflow so callers
 * can drive the whole lifecycle through a single endpoint:
 *  - `pending_approval` requires an `approver_id` and creates the approval
 *    record (via `submitOfferForApproval`).
 *  - `approved` records the current user as the approver (via `approveOffer`).
 *  - Any other status (`sent`, `accepted`, `declined`, `withdrawn`, `draft`)
 *    is a plain status update.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = updateStatusBodySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const { status, approver_id, comments } = parsed.data

  try {
    if (status === 'pending_approval') {
      if (!approver_id) {
        return NextResponse.json(
          { error: 'An approver is required to submit an offer for approval' },
          { status: 400 }
        )
      }
      const offer = await submitOfferForApproval(supabase, id, approver_id, user.id)
      return NextResponse.json(offer)
    }

    if (status === 'approved') {
      const offer = await approveOffer(supabase, id, user.id, comments)
      return NextResponse.json(offer)
    }

    const offer = await updateOfferStatus(supabase, id, status, user.id)
    return NextResponse.json(offer)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update offer status' },
      { status: 500 }
    )
  }
}
