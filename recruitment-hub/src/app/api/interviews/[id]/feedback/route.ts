import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { submitScorecard } from '@/lib/services/interviews'
import { recommendationTypeEnum } from '@/lib/validations/schemas'

const submitFeedbackBodySchema = z.object({
  overall_recommendation: recommendationTypeEnum,
  overall_score: z.number().int().min(1).max(5).optional(),
  strengths: z.string().max(3_000).optional(),
  concerns: z.string().max(3_000).optional(),
  feedback: z
    .array(
      z.object({
        competency_id: z.uuid(),
        score: z.number().int().min(1).max(5),
        comments: z.string().max(1_000).optional(),
      })
    )
    .default([]),
})

export async function POST(
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

  const parsed = submitFeedbackBodySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  try {
    const scorecard = await submitScorecard(
      supabase,
      { interview_id: id, ...parsed.data },
      user.id
    )
    return NextResponse.json(scorecard, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to submit feedback' },
      { status: 500 }
    )
  }
}
