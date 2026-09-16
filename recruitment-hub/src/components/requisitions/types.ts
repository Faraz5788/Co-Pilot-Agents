import type { EmploymentType, RequisitionStatus } from '@/types/database'

// ---------------------------------------------------------------------------
// These types describe the *actual* Supabase `requisitions` table (see
// supabase/migrations/00001_initial_schema.sql) together with the joins
// performed by `REQUISITION_SELECT` in `src/lib/services/requisitions.ts`.
//
// Note: this intentionally does NOT reuse `Requisition` from
// `@/types/database` — that type models the shape used by the mock HRIS
// integration layer (`src/lib/integrations/*`), which uses different column
// names (e.g. `requisition_number`, `headcount`, `min_salary`) than the real
// database table these UI components read from.
// ---------------------------------------------------------------------------

export interface RequisitionUserRef {
  id: string
  first_name: string
  last_name: string
  email: string
}

export interface RequisitionDepartmentRef {
  id: string
  name: string
  code: string | null
}

export interface RequisitionLocationRef {
  id: string
  name: string
  city: string | null
  country: string | null
}

export interface RequisitionJobProfileRef {
  id: string
  name: string
  code: string | null
}

export interface RequisitionPositionRef {
  id: string
  title: string
  position_number: string | null
}

export interface RequisitionGradeRef {
  id: string
  name: string
  level: number | null
}

export interface RequisitionCostCentreRef {
  id: string
  name: string
  code: string | null
}

export interface RequisitionRecord {
  id: string
  reference_number: string
  workday_requisition_id: string | null
  title: string
  description: string | null
  job_profile_id: string | null
  position_id: string | null
  department_id: string | null
  cost_centre_id: string | null
  location_id: string | null
  hiring_manager_id: string
  lead_recruiter_id: string | null
  employment_type: EmploymentType
  fte: number
  vacancy_count: number
  is_replacement: boolean
  replacement_worker_id: string | null
  grade_id: string | null
  salary_min: number | null
  salary_max: number | null
  currency: string
  reason_for_hire: string | null
  target_start_date: string | null
  requested_date: string | null
  approved_date: string | null
  opened_date: string | null
  closed_date: string | null
  status: RequisitionStatus
  internal_notes: string | null
  created_by: string | null
  created_at: string
  updated_at: string
  department: RequisitionDepartmentRef | null
  location: RequisitionLocationRef | null
  hiring_manager: RequisitionUserRef | null
  lead_recruiter: RequisitionUserRef | null
  job_profile: RequisitionJobProfileRef | null
  position: RequisitionPositionRef | null
  grade: RequisitionGradeRef | null
  cost_centre: RequisitionCostCentreRef | null
}

// ---------------------------------------------------------------------------
// Reference / lookup data used to populate form selects and filter dropdowns
// ---------------------------------------------------------------------------

export interface ReferenceUser {
  id: string
  first_name: string
  last_name: string
  email: string
  status: string
}

export interface RequisitionReferenceData {
  departments: { id: string; name: string; code: string | null; active?: boolean }[]
  locations: { id: string; name: string; city: string | null; country: string | null; active?: boolean }[]
  costCentres: { id: string; name: string; code: string | null; active?: boolean }[]
  jobProfiles: { id: string; name: string; code: string | null; active?: boolean }[]
  positions: {
    id: string
    title: string
    active?: boolean
    department?: { name: string } | null
    job_profile?: { name: string } | null
  }[]
  grades: { id: string; name: string; level: number | null; active?: boolean }[]
  users: ReferenceUser[]
}

// ---------------------------------------------------------------------------
// Pipeline / interviews / offers / activity data for the detail view
// ---------------------------------------------------------------------------

export interface PipelineCandidateRef {
  id: string
  candidate_number: string
  first_name: string
  last_name: string
  email: string
  current_job_title: string | null
  current_employer: string | null
}

export interface PipelineApplication {
  id: string
  application_status: string
  application_date: string
  created_at: string
  candidate: PipelineCandidateRef | null
  assigned_recruiter: RequisitionUserRef | null
}

export interface PipelineStageColumn {
  id: string
  name: string
  display_order: number
  stage_type: string
  applications: PipelineApplication[]
}

export interface RequisitionInterviewRow {
  id: string
  interview_type: string
  status: string
  scheduled_start: string
  scheduled_end: string
  location_type: string
  location: string | null
  meeting_url: string | null
  application: {
    id: string
    candidate: { id: string; first_name: string; last_name: string } | null
  } | null
  interviewers: { user: { id: string; first_name: string; last_name: string } | null }[]
}

export interface RequisitionOfferRow {
  id: string
  status: string
  salary: number
  currency: string
  job_title: string
  proposed_start_date: string | null
  created_at: string
  application: {
    id: string
    candidate: { id: string; first_name: string; last_name: string } | null
  } | null
}

export interface RequisitionStageHistoryRow {
  id: string
  changed_at: string
  notes: string | null
  application: {
    id: string
    candidate: { id: string; first_name: string; last_name: string } | null
  } | null
  from_stage: { id: string; name: string } | null
  to_stage: { id: string; name: string } | null
  changed_by_user: { id: string; first_name: string; last_name: string } | null
}

export interface RequisitionAuditLogRow {
  id: string
  action: string
  created_at: string
  old_values: Record<string, unknown> | null
  new_values: Record<string, unknown> | null
  user: { id: string; first_name: string; last_name: string } | null
}
