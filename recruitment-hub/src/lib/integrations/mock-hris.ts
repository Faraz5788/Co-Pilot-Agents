import { v4 as uuidv4 } from 'uuid'
import type {
  CostCentre,
  JobProfile,
  Location,
  Manager,
  Position,
  Requisition,
  Worker,
} from '@/types/database'
import type {
  CreateRequisitionData,
  HireData,
  HRISProvider,
  PreHireData,
  UpdateRequisitionData,
} from './hris-provider'

const nowIso = () => new Date().toISOString()

function simulateLatency<T>(value: T, ms = 150): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

const MOCK_LOCATIONS: Location[] = [
  {
    id: 'loc-nyc',
    name: 'New York HQ',
    city: 'New York',
    country: 'USA',
    workday_id: null,
    active: true,
    created_at: nowIso(),
    updated_at: nowIso(),
  },
  {
    id: 'loc-remote',
    name: 'Remote - United States',
    city: null,
    country: 'USA',
    workday_id: null,
    active: true,
    created_at: nowIso(),
    updated_at: nowIso(),
  },
  {
    id: 'loc-london',
    name: 'London Office',
    city: 'London',
    country: 'UK',
    workday_id: null,
    active: true,
    created_at: nowIso(),
    updated_at: nowIso(),
  },
]

const MOCK_COST_CENTRES: CostCentre[] = [
  { id: 'cc-eng', code: 'CC-100', name: 'Engineering', workday_id: null, active: true, created_at: nowIso(), updated_at: nowIso() },
  { id: 'cc-sales', code: 'CC-200', name: 'Sales', workday_id: null, active: true, created_at: nowIso(), updated_at: nowIso() },
  { id: 'cc-people', code: 'CC-300', name: 'People & Talent', workday_id: null, active: true, created_at: nowIso(), updated_at: nowIso() },
]

const MOCK_JOB_PROFILES: JobProfile[] = [
  {
    id: 'jp-swe',
    name: 'Software Engineer',
    code: 'ENG-SWE',
    level: null,
    workday_id: null,
    active: true,
    created_at: nowIso(),
    updated_at: nowIso(),
  },
  {
    id: 'jp-ae',
    name: 'Account Executive',
    code: 'SALES-AE',
    level: null,
    workday_id: null,
    active: true,
    created_at: nowIso(),
    updated_at: nowIso(),
  },
  {
    id: 'jp-recruiter',
    name: 'Technical Recruiter',
    code: 'PEOPLE-REC',
    level: null,
    workday_id: null,
    active: true,
    created_at: nowIso(),
    updated_at: nowIso(),
  },
]

const MOCK_POSITIONS: Position[] = [
  {
    id: 'pos-1',
    title: 'Senior Software Engineer, Platform',
    position_number: 'POS-1001',
    job_profile_id: 'jp-swe',
    department_id: 'dept-eng',
    workday_id: null,
    active: true,
    created_at: nowIso(),
    updated_at: nowIso(),
  },
  {
    id: 'pos-2',
    title: 'Enterprise Account Executive',
    position_number: 'POS-1002',
    job_profile_id: 'jp-ae',
    department_id: 'dept-sales',
    workday_id: null,
    active: true,
    created_at: nowIso(),
    updated_at: nowIso(),
  },
]

const MOCK_WORKERS: Worker[] = [
  {
    id: 'worker-1',
    external_id: 'EMP-0001',
    first_name: 'Priya',
    last_name: 'Natarajan',
    email: 'priya.natarajan@example.com',
    job_title: 'VP of Engineering',
    department_id: 'dept-eng',
    location_id: 'loc-nyc',
    manager_id: null,
    hire_date: '2019-03-04',
    status: 'active',
    created_at: nowIso(),
  },
  {
    id: 'worker-2',
    external_id: 'EMP-0002',
    first_name: 'Marcus',
    last_name: 'Webb',
    email: 'marcus.webb@example.com',
    job_title: 'Head of Sales',
    department_id: 'dept-sales',
    location_id: 'loc-nyc',
    manager_id: null,
    hire_date: '2020-07-13',
    status: 'active',
    created_at: nowIso(),
  },
]

const MOCK_MANAGERS: Manager[] = [
  {
    id: 'mgr-1',
    worker_id: 'worker-1',
    first_name: 'Priya',
    last_name: 'Natarajan',
    email: 'priya.natarajan@example.com',
    department_id: 'dept-eng',
    created_at: nowIso(),
  },
  {
    id: 'mgr-2',
    worker_id: 'worker-2',
    first_name: 'Marcus',
    last_name: 'Webb',
    email: 'marcus.webb@example.com',
    department_id: 'dept-sales',
    created_at: nowIso(),
  },
]

