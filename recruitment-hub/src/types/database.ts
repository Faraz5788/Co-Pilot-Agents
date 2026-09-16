export type RequisitionStatus =
  | 'draft'
  | 'pending_approval'
  | 'approved'
  | 'open'
  | 'on_hold'
  | 'closed'
  | 'cancelled'

export type ApplicationStatus = 'active' | 'rejected' | 'withdrawn' | 'hired' | 'on_hold'

export type InterviewStatus = 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'

export type InterviewType =
  | 'telephone_screen'
  | 'recruiter_interview'
  | 'hiring_manager_interview'
  | 'technical_interview'
  | 'panel_interview'
  | 'final_interview'

export type LocationType = 'in_person' | 'remote' | 'hybrid'

export type OfferStatus =
  | 'draft'
  | 'pending_approval'
  | 'approved'
  | 'sent'
  | 'accepted'
  | 'declined'
  | 'withdrawn'

export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'cancelled'

export type EmploymentType = 'full_time' | 'part_time' | 'contract' | 'temporary' | 'intern'

export type DocumentType = 'cv' | 'cover_letter' | 'certificate' | 'reference' | 'other'

export type RecommendationType = 'strong_yes' | 'yes' | 'mixed' | 'no' | 'strong_no'

export type StageType =
  | 'application'
  | 'screening'
  | 'review'
  | 'interview'
  | 'offer'
  | 'hired'
  | 'rejected'
  | 'withdrawn'

export type NotificationType =
  | 'candidate_review'
  | 'interview_scheduled'
  | 'feedback_required'
  | 'offer_pending'
  | 'stage_change'
  | 'requisition_update'
  | 'general'

export type RequisitionPriority = 'low' | 'medium' | 'high' | 'urgent'

export type IntegrationDirection = 'inbound' | 'outbound'
export type IntegrationStatus = 'queued' | 'processing' | 'success' | 'failed' | 'retrying'

export interface User {
  id: string
  email: string
  first_name: string
  last_name: string
  avatar_url: string | null
  status: string
  created_at: string
  updated_at: string
}

export interface Role {
  id: string
  name: string
  description: string | null
  created_at: string
}

export interface UserRole {
  id: string
  user_id: string
  role_id: string
  created_at: string
}

export interface Department {
  id: string
  name: string
  code: string | null
  workday_id: string | null
  active: boolean
  created_at: string
  updated_at: string
}

export interface Location {
  id: string
  name: string
  city: string | null
  country: string | null
  workday_id: string | null
  active: boolean
  created_at: string
  updated_at: string
}

export interface CostCentre {
  id: string
  name: string
  code: string | null
  workday_id: string | null
  active: boolean
  created_at: string
  updated_at: string
}

export interface JobProfile {
  id: string
  name: string
  code: string | null
  level: string | null
  workday_id: string | null
  active: boolean
  created_at: string
  updated_at: string
}

export interface Position {
  id: string
  title: string
  position_number: string | null
  job_profile_id: string | null
  department_id: string | null
  workday_id: string | null
  active: boolean
  created_at: string
  updated_at: string
}

export interface Grade {
  id: string
  name: string
  level: number | null
  workday_id: string | null
  active: boolean
  created_at: string
  updated_at: string
}

export interface Worker {
  id: string
  external_id: string
  first_name: string
  last_name: string
  email: string
  job_title: string | null
  department_id: string | null
  location_id: string | null
  manager_id: string | null
  hire_date: string | null
  status: string
  created_at: string
}

export interface Manager {
  id: string
  worker_id: string
  first_name: string
  last_name: string
  email: string
  department_id: string | null
  created_at: string
}

export interface Source {
  id: string
  name: string
  category: string | null
  active: boolean
  created_at: string
}

export interface RejectionReason {
  id: string
  name: string
  category: string | null
  active: boolean
  created_at: string
}

export interface PipelineStage {
  id: string
  name: string
  display_order: number
  stage_type: StageType
  is_default: boolean
  active: boolean
  created_at: string
  updated_at: string
}

export interface Competency {
  id: string
  name: string
  description: string | null
  category: string | null
  active: boolean
  created_at: string
}

export interface Requisition {
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
}

