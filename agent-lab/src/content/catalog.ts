/**
 * Starter cards the learner assembles agents, skills and architectures from.
 * Everything the builders and simulators understand is declared here.
 */
export type Permission = 'read' | 'write' | 'execute'

export interface ToolDef {
  id: string
  name: string
  icon: string
  purpose: string
  data: string
  permissions: Permission[]
  sensitive?: boolean
  /** Tools that return authoritative workforce numbers. */
  workforceData?: boolean
  /** Tools that send information outside the system. */
  outbound?: boolean
}

export const TOOLS: ToolDef[] = [
  { id: 'hr-db', name: 'HR Database', icon: 'database', purpose: 'Query the HR system of record for employee records, headcount and terminations.', data: 'Employee records, positions, terminations', permissions: ['read'], workforceData: true },
  { id: 'powerbi', name: 'Power BI Model', icon: 'bar-chart', purpose: 'Query the governed workforce semantic model for approved metrics.', data: 'Aggregated headcount, leavers, attrition measures', permissions: ['read'], workforceData: true },
  { id: 'payroll', name: 'Payroll System', icon: 'wallet', purpose: 'Look up employee-level pay and compensation.', data: 'Salaries, bonuses, bank details (sensitive)', permissions: ['read'], sensitive: true },
  { id: 'email', name: 'Email', icon: 'mail', purpose: 'Send email messages and attachments.', data: 'Outbound messages', permissions: ['write', 'execute'], outbound: true },
  { id: 'web', name: 'Web Search', icon: 'globe', purpose: 'Search the public internet.', data: 'Public web pages', permissions: ['read'] },
  { id: 'calculator', name: 'Calculator', icon: 'calculator', purpose: 'Perform deterministic arithmetic.', data: 'None — numbers you pass in', permissions: ['execute'] },
  { id: 'files', name: 'SharePoint Files', icon: 'folder', purpose: 'Read and save documents in a team site.', data: 'Reports, templates, spreadsheets', permissions: ['read', 'write'] },
]

export interface SkillDef {
  id: string
  name: string
  icon: string
  description: string
  useWhen: string
}

export const SKILLS: SkillDef[] = [
  { id: 'headcount-analysis', name: 'Headcount Analysis', icon: 'users', description: 'Retrieve headcount for a date and break it down by division, department, team or location.', useWhen: 'How many people do we have (in X, by Y, on date Z)?' },
  { id: 'leaver-analysis', name: 'Leaver Analysis', icon: 'door-open', description: 'Count and profile leavers: voluntary vs involuntary, by area, reason or tenure.', useWhen: 'Who left, how many, why and from where?' },
  { id: 'attrition-calc', name: 'Attrition Calculation', icon: 'percent', description: 'Leavers ÷ average headcount × 100 over a period, using the approved definition.', useWhen: 'What is our attrition / turnover rate?' },
  { id: 'exec-summary', name: 'Executive Summary', icon: 'file-text', description: 'Turn analysis into a one-page, plain-English leadership brief.', useWhen: 'Write this up for leadership.' },
]

export interface Card {
  id: string
  label: string
  hint?: string
}

export const ROLES: Card[] = [
  { id: 'hr-analyst', label: 'HR data analyst for Halcyon Group', hint: 'Specific domain + organisation' },
  { id: 'helpful', label: 'A helpful assistant that can do anything', hint: 'Too broad — no clear job' },
  { id: 'hr-everything', label: 'Handles all HR tasks: payroll, hiring, analytics and emails', hint: 'Several jobs in one' },
]

export const GOALS: Card[] = [
  { id: 'answer-metrics', label: 'Answer workforce questions accurately using approved data', hint: 'Clear, testable outcome' },
  { id: 'be-helpful', label: 'Be as helpful as possible', hint: 'Not measurable' },
  { id: 'automate-hr', label: 'Automate HR', hint: 'Far too vague' },
]

export const INSTRUCTIONS: Card[] = [
  { id: 'use-tools', label: 'Always use a data tool for numbers — never estimate', hint: 'Prevents invented figures' },
  { id: 'state-period', label: 'State the date and filters used in every answer' },
  { id: 'ask-clarify', label: 'Ask a clarifying question if the request is ambiguous' },
  { id: 'concise', label: 'Keep answers short and plain-English' },
]

export const GUARDRAILS: Card[] = [
  { id: 'no-sensitive', label: 'Never share salary, pay or personal data', hint: 'Protects sensitive information' },
  { id: 'aggregate-only', label: 'Only report aggregated numbers (groups of 5+)', hint: 'Prevents identifying individuals' },
  { id: 'approval-send', label: 'Require human approval before sending anything', hint: 'Human-in-the-loop for outbound actions' },
  { id: 'read-only', label: 'Read-only: never change records' },
]

export const INPUTS: Card[] = [
  { id: 'question', label: 'Natural-language question' },
  { id: 'date', label: 'As-of date or period' },
  { id: 'filters', label: 'Org filters (division, department, team, location)' },
  { id: 'employee-id', label: 'Employee ID' },
]

export const OUTPUTS: Card[] = [
  { id: 'answer', label: 'Short answer with period & filters' },
  { id: 'table', label: 'Breakdown table' },
  { id: 'chart', label: 'Chart suggestion' },
  { id: 'raw-records', label: 'Raw employee records' },
]

export const byId = <T extends { id: string }>(list: T[], id: string) => list.find((x) => x.id === id)
