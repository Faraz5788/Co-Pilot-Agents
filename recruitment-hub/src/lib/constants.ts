import type {
  ApplicationStatus,
  ApprovalStatus,
  EmploymentType,
  InterviewStatus,
  InterviewType,
  OfferStatus,
  RecommendationType,
  RequisitionPriority,
  RequisitionStatus,
} from '@/types/database'

// ---------------------------------------------------------------------------
// App metadata
// ---------------------------------------------------------------------------

export const APP_NAME = 'Recruitment Hub'
export const APP_DESCRIPTION = 'Applicant tracking and requisition management'

// ---------------------------------------------------------------------------
// Pagination / uploads
// ---------------------------------------------------------------------------

export const ITEMS_PER_PAGE = 25
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const

export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export const ALLOWED_FILE_TYPES = {
  cv: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  cover_letter: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  certificate: ['application/pdf', 'image/png', 'image/jpeg'],
  reference: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  other: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/png', 'image/jpeg'],
} as const

export const ALLOWED_FILE_EXTENSIONS = ['.pdf', '.doc', '.docx'] as const

// ---------------------------------------------------------------------------
// Currency
// ---------------------------------------------------------------------------

export interface CurrencyOption {
  code: string
  label: string
  symbol: string
}

export const CURRENCY_OPTIONS: CurrencyOption[] = [
  { code: 'USD', label: 'US Dollar', symbol: '$' },
  { code: 'EUR', label: 'Euro', symbol: '€' },
  { code: 'GBP', label: 'British Pound', symbol: '£' },
  { code: 'CAD', label: 'Canadian Dollar', symbol: 'CA$' },
  { code: 'AUD', label: 'Australian Dollar', symbol: 'A$' },
  { code: 'INR', label: 'Indian Rupee', symbol: '₹' },
  { code: 'SGD', label: 'Singapore Dollar', symbol: 'S$' },
  { code: 'AED', label: 'UAE Dirham', symbol: 'د.إ' },
]

// ---------------------------------------------------------------------------
// Label maps
// ---------------------------------------------------------------------------

export const EMPLOYMENT_TYPE_LABELS: Record<EmploymentType, string> = {
  full_time: 'Full-time',
  part_time: 'Part-time',
  contract: 'Contract',
  temporary: 'Temporary',
  intern: 'Internship',
}

export const REQUISITION_STATUS_LABELS: Record<RequisitionStatus, string> = {
  draft: 'Draft',
  pending_approval: 'Pending Approval',
  approved: 'Approved',
  open: 'Open',
  on_hold: 'On Hold',
  closed: 'Closed',
  cancelled: 'Cancelled',
}

export const REQUISITION_PRIORITY_LABELS: Record<RequisitionPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
}

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  active: 'Active',
  rejected: 'Rejected',
  withdrawn: 'Withdrawn',
  hired: 'Hired',
  on_hold: 'On Hold',
}

export const INTERVIEW_STATUS_LABELS: Record<InterviewStatus, string> = {
  scheduled: 'Scheduled',
  confirmed: 'Confirmed',
  completed: 'Completed',
  cancelled: 'Cancelled',
  no_show: 'No Show',
}

export const INTERVIEW_TYPE_LABELS: Record<InterviewType, string> = {
  telephone_screen: 'Telephone Screen',
  recruiter_interview: 'Recruiter Interview',
  hiring_manager_interview: 'Hiring Manager Interview',
  technical_interview: 'Technical Interview',
  panel_interview: 'Panel Interview',
  final_interview: 'Final Interview',
}

export const OFFER_STATUS_LABELS: Record<OfferStatus, string> = {
  draft: 'Draft',
  pending_approval: 'Pending Approval',
  approved: 'Approved',
  sent: 'Sent',
  accepted: 'Accepted',
  declined: 'Declined',
  withdrawn: 'Withdrawn',
}

export const APPROVAL_STATUS_LABELS: Record<ApprovalStatus, string> = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
  cancelled: 'Cancelled',
}

export const RECOMMENDATION_LABELS: Record<RecommendationType, string> = {
  strong_yes: 'Strong Yes',
  yes: 'Yes',
  mixed: 'Mixed',
  no: 'No',
  strong_no: 'Strong No',
}

// ---------------------------------------------------------------------------
// Status colors (Tailwind utility classes: background + text)
// ---------------------------------------------------------------------------

export const REQUISITION_STATUS_COLORS: Record<RequisitionStatus, string> = {
  draft: 'bg-slate-100 text-slate-700',
  pending_approval: 'bg-amber-100 text-amber-800',
  approved: 'bg-blue-100 text-blue-800',
  open: 'bg-emerald-100 text-emerald-800',
  on_hold: 'bg-orange-100 text-orange-800',
  closed: 'bg-slate-200 text-slate-600',
  cancelled: 'bg-red-100 text-red-800',
}

export const APPLICATION_STATUS_COLORS: Record<ApplicationStatus, string> = {
  active: 'bg-blue-100 text-blue-800',
  rejected: 'bg-red-100 text-red-800',
  withdrawn: 'bg-slate-200 text-slate-600',
  hired: 'bg-emerald-100 text-emerald-800',
  on_hold: 'bg-orange-100 text-orange-800',
}

export const INTERVIEW_STATUS_COLORS: Record<InterviewStatus, string> = {
  scheduled: 'bg-blue-100 text-blue-800',
  confirmed: 'bg-emerald-100 text-emerald-800',
  completed: 'bg-slate-200 text-slate-600',
  cancelled: 'bg-red-100 text-red-800',
  no_show: 'bg-red-100 text-red-800',
}

export const OFFER_STATUS_COLORS: Record<OfferStatus, string> = {
  draft: 'bg-slate-100 text-slate-700',
  pending_approval: 'bg-amber-100 text-amber-800',
  approved: 'bg-blue-100 text-blue-800',
  sent: 'bg-purple-100 text-purple-800',
  accepted: 'bg-emerald-100 text-emerald-800',
  declined: 'bg-red-100 text-red-800',
  withdrawn: 'bg-slate-200 text-slate-600',
}

export const APPROVAL_STATUS_COLORS: Record<ApprovalStatus, string> = {
  pending: 'bg-amber-100 text-amber-800',
  approved: 'bg-emerald-100 text-emerald-800',
  rejected: 'bg-red-100 text-red-800',
  cancelled: 'bg-slate-200 text-slate-600',
}

export const RECOMMENDATION_COLORS: Record<RecommendationType, string> = {
  strong_yes: 'bg-emerald-100 text-emerald-800',
  yes: 'bg-lime-100 text-lime-800',
  mixed: 'bg-amber-100 text-amber-800',
  no: 'bg-orange-100 text-orange-800',
  strong_no: 'bg-red-100 text-red-800',
}

export const PRIORITY_COLORS: Record<RequisitionPriority, string> = {
  low: 'bg-slate-100 text-slate-700',
  medium: 'bg-blue-100 text-blue-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800',
}

/** Combined lookup mirroring the shape most components need for badges. */
export const STATUS_COLORS = {
  requisition: REQUISITION_STATUS_COLORS,
  application: APPLICATION_STATUS_COLORS,
  interview: INTERVIEW_STATUS_COLORS,
  offer: OFFER_STATUS_COLORS,
  approval: APPROVAL_STATUS_COLORS,
  recommendation: RECOMMENDATION_COLORS,
  priority: PRIORITY_COLORS,
} as const