export interface Candidate {
  id: string
  candidate_number: string
  first_name: string
  middle_name: string | null
  last_name: string
  preferred_name: string | null
  email: string
  phone: string | null
  location: string | null
  linkedin_url: string | null
  source_id: string | null
  current_employer: string | null
  current_job_title: string | null
  notice_period: string | null
  salary_expectation: number | null
  currency: string | null
  right_to_work_status: string | null
  consent_given: boolean
  consent_date: string | null
  gdpr_retention_date: string | null
  created_at: string
  updated_at: string
}

export interface CandidateDocument {
  id: string
  candidate_id: string
  document_type: DocumentType
  storage_path: string
  filename: string
  mime_type: string
  file_size: number | null
  uploaded_by: string | null
  uploaded_at: string
}

export interface Application {
  id: string
  candidate_id: string
  requisition_id: string
  current_stage_id: string | null
  application_status: ApplicationStatus
  application_date: string
  assigned_recruiter_id: string | null
  source_id: string | null
  salary_expectation: number | null
  notice_period: string | null
  screening_summary: string | null
  rejection_reason_id: string | null
  withdrawal_reason: string | null
  created_at: string
  updated_at: string
}

export interface ApplicationStageHistory {
  id: string
  application_id: string
  from_stage_id: string | null
  to_stage_id: string
  changed_by: string | null
  changed_at: string
  notes: string | null
}

export interface Interview {
  id: string
  application_id: string
  interview_type: InterviewType
  scheduled_start: string
  scheduled_end: string
  location_type: LocationType
  location: string | null
  meeting_url: string | null
  notes: string | null
  status: InterviewStatus
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface Interviewer {
  id: string
  interview_id: string
  user_id: string
}

export interface InterviewScorecard {
  id: string
  interview_id: string
  reviewer_id: string
  overall_recommendation: RecommendationType | null
  overall_score: number | null
  strengths: string | null
  concerns: string | null
  submitted_at: string | null
  status: string
  created_at: string
}

export interface InterviewFeedback {
  id: string
  scorecard_id: string
  competency_id: string
  score: number
  comments: string | null
}

export interface Offer {
  id: string
  application_id: string
  salary: number
  currency: string
  grade_id: string | null
  job_title: string
  location_id: string | null
  employment_type: EmploymentType
  fte: number
  proposed_start_date: string | null
  bonus: string | null
  additional_terms: string | null
  status: OfferStatus
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface Approval {
  id: string
  object_type: string
  object_id: string
  approval_type: string
  approver_id: string | null
  status: ApprovalStatus
  requested_at: string
  responded_at: string | null
  comments: string | null
}

export interface RecruiterNote {
  id: string
  application_id: string
  created_by: string | null
  note: string
  created_at: string
}

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  message: string | null
  object_type: string | null
  object_id: string | null
  read_at: string | null
  created_at: string
}

export interface WorkdayMapping {
  id: string
  object_type: string
  internal_id: string
  workday_id: string
  workday_descriptor: string | null
  last_synced_at: string | null
  created_at: string
}

export interface IntegrationEvent {
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

export interface AuditLog {
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
}

export interface UserWithRoles extends User {
  roles: Role[]
  user_roles?: Array<{ role: Role }>
}

export interface RequisitionWithRelations extends Requisition {
  department?: Department | null
  location?: Location | null
  hiring_manager?: User | null
  lead_recruiter?: User | null
  job_profile?: JobProfile | null
  position?: Position | null
  grade?: Grade | null
  cost_centre?: CostCentre | null
  applications_count?: number
}

export interface ApplicationWithRelations extends Application {
  candidate?: Candidate | null
  requisition?: Requisition | null
  current_stage?: PipelineStage | null
  assigned_recruiter?: User | null
  source?: Source | null
  rejection_reason?: RejectionReason | null
}

export interface CandidateWithRelations extends Candidate {
  applications?: Application[]
  documents?: CandidateDocument[]
  source?: Source | null
}

export interface InterviewWithRelations extends Interview {
  application?: ApplicationWithRelations | null
  interviewers?: Array<{ user: User }>
  scorecards?: InterviewScorecard[]
}

export interface OfferWithRelations extends Offer {
  application?: ApplicationWithRelations | null
  grade?: Grade | null
  location?: Location | null
}
