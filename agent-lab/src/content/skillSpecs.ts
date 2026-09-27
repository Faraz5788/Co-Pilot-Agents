/** Validation specs for the Level 3 Skill Builder. */
export interface ChoiceOpt { id: string; text: string; ok?: boolean; why: string }
export interface ChipOpt { id: string; text: string; role: 'required' | 'optional' | 'forbidden'; why?: string }
export interface StepOpt { id: string; text: string; distractor?: string }

export interface SkillSpec {
  skillId: string
  name: string
  icon: string
  useWhen: ChoiceOpt[]
  inputs: ChipOpt[]
  steps: StepOpt[]
  /** Correct order of step ids (distractors excluded). */
  order: string[]
  output: ChoiceOpt[]
}

export const SKILL_SPECS: SkillSpec[] = [
  {
    skillId: 'headcount-analysis',
    name: 'Headcount Analysis',
    icon: 'users',
    useWhen: [
      { id: 'a', text: 'Questions about how many people work in an area on a date, optionally broken down', ok: true, why: 'Specific and recognisable — an agent can tell exactly when to load it.' },
      { id: 'b', text: 'Any HR question', why: 'Too broad: the agent would load this for every request, including leavers and pay.' },
      { id: 'c', text: 'Questions about people leaving the organisation', why: 'That’s Leaver Analysis territory.' },
    ],
    inputs: [
      { id: 'date', text: 'As-of date', role: 'required' },
      { id: 'filters', text: 'Org filters', role: 'required' },
      { id: 'dimension', text: 'Breakdown dimension', role: 'optional' },
      { id: 'names', text: 'Employee names', role: 'forbidden', why: 'Headcount never needs names — requesting them invites personal data into the context.' },
      { id: 'salary', text: 'Salary band', role: 'forbidden', why: 'Pay data is sensitive and irrelevant to headcount.' },
    ],
    steps: [
      { id: 'resolve', text: 'Resolve the date to month-end' },
      { id: 'query', text: 'Query headcount from the data tool with filters' },
      { id: 'group', text: 'Group by the requested dimension' },
      { id: 'sort', text: 'Sort largest first' },
      { id: 'estimate', text: 'Estimate if the data is missing', distractor: 'Never estimate — if data is missing, say so. Invented numbers destroy trust.' },
      { id: 'email', text: 'Email the result to the requester', distractor: 'Sending is an action, not part of the analysis method. Keep skills focused.' },
    ],
    order: ['resolve', 'query', 'group', 'sort'],
    output: [
      { id: 'a', text: 'Headcount with as-of date, filters and optional breakdown table', ok: true, why: 'Verifiable and reusable by other agents.' },
      { id: 'b', text: 'A list of employees in the area', why: 'Exposes personal data when a count was asked for.' },
      { id: 'c', text: 'A chart image only', why: 'Other agents can’t reuse numbers locked inside an image.' },
    ],
  },
  {
    skillId: 'leaver-analysis',
    name: 'Leaver Analysis',
    icon: 'door-open',
    useWhen: [
      { id: 'a', text: 'Questions about who left, how many, why, or voluntary vs involuntary', ok: true, why: 'Covers the counting and profiling of leavers — and says so clearly.' },
      { id: 'b', text: 'Questions asking for an attrition or turnover rate', why: 'Rates belong to Attrition Calculation (which may use this skill’s output).' },
      { id: 'c', text: 'Questions about new joiners', why: 'Joiners are a different flow with different data.' },
    ],
    inputs: [
      { id: 'period', text: 'Period', role: 'required' },
      { id: 'filters', text: 'Org filters', role: 'required' },
      { id: 'type', text: 'Leaver type', role: 'optional' },
      { id: 'names', text: 'Employee names', role: 'forbidden', why: 'Leaver analysis is about patterns, not individuals.' },
      { id: 'exit', text: 'Exit interview transcripts', role: 'forbidden', why: 'Highly sensitive free text. Use coded leaving reasons instead.' },
    ],
    steps: [
      { id: 'period', text: 'Confirm the period' },
      { id: 'query', text: 'Query terminations for the period and filters' },
      { id: 'split', text: 'Split voluntary vs involuntary' },
      { id: 'suppress', text: 'Suppress groups smaller than 5' },
      { id: 'names', text: 'Include names for context', distractor: 'Names add risk and no analytical value.' },
      { id: 'rate', text: 'Calculate the attrition rate', distractor: 'That’s another skill’s job. Keep each skill single-purpose.' },
    ],
    order: ['period', 'query', 'split', 'suppress'],
    output: [
      { id: 'a', text: 'Leaver counts by type and area (groups of 5+)', ok: true, why: 'Useful, safe and ready for the Attrition skill to consume.' },
      { id: 'b', text: 'A spreadsheet of every leaver', why: 'Employee-level data should not leave the system of record.' },
      { id: 'c', text: 'A narrative paragraph only', why: 'Downstream skills need structured numbers.' },
    ],
  },
  {
    skillId: 'attrition-calc',
    name: 'Attrition Calculation',
    icon: 'percent',
    useWhen: [
      { id: 'a', text: 'Questions asking for a rate: attrition, turnover or retention', ok: true, why: 'Names the concept and its synonyms so it gets picked reliably.' },
      { id: 'b', text: 'Questions about how many people left', why: 'That’s a count — Leaver Analysis.' },
      { id: 'c', text: 'Any question containing a percentage', why: 'Too loose: “What % of staff are in London?” isn’t attrition.' },
    ],
    inputs: [
      { id: 'period', text: 'Period', role: 'required' },
      { id: 'type', text: 'Attrition type (voluntary / total)', role: 'required' },
      { id: 'filters', text: 'Org filters', role: 'optional' },
      { id: 'closing', text: 'Closing headcount only', role: 'forbidden', why: 'Using closing headcount alone biases the rate when the team grows or shrinks.' },
    ],
    steps: [
      { id: 'leavers', text: 'Get leavers (via Leaver Analysis)' },
      { id: 'hc', text: 'Get start and end headcount (via Headcount Analysis)' },
      { id: 'avg', text: 'Average headcount = (start + end) ÷ 2' },
      { id: 'rate', text: 'Rate = leavers ÷ average headcount × 100' },
      { id: 'report', text: 'Report with definition and period' },
      { id: 'closing', text: 'Divide by closing headcount', distractor: 'Not the approved definition — this is exactly the drift you fixed earlier.' },
    ],
    order: ['leavers', 'hc', 'avg', 'rate', 'report'],
    output: [
      { id: 'a', text: 'Rate % with numerator, denominator, definition and period', ok: true, why: 'Shows its working — so a QA step (or a human) can verify it.' },
      { id: 'b', text: 'Just the percentage', why: 'Without the working, nobody can validate it.' },
      { id: 'c', text: 'A RAG status (red / amber / green)', why: 'Judgement belongs to reporting; the skill should return the facts.' },
    ],
  },
]