/**
 * In-memory mock implementation of {@link HRISProvider}. Useful for local
 * development, demos, and tests where a live HRIS connection is unavailable
 * or undesirable. Mutating calls (`createRequisition`, `updateRequisition`,
 * `createPreHire`, `submitHire`) persist to an in-memory store that lives for
 * the lifetime of the process.
 */
export class MockHRISProvider implements HRISProvider {
  private requisitions = new Map<string, Requisition>()
  private preHires = new Map<string, PreHireData & { id: string }>()
  private hires = new Map<string, HireData & { id: string }>()

  async getLocations(): Promise<Location[]> {
    return simulateLatency(MOCK_LOCATIONS)
  }

  async getCostCentres(): Promise<CostCentre[]> {
    return simulateLatency(MOCK_COST_CENTRES)
  }

  async getJobProfiles(): Promise<JobProfile[]> {
    return simulateLatency(MOCK_JOB_PROFILES)
  }

  async getPositions(): Promise<Position[]> {
    return simulateLatency(MOCK_POSITIONS)
  }

  async getWorkers(): Promise<Worker[]> {
    return simulateLatency(MOCK_WORKERS)
  }

  async getManagers(): Promise<Manager[]> {
    return simulateLatency(MOCK_MANAGERS)
  }

  async getRequisition(id: string): Promise<Requisition | null> {
    return simulateLatency(this.requisitions.get(id) ?? null)
  }

  async createRequisition(data: CreateRequisitionData): Promise<string> {
    const id = uuidv4()
    const timestamp = nowIso()
    const requisition: Requisition = {
      id,
      reference_number: `REQ-${Math.floor(Math.random() * 90_000 + 10_000)}`,
      workday_requisition_id: null,
      title: data.title,
      description: data.description ?? null,
      job_profile_id: data.job_profile_id ?? null,
      position_id: data.position_id ?? null,
      department_id: data.department_id,
      cost_centre_id: data.cost_centre_id ?? null,
      location_id: data.location_id,
      hiring_manager_id: data.hiring_manager_id,
      lead_recruiter_id: data.lead_recruiter_id ?? null,
      employment_type: data.employment_type,
      fte: 1,
      vacancy_count: data.headcount,
      is_replacement: false,
      replacement_worker_id: null,
      grade_id: data.grade_id ?? null,
      salary_min: data.min_salary ?? null,
      salary_max: data.max_salary ?? null,
      currency: data.currency ?? 'GBP',
      reason_for_hire: null,
      target_start_date: data.target_start_date ?? null,
      requested_date: null,
      approved_date: null,
      opened_date: null,
      closed_date: null,
      status: 'draft',
      internal_notes: null,
      created_by: data.hiring_manager_id,
      created_at: timestamp,
      updated_at: timestamp,
    }

    this.requisitions.set(id, requisition)
    return simulateLatency(id)
  }

  async updateRequisition(id: string, data: UpdateRequisitionData): Promise<void> {
    const existing = this.requisitions.get(id)
    if (!existing) {
      throw new Error(`Requisition ${id} not found in mock HRIS store`)
    }

    const mapped: Partial<Requisition> = {}
    if (data.title !== undefined) mapped.title = data.title
    if (data.description !== undefined) mapped.description = data.description ?? null
    if (data.department_id !== undefined) mapped.department_id = data.department_id
    if (data.location_id !== undefined) mapped.location_id = data.location_id
    if (data.employment_type !== undefined) mapped.employment_type = data.employment_type
    if (data.headcount !== undefined) mapped.vacancy_count = data.headcount
    if (data.min_salary !== undefined) mapped.salary_min = data.min_salary ?? null
    if (data.max_salary !== undefined) mapped.salary_max = data.max_salary ?? null
    if (data.currency !== undefined) mapped.currency = data.currency ?? existing.currency
    if (data.status !== undefined) mapped.status = data.status

    this.requisitions.set(id, {
      ...existing,
      ...mapped,
      updated_at: nowIso(),
    })

    await simulateLatency(undefined)
  }

  async createPreHire(data: PreHireData): Promise<string> {
    const id = uuidv4()
    this.preHires.set(id, { ...data, id })
    return simulateLatency(id)
  }

  async submitHire(data: HireData): Promise<string> {
    const id = uuidv4()
    this.hires.set(id, { ...data, id })

    const requisition = this.requisitions.get(data.requisition_id)
    if (requisition) {
      this.requisitions.set(data.requisition_id, {
        ...requisition,
        updated_at: nowIso(),
      })
    }

    return simulateLatency(id)
  }
}

export const mockHRISProvider = new MockHRISProvider()
