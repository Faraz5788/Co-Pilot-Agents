import type {
  CostCentre,
  EmploymentType,
  JobProfile,
  Location,
  Manager,
  Position,
  Requisition,
  Worker,
} from '@/types/database'

/**
 * Payload for creating a requisition in the upstream HRIS/HCM system. This is
 * intentionally narrower than the full `Requisition` row: identifiers such as
 * `id`, `requisition_number`, timestamps, and workflow state are assigned by
 * the HRIS (or by our own system, for the mock provider) rather than
 * supplied by the caller.
 */
export interface CreateRequisitionData {
  title: string
  department_id: string
  location_id: string
  hiring_manager_id: string
  lead_recruiter_id?: string
  job_profile_id?: string
  position_id?: string
  grade_id?: string
  cost_centre_id?: string
  employment_type: EmploymentType
  headcount: number
  min_salary?: number
  max_salary?: number
  currency?: string
  description?: string
  target_start_date?: string
}

export type UpdateRequisitionData = Partial<CreateRequisitionData> & {
  status?: Requisition['status']
  closed_reason?: string
}

/**
 * Data required to create a "pre-hire" record in the HRIS ahead of a formal
 * hire submission -- typically used to reserve an employee record once an
 * offer has been accepted.
 */
export interface PreHireData {
  application_id: string
  requisition_id: string
  first_name: string
  last_name: string
  email: string
  position_id?: string
  start_date: string
}

/**
 * Data required to submit a completed hire to the HRIS, converting a
 * pre-hire (or candidate) into a full worker record.
 */
export interface HireData {
  pre_hire_id?: string
  application_id: string
  requisition_id: string
  worker_first_name: string
  worker_last_name: string
  worker_email: string
  position_id?: string
  location_id?: string
  manager_id?: string
  start_date: string
  base_salary?: number
  currency?: string
}

/**
 * Abstraction over an external HRIS/HCM system (e.g. Workday, SAP
 * SuccessFactors, BambooHR). Concrete implementations translate these calls
 * into whatever API the underlying provider exposes. This lets the rest of
 * the application depend on a single, stable contract regardless of which
 * HRIS the organization uses.
 */
export interface HRISProvider {
  getLocations(): Promise<Location[]>
  getCostCentres(): Promise<CostCentre[]>
  getJobProfiles(): Promise<JobProfile[]>
  getPositions(): Promise<Position[]>
  getWorkers(): Promise<Worker[]>
  getManagers(): Promise<Manager[]>
  getRequisition(id: string): Promise<Requisition | null>
  createRequisition(data: CreateRequisitionData): Promise<string>
  updateRequisition(id: string, data: UpdateRequisitionData): Promise<void>
  createPreHire(data: PreHireData): Promise<string>
  submitHire(data: HireData): Promise<string>
}
