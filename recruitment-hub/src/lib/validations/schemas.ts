import { z } from 'zod'

export const interviewTypeEnum = z.enum([
  'telephone_screen', 'recruiter_interview', 'hiring_manager_interview',
  'technical_interview', 'panel_interview', 'final_interview',
])

export const locationTypeEnum = z.enum(['in_person', 'remote', 'hybrid'])

export const recommendationTypeEnum = z.enum(['strong_yes', 'yes', 'mixed', 'no', 'strong_no'])

export const employmentTypeEnum = z.enum(['full_time', 'part_time', 'contract', 'temporary', 'intern'])

export const offerStatusEnum = z.enum([
  'draft', 'pending_approval', 'approved', 'sent', 'accepted', 'declined', 'withdrawn',
])

export const loginSchema = z.object({
  email: z.string().email('Must be a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})
export type LoginInput = z.infer<typeof loginSchema>

export const createRequisitionSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  description: z.string().max(10000).optional(),
  job_profile_id: z.string().uuid().optional().nullable(),
  position_id: z.string().uuid().optional().nullable(),
  department_id: z.string().uuid().optional().nullable(),
  cost_centre_id: z.string().uuid().optional().nullable(),
  location_id: z.string().uuid().optional().nullable(),
  hiring_manager_id: z.string().uuid('Hiring manager is required'),
  lead_recruiter_id: z.string().uuid().optional().nullable(),
  employment_type: z.enum(['full_time', 'part_time', 'contract', 'temporary', 'intern']).default('full_time'),
  fte: z.coerce.number().min(0).max(1).default(1),
  vacancy_count: z.coerce.number().int().min(1).default(1),
  is_replacement: z.boolean().default(false),
  replacement_worker_id: z.string().optional().nullable(),
  grade_id: z.string().uuid().optional().nullable(),
  salary_min: z.coerce.number().nonnegative().optional().nullable(),
  salary_max: z.coerce.number().nonnegative().optional().nullable(),
  currency: z.string().max(3).default('GBP'),
  reason_for_hire: z.string().max(2000).optional().nullable(),
  target_start_date: z.string().optional().nullable(),
  internal_notes: z.string().max(5000).optional().nullable(),
  status: z.enum(['draft', 'pending_approval']).default('draft'),
})
export type CreateRequisitionInput = z.infer<typeof createRequisitionSchema>

export const updateRequisitionSchema = createRequisitionSchema.partial()
export type UpdateRequisitionInput = z.infer<typeof updateRequisitionSchema>

export const createCandidateSchema = z.object({
  first_name: z.string().min(1, 'First name is required').max(100),
  middle_name: z.string().max(100).optional().nullable(),
  last_name: z.string().min(1, 'Last name is required').max(100),
  preferred_name: z.string().max(100).optional().nullable(),
  email: z.string().email('Must be a valid email address'),
  phone: z.string().max(30).optional().nullable(),
  location: z.string().max(200).optional().nullable(),
  linkedin_url: z.string().url().optional().nullable().or(z.literal('')),
  source_id: z.string().uuid().optional().nullable(),
  current_employer: z.string().max(200).optional().nullable(),
  current_job_title: z.string().max(200).optional().nullable(),
  notice_period: z.string().max(100).optional().nullable(),
  salary_expectation: z.coerce.number().nonnegative().optional().nullable(),
  currency: z.string().max(3).optional().nullable(),
  right_to_work_status: z.string().max(100).optional().nullable(),
  consent_given: z.boolean().default(false),
})
export type CreateCandidateInput = z.infer<typeof createCandidateSchema>

export const updateCandidateSchema = createCandidateSchema.partial()
export type UpdateCandidateInput = z.infer<typeof updateCandidateSchema>

export const createApplicationSchema = z.object({
  candidate_id: z.string().uuid(),
  requisition_id: z.string().uuid(),
  assigned_recruiter_id: z.string().uuid().optional().nullable(),
  source_id: z.string().uuid().optional().nullable(),
  salary_expectation: z.coerce.number().nonnegative().optional().nullable(),
  notice_period: z.string().max(100).optional().nullable(),
})
export type CreateApplicationInput = z.infer<typeof createApplicationSchema>

export const createInterviewSchema = z.object({
  application_id: z.string().uuid(),
  interview_type: z.enum([
    'telephone_screen', 'recruiter_interview', 'hiring_manager_interview',
    'technical_interview', 'panel_interview', 'final_interview',
  ]),
  scheduled_start: z.string(),
  scheduled_end: z.string(),
  location_type: z.enum(['in_person', 'remote', 'hybrid']).default('remote'),
  location: z.string().max(500).optional().nullable(),
  meeting_url: z.string().url().optional().nullable().or(z.literal('')),
  notes: z.string().max(2000).optional().nullable(),
  interviewer_ids: z.array(z.string().uuid()).min(1, 'At least one interviewer is required'),
})
export type CreateInterviewInput = z.infer<typeof createInterviewSchema>

export const createOfferSchema = z.object({
  application_id: z.string().uuid(),
  job_title: z.string().min(2, 'Job title is required').max(200),
  salary: z.coerce.number().positive('Salary must be positive'),
  currency: z.string().max(3).default('GBP'),
  grade_id: z.string().uuid().optional().nullable(),
  location_id: z.string().uuid().optional().nullable(),
  employment_type: z.enum(['full_time', 'part_time', 'contract', 'temporary', 'intern']).default('full_time'),
  fte: z.coerce.number().min(0).max(1).default(1),
  proposed_start_date: z.string().optional().nullable(),
  bonus: z.string().max(500).optional().nullable(),
  additional_terms: z.string().max(5000).optional().nullable(),
})
export type CreateOfferInput = z.infer<typeof createOfferSchema>

export const submitFeedbackSchema = z.object({
  interview_id: z.string().uuid(),
  overall_recommendation: z.enum(['strong_yes', 'yes', 'mixed', 'no', 'strong_no']),
  overall_score: z.coerce.number().int().min(1).max(5).optional().nullable(),
  strengths: z.string().max(3000).optional().nullable(),
  concerns: z.string().max(3000).optional().nullable(),
  feedback: z.array(z.object({
    competency_id: z.string().uuid(),
    score: z.coerce.number().int().min(1).max(5),
    comments: z.string().max(1000).optional().nullable(),
  })).default([]),
})
export type SubmitFeedbackInput = z.infer<typeof submitFeedbackSchema>

export const stageTransitionSchema = z.object({
  to_stage_id: z.string().uuid(),
  notes: z.string().max(2000).optional().nullable(),
})
export type StageTransitionInput = z.infer<typeof stageTransitionSchema>

export const rejectApplicationSchema = z.object({
  rejection_reason_id: z.string().uuid(),
  notes: z.string().max(2000).optional().nullable(),
})
export type RejectApplicationInput = z.infer<typeof rejectApplicationSchema>
