import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getRequisition } from '@/lib/services/requisitions'
import { getApplicationsByStage } from '@/lib/services/applications'
import { getAuditLogs } from '@/lib/services/audit'
import {
  getDepartments,
  getLocations,
  getCostCentres,
  getJobProfiles,
  getPositions,
  getGrades,
  getUsers,
} from '@/lib/services/admin'
import { RequisitionDetail } from '@/components/requisitions/requisition-detail'
import type {
  PipelineStageColumn,
  RequisitionInterviewRow,
  RequisitionOfferRow,
  RequisitionReferenceData,
  RequisitionStageHistoryRow,
  RequisitionRecord,
  RequisitionAuditLogRow,
} from '@/components/requisitions/types'

interface RequisitionDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function RequisitionDetailPage({ params }: RequisitionDetailPageProps) {
  const { id } = await params
  const supabase = await createClient()

  let requisition
  try {
    requisition = await getRequisition(supabase, id)
  } catch {
    notFound()
  }

  const [
    pipeline,
    interviewsResult,
    offersResult,
    stageHistoryResult,
    auditLogResult,
    departments,
    locations,
    costCentres,
    jobProfiles,
    positions,
    grades,
    users,
  ] = await Promise.all([
    getApplicationsByStage(supabase, id),
    supabase
      .from('interviews')
      .select(
        `
        id, interview_type, status, scheduled_start, scheduled_end, location_type, location, meeting_url,
        application:applications!inner(
          id, requisition_id,
          candidate:candidates(id, first_name, last_name)
        ),
        interviewers:interviewers(user:users(id, first_name, last_name))
      `
      )
      .eq('application.requisition_id', id)
      .order('scheduled_start', { ascending: true }),
    supabase
      .from('offers')
      .select(
        `
        id, status, salary, currency, job_title, proposed_start_date, created_at,
        application:applications!inner(
          id, requisition_id,
          candidate:candidates(id, first_name, last_name)
        )
      `
      )
      .eq('application.requisition_id', id)
      .order('created_at', { ascending: false }),
    supabase
      .from('application_stage_history')
      .select(
        `
        id, changed_at, notes,
        application:applications!inner(
          id, requisition_id,
          candidate:candidates(id, first_name, last_name)
        ),
        from_stage:pipeline_stages!application_stage_history_from_stage_id_fkey(id, name),
        to_stage:pipeline_stages!application_stage_history_to_stage_id_fkey(id, name),
        changed_by_user:users!application_stage_history_changed_by_fkey(id, first_name, last_name)
      `
      )
      .eq('application.requisition_id', id)
      .order('changed_at', { ascending: false }),
    getAuditLogs(supabase, { entityType: 'requisition', entityId: id, pageSize: 50 }),
    getDepartments(supabase),
    getLocations(supabase),
    getCostCentres(supabase),
    getJobProfiles(supabase),
    getPositions(supabase),
    getGrades(supabase),
    getUsers(supabase),
  ])

  const referenceData: RequisitionReferenceData = {
    departments,
    locations,
    costCentres,
    jobProfiles,
    positions,
    grades,
    users: users.map((u) => ({
      id: u.id,
      first_name: u.first_name,
      last_name: u.last_name,
      email: u.email,
      status: u.status,
    })),
  }

  return (
    <RequisitionDetail
      requisition={requisition as unknown as RequisitionRecord}
      pipeline={pipeline as unknown as PipelineStageColumn[]}
      interviews={(interviewsResult.data ?? []) as unknown as RequisitionInterviewRow[]}
      offers={(offersResult.data ?? []) as unknown as RequisitionOfferRow[]}
      stageHistory={(stageHistoryResult.data ?? []) as unknown as RequisitionStageHistoryRow[]}
      auditLog={auditLogResult.data as unknown as RequisitionAuditLogRow[]}
      referenceData={referenceData}
    />
  )
}
