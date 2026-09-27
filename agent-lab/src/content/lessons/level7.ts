import type { Level, QuizOption, QuizStep } from '../types'
import { LINKS } from '../resources'

type Decision = 'allow' | 'deny' | 'approve'

function scenario(
  id: string,
  title: string,
  s: NonNullable<QuizStep['scenario']>,
  correct: Decision,
  feedback: Record<Decision, string>,
): QuizStep {
  const opts: { id: Decision; text: string }[] = [
    { id: 'allow', text: 'ALLOW' },
    { id: 'deny', text: 'DENY' },
    { id: 'approve', text: 'REQUIRE HUMAN APPROVAL' },
  ]
  return {
    id,
    kind: 'quiz',
    phase: 'try',
    title,
    variant: 'governance',
    scenario: s,
    question: 'What should the governance layer do?',
    options: opts.map<QuizOption>((o) => ({ id: o.id, text: o.text, correct: o.id === correct, feedback: feedback[o.id] })),
  }
}

export const level7: Level = {
  id: 'l7',
  number: 7,
  pathLabel: 'Governance',
  title: 'AI Governance',
  theme: 'Just because an agent CAN do something doesn’t mean it SHOULD.',
  description: 'Least privilege, sensitive data, human-in-the-loop, auditability and deterministic governance checks — through real decisions.',
  icon: 'shield',
  unlocks: 'AI Governance',
  badgeId: 'governance-guardian',
  concepts: ['Least privilege', 'Sensitive information & PII', 'Human-in-the-loop', 'Approval gates', 'Auditability & logging', 'Access controls', 'Responsible AI', 'Deterministic governance checks'],
  learnMore: [LINKS.hooks],
  lessons: [
    {
      id: 'l7-principles',
      title: 'Can vs should',
      summary: 'Match controls to consequences.',
      minutes: 5,
      steps: [
        {
          id: 'learn',
          kind: 'learn',
          phase: 'learn',
          title: 'Controls proportional to consequences',
          body: [
            'Governance isn’t about blocking agents — it’s about matching each action to the right control. Low-risk actions flow freely and are logged. Consequential ones pause for a human. Some should never be possible at all.',
            'The most dependable controls are deterministic: rules enforced in code (a hook, a policy check, a permission) rather than a request in a prompt. And everything is logged, so any decision can be audited later.',
          ],
          visual: 'governance-gates',
          points: [
            { icon: 'lock', term: 'Least privilege', text: 'Only the access the job needs.' },
            { icon: 'user-check', term: 'Human-in-the-loop', text: 'People approve consequential actions.' },
            { icon: 'scroll-text', term: 'Auditability', text: 'Every action traceable to who, what, why.' },
          ],
          learnMore: LINKS.hooks,
        },
        {
          id: 'deterministic',
          kind: 'quiz',
          phase: 'try',
          title: 'Enforce, don’t ask',
          question: 'Which of these is a deterministic governance check?',
          options: [
            { id: 'a', text: 'An instruction: “Be careful with sensitive data.”', feedback: 'A request to the model. Helpful, but not enforceable.' },
            { id: 'b', text: 'A hook that blocks any outbound email whose attachment contains a salary column', correct: true, feedback: 'Code that runs every time, regardless of what the model thinks. That’s enforceable governance.' },
            { id: 'c', text: 'Asking a second model whether the action is safe', feedback: 'Another opinion — useful as a signal, but not a guarantee.' },
          ],
        },
        {
          id: 'reflect',
          kind: 'reflect',
          phase: 'reflect',
          title: 'Takeaway',
          takeaway: 'Put controls where the consequences are. Enforce the non-negotiables in code; put humans on the judgement calls; log everything.',
          instincts: ['“That should be logged.”', '“That’s a rule for code, not for a prompt.”'],
          learnMore: LINKS.hooks,
        },
      ],
    },
    {
      id: 'l7-desk',
      title: 'The governance desk',
      summary: 'Five agent actions. Allow, deny or require approval?',
      minutes: 7,
      steps: [
        scenario(
          'salary-blast',
          'The salary spreadsheet',
          { actor: 'Reporting Agent', action: 'email a spreadsheet', risk: 'high', details: [
            { label: 'Content', value: 'Employee-level salaries (10,450 rows)' },
            { label: 'Recipients', value: 'all-managers@ (1,200 people)' },
            { label: 'Requested by', value: 'A line manager via chat' },
            { label: 'Reason given', value: '“For budget planning”' },
          ] },
          'deny',
          {
            allow: 'This is a data breach: personal pay data for every employee sent to 1,200 people.',
            deny: 'Correct. Employee-level pay to a mass list should be impossible by policy. Budget planning needs aggregates — offer those instead.',
            approve: 'Tempting, but approval implies a human could say yes. Under time pressure, people click approve. Some actions should simply be impossible.',
          },
        ),
        scenario(
          'weekly-dashboard',
          'The weekly dashboard',
          { actor: 'Reporting Agent', action: 'send the weekly dashboard link', risk: 'low', details: [
            { label: 'Content', value: 'Aggregated headcount & attrition (no individuals)' },
            { label: 'Recipients', value: 'The 12-person leadership list (pre-approved)' },
            { label: 'Frequency', value: 'Every Monday, same format' },
            { label: 'Data access', value: 'Recipients already have dashboard access' },
          ] },
          'allow',
          {
            allow: 'Right. Routine, aggregate, pre-approved audience with existing access. Allow it — and log it. Adding approval here trains people to rubber-stamp.',
            deny: 'Over-cautious. Blocking routine, safe work pushes people to work around the system.',
            approve: 'A weekly approval for an identical, low-risk send becomes a rubber stamp — which weakens approvals where they matter.',
          },
        ),
        scenario(
          'intranet-report',
          'Company-wide publication',
          { actor: 'Reporting Agent', action: 'publish an attrition report to the company intranet', risk: 'medium', details: [
            { label: 'Content', value: 'Attrition by department with commentary on causes' },
            { label: 'Audience', value: 'All 10,450 employees' },
            { label: 'QA status', value: 'Numbers validated ✓' },
            { label: 'Sensitivity', value: 'Interpretation could affect morale' },
          ] },
          'approve',
          {
            allow: 'The numbers are validated, but the narrative isn’t. High visibility plus interpretation calls for a human eye.',
            deny: 'No need to block it — it’s aggregate and validated. It just needs a person to own what it says.',
            approve: 'Yes. Validated data, but a company-wide message with commentary needs a named person to approve the framing.',
          },
        ),
        scenario(
          'bulk-update',
          'The bulk update',
          { actor: 'HR Ops Agent', action: 'update department codes in the HR system', risk: 'medium', details: [
            { label: 'Change', value: '340 employees moved to new department codes' },
            { label: 'Source', value: 'Restructure spreadsheet from the HR business partner' },
            { label: 'Permission', value: 'WRITE to system of record' },
            { label: 'Reversible', value: 'Yes, but affects payroll cost centres' },
          ] },
          'approve',
          {
            allow: 'A bulk WRITE to the system of record that ripples into payroll? One bad row affects real pay. Get a sign-off.',
            deny: 'This is legitimate work the agent can speed up enormously. Don’t block it — put a checkpoint on it.',
            approve: 'Right. Show the reviewer a diff of all 340 changes; the agent executes only after approval — and logs every change.',
          },
        ),
        scenario(
          'flight-risk',
          'The “flight risk” list',
          { actor: 'Analysis Agent', action: 'send managers a list of named employees predicted to resign', risk: 'high', details: [
            { label: 'Content', value: 'Names + model-predicted “flight risk” scores' },
            { label: 'Recipients', value: 'Each employee’s line manager' },
            { label: 'Basis', value: 'Model trained on tenure, absence and pay data' },
            { label: 'Employees informed?', value: 'No' },
          ] },
          'deny',
          {
            allow: 'Automated profiling of named individuals, shared without their knowledge, can lead to unfair treatment. That’s a serious responsible-AI and legal risk.',
            deny: 'Correct — and not obvious. Profiling named people with a model and sharing it without their knowledge is a line to hold. Share aggregate risk patterns by team instead.',
            approve: 'A human approving doesn’t fix the underlying problem: individuals profiled by a model without transparency. The safer design shares aggregate insight.',
          },
        ),
        {
          id: 'reflect',
          kind: 'reflect',
          phase: 'reflect',
          title: 'Takeaway',
          takeaway: 'Allow the routine, approve the consequential, deny the unacceptable — and log all three. Over-approving is a risk too: it trains people to click yes.',
          instincts: ['“That action requires human approval.”', '“That should never be possible — enforce it.”', '“That should be logged.”'],
        },
      ],
    },
  ],
}
