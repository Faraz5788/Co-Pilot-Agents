import type { Level } from '../types'
import { LINKS } from '../resources'

const TOOL_CHOICES = [
  { id: 'calculator', label: 'Calculator', icon: 'calculator', desc: 'Deterministic arithmetic' },
  { id: 'powerbi', label: 'Power BI', icon: 'bar-chart', desc: 'Governed workforce metrics' },
  { id: 'email', label: 'Email', icon: 'mail', desc: 'Send messages' },
  { id: 'web', label: 'Web Search', icon: 'globe', desc: 'Public internet' },
  { id: 'hr-db', label: 'HR Database', icon: 'database', desc: 'Live employee records' },
]

const PERMS = [
  { id: 'read', label: 'READ', icon: 'eye', desc: 'Look at data, change nothing' },
  { id: 'write', label: 'WRITE', icon: 'pencil', desc: 'Create or change stored data' },
  { id: 'execute', label: 'EXECUTE', icon: 'zap', desc: 'Trigger an action or process' },
]

export const level5: Level = {
  id: 'l5',
  number: 5,
  pathLabel: 'Tools + MCP',
  title: 'Tools & MCP',
  theme: 'Agents need access to the real world.',
  description: 'Choose the right tool for each job, understand MCP as the standard socket for tools, and grant only the permissions an agent needs.',
  icon: 'plug',
  unlocks: 'Tool Master',
  badgeId: 'tool-master',
  concepts: ['Tools', 'APIs', 'Databases', 'Files', 'External systems', 'MCP', 'Permissions'],
  learnMore: [LINKS.mcp],
  lessons: [
    {
      id: 'l5-tools',
      title: 'The right equipment',
      summary: 'Match every request to the tool that should handle it.',
      minutes: 5,
      steps: [
        {
          id: 'learn',
          kind: 'learn',
          phase: 'learn',
          title: 'Tools are how agents touch reality',
          body: [
            'A model on its own only knows what it learned in training. Tools give it live access: a database for records, a BI model for official metrics, a file store for documents, an API for another system, email to communicate.',
            'Choosing the right tool is a design decision. The wrong one gives answers that look plausible but come from the wrong source.',
          ],
          points: [
            { icon: 'database', term: 'Systems of record', text: 'Live, detailed, raw data.' },
            { icon: 'bar-chart', term: 'Governed models', text: 'Approved definitions for official numbers.' },
            { icon: 'calculator', term: 'Deterministic tools', text: 'Exact answers models get wrong.' },
          ],
        },
        {
          id: 'choose',
          kind: 'match',
          phase: 'try',
          title: 'Pick the tool',
          mission: {
            mission: 'Five requests, five possible tools.',
            objective: 'Choose the tool that should handle each request.',
            components: ['Calculator', 'Power BI', 'Email', 'Web Search', 'HR Database'],
            success: 'Every request routed to the right tool.',
          },
          prompt: 'Which tool should the agent use?',
          choices: TOOL_CHOICES,
          rounds: [
            { id: 'r1', question: 'Find the latest official headcount for the board pack.', answer: 'powerbi', why: 'Official figures should come from the governed model, where “headcount” has one approved definition.', wrong: { 'hr-db': 'The HR database is live but raw. Counting rows yourself risks a different definition from the official metric (contractors? people on notice?).', web: 'Never use the public web for internal numbers.' } },
            { id: 'r2', question: 'Is employee #48213 still active today?', answer: 'hr-db', why: 'A single, live record check belongs to the system of record.', wrong: { powerbi: 'The BI model holds aggregates refreshed on a schedule — not individual live records.' } },
            { id: 'r3', question: 'What’s 1,474 ÷ 10,401 × 100?', answer: 'calculator', why: 'Language models are unreliable at arithmetic. A deterministic tool is exact every time.' },
            { id: 'r4', question: 'What’s typical attrition for UK contact centres?', answer: 'web', why: 'External benchmarks live outside your systems. Cite the source and treat it as unverified.' },
            { id: 'r5', question: 'Send the approved report to the leadership team.', answer: 'email', why: 'An outbound action — and a good candidate for a human approval step before it runs.' },
          ],
        },
        {
          id: 'reflect',
          kind: 'reflect',
          phase: 'reflect',
          title: 'Takeaway',
          takeaway: 'The source matters as much as the answer. Official numbers come from governed sources; exact maths from deterministic tools; the web only for external context.',
          instincts: ['“Where should this number come from?”', '“That should be a deterministic tool, not the model.”'],
        },
      ],
    },
    {
      id: 'l5-mcp',
      title: 'MCP: the universal socket',
      summary: 'How agents discover and use tools in a standard way.',
      minutes: 5,
      steps: [
        {
          id: 'learn',
          kind: 'learn',
          phase: 'learn',
          title: 'Worker, equipment, socket',
          body: [
            'Think of an agent as a worker, and tools as equipment. Without a standard, every piece of equipment needs its own custom adapter for every worker.',
            'The Model Context Protocol (MCP) is that standard. An MCP server wraps a system — say Power BI — and describes what it offers: each tool’s name, what it does and what inputs it needs. Any MCP-compatible agent can then discover the equipment and use it.',
          ],
          visual: 'mcp',
          learnMore: LINKS.mcp,
        },
        {
          id: 'cards',
          kind: 'cards',
          phase: 'see',
          title: 'Inside MCP',
          intro: 'Four ideas cover most of what you need.',
          cards: [
            { icon: 'package', term: 'MCP server', text: 'Wraps a system and exposes its tools.', example: 'powerbi-workforce server' },
            { icon: 'file-text', term: 'Tool description', text: 'Plain-language “what this does” the agent reads to decide.', example: '“Get headcount for a date and org filters.”' },
            { icon: 'list-checks', term: 'Input schema', text: 'The exact parameters the tool accepts.', example: 'asOfDate, division, department, location' },
            { icon: 'bot', term: 'Client / host', text: 'The agent environment that connects to servers and calls tools.', example: 'Copilot in VS Code or the CLI' },
          ],
        },
        {
          id: 'reuse',
          kind: 'quiz',
          phase: 'try',
          title: 'Build once, use everywhere',
          question: 'Your team builds a Power BI MCP server. Which agents can use it?',
          options: [
            { id: 'a', text: 'Only the agent it was built for', feedback: 'That’s the pre-MCP world of one-off integrations.' },
            { id: 'b', text: 'Any MCP-compatible agent that has been granted access', correct: true, feedback: 'Standard socket, many workers. Access is still controlled — MCP doesn’t mean “open to everyone”.' },
            { id: 'c', text: 'Every agent in the company automatically', feedback: 'Compatibility isn’t permission. Access still has to be granted deliberately.' },
          ],
        },
        {
          id: 'wrong-tool',
          kind: 'quiz',
          phase: 'try',
          title: 'Wrong tool, again',
          question: 'An agent keeps calling “get_leavers” when asked for headcount. What’s the most likely fix?',
          options: [
            { id: 'a', text: 'Improve the tools’ names and descriptions in the MCP server', correct: true, feedback: 'Agents choose tools from their descriptions — just like skills. Vague descriptions cause wrong picks.' },
            { id: 'b', text: 'Switch to a bigger model', feedback: 'A better model may guess better, but the root cause is ambiguous tool descriptions.' },
            { id: 'c', text: 'Remove the leavers tool', feedback: 'Then leaver questions break. Fix how the tools describe themselves.' },
          ],
        },
        {
          id: 'reflect',
          kind: 'reflect',
          phase: 'reflect',
          title: 'Takeaway',
          takeaway: 'MCP standardises how agents discover and call tools. Good tool descriptions matter as much as good skill descriptions — and access is still yours to grant.',
          instincts: ['“Would an agent pick this tool from its description?”'],
          learnMore: LINKS.mcp,
        },
      ],
    },
    {
      id: 'l5-permissions',
      title: 'Permissions',
      summary: 'READ, WRITE, EXECUTE — and least privilege.',
      minutes: 5,
      steps: [
        {
          id: 'learn',
          kind: 'learn',
          phase: 'learn',
          title: 'Three kinds of access',
          body: [
            'Every tool connection carries permissions. READ lets an agent look. WRITE lets it create or change stored data. EXECUTE lets it trigger actions — send, run, refresh, publish.',
            'Least privilege means granting only what the job needs. An analyst agent that only ever reads should never be able to write, however the prompt is worded.',
          ],
          visual: 'permissions',
        },
        {
          id: 'perms',
          kind: 'match',
          phase: 'try',
          title: 'Name the permission',
          prompt: 'Which permission does this action need?',
          choices: PERMS,
          rounds: [
            { id: 'p1', question: 'Look up headcount in Power BI', answer: 'read', why: 'Viewing data changes nothing.' },
            { id: 'p2', question: 'Save the report to SharePoint', answer: 'write', why: 'Creates a stored file.' },
            { id: 'p3', question: 'Update 12 employees’ department codes', answer: 'write', why: 'Changes records in the system of record — high impact.' },
            { id: 'p4', question: 'Trigger a Power Automate approval flow', answer: 'execute', why: 'Starts a process in another system.' },
            { id: 'p5', question: 'Send an email to the leadership team', answer: 'execute', why: 'An outbound action that can’t be taken back.', wrong: { write: 'It doesn’t change stored data — it triggers an action that leaves the building.' } },
          ],
        },
        {
          id: 'least',
          kind: 'quiz',
          phase: 'try',
          title: 'Least privilege',
          question: 'The Headcount Agent needs Power BI. Which permissions should it get?',
          options: [
            { id: 'a', text: 'READ only', correct: true, feedback: 'It answers questions. It never needs to change or trigger anything.' },
            { id: 'b', text: 'READ + WRITE, in case it needs to fix data', feedback: 'Agents shouldn’t “fix” source data. Report the problem; let owners correct it.' },
            { id: 'c', text: 'All three, to avoid blocking it', feedback: 'Convenient until it isn’t. Every extra permission is extra blast radius.' },
          ],
        },
        {
          id: 'reflect',
          kind: 'reflect',
          phase: 'reflect',
          title: 'Takeaway',
          takeaway: 'Permissions are part of the design, not an afterthought. Default to READ; add WRITE or EXECUTE only with a reason — and usually a human in front of them.',
          instincts: ['“That tool should only have read permission.”'],
          learnMore: LINKS.mcp,
        },
      ],
    },
  ],
}
