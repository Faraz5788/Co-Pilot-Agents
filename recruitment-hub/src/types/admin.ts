/**
 * Row shapes returned by the admin services (`@/lib/services/admin`,
 * `@/lib/services/audit`) and the `/api/admin/*` routes.
 *
 * These intentionally mirror the real Postgres schema in
 * `supabase/migrations/00001_initial_schema.sql` rather than the
 * aspirational shapes in `@/types/database` (which predate several of
 * these tables and use different column names in places).
 */

export interface RoleRow {
  id: string
  name: string
  description: string | null
  created_at: string
}

export interface AdminUserRow {
  id: string
  email: string
  first_name: string
  last_name: string
  avatar_url: string | null
  status: string
  created_at: string
  updated_at: string
  user_roles?: Array<{ role: RoleRow | null }>
}

export type StageType =
  | 'application'
  | 'screening'
  | 'review'
  | 'interview'
  | 'offer'
  | 'hired'
  | 'rejected'
  | 'withdrawn'

export interface PipelineStageRow {
  id: string
  name: string
  display_order: number
  stage_type: StageType
  is_default: boolean
  active: boolean
  created_at: string
  updated_at: string
}

export interface SourceRow {
  id: string
  name: string
  category: string | null
  active: boolean
  created_at: string
}

export interface RejectionReasonRow {
  id: string
  name: string
  category: string | null
  active: boolean
  created_at: string
}

export interface DepartmentRow {
  id: string
  name: string
  code: string | null
  workday_id: string | null
  active: boolean
  created_at: string
  updated_at: string
}

export interface LocationRow {
  id: string
  name: string
  city: string | null
  country: string | null
  workday_id: string | null
  active: boolean
  created_at: string
  updated_at: string
}

export interface CostCentreRow {
  id: string
  name: string
  code: string | null
  workday_id: string | null
  active: boolean
  created_at: string
  updated_at: string
}

export interface JobProfileRow {
  id: string
  name: string
  code: string | null
  level: string | null
  workday_id: string | null
  active: boolean
  created_at: string
  updated_at: string
}

export interface PositionRow {
  id: string
  title: string
  position_number: string | null
  job_profile_id: string | null
  department_id: string | null
  workday_id: string | null
  active: boolean
  created_at: string
  updated_at: string
  job_profile?: { name: string } | null
  department?: { name: string } | null
}

export interface GradeRow {
  id: string
  name: string
  level: number | null
  workday_id: string | null
  active: boolean
  created_at: string
  updated_at: string
}

export interface CompetencyRow {
  id: string
  name: string
  description: string | null
  category: string | null
  active: boolean
  created_at: string
}

export interface AuditLogUserRef {
  id: string
  first_name: string
  last_name: string
  email: string
}

export interface AuditLogRow {
  id: string
  user_id: string | null
  action: string
  entity_type: string
  entity_id: string | null
  old_values: Record<string, unknown> | null
  new_values: Record<string, unknown> | null
  ip_address: string | null
  user_agent: string | null
  created_at: string
  user?: AuditLogUserRef | null
}

export interface AuditLogListResult {
  data: AuditLogRow[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export type IntegrationDirection = 'inbound' | 'outbound'
export type IntegrationStatus = 'queued' | 'processing' | 'success' | 'failed' | 'retrying'

export interface IntegrationEventRow {
  id: string
  integration: string
  direction: IntegrationDirection
  object_type: string
  object_id: string | null
  status: IntegrationStatus
  request_payload: Record<string, unknown> | null
  response_payload: Record<string, unknown> | null
  error_message: string | null
  created_at: string
  processed_at: string | null
}
