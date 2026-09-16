export * from './database'

export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface RequisitionFilters {
  status?: string
  departmentId?: string
  locationId?: string
  hiringManagerId?: string
  recruiterId?: string
  search?: string
  page?: number
  pageSize?: number
}

export interface CandidateFilters {
  search?: string
  sourceId?: string
  location?: string
  page?: number
  pageSize?: number
}

export interface ApplicationFilters {
  requisitionId?: string
  candidateId?: string
  stageId?: string
  status?: string
  recruiterId?: string
  search?: string
  page?: number
  pageSize?: number
}

export interface InterviewFilters {
  applicationId?: string
  interviewerId?: string
  status?: string
  fromDate?: string
  toDate?: string
  page?: number
  pageSize?: number
}

export interface OfferFilters {
  status?: string
  page?: number
  pageSize?: number
}

export type RoleName = 'admin' | 'rec_admin' | 'recruiter' | 'hiring_manager' | 'interviewer' | 'hr_reward'
