import type { LearnMore } from './types'

const HUB = 'https://awesome-copilot.github.com/learning-hub'

export const HUB_HOME = `${HUB}/`

export const LINKS = {
  primitives: { label: 'What are Agents, Skills, and Instructions', href: `${HUB}/what-are-agents-skills-instructions/` },
  customAgents: { label: 'Building Custom Agents', href: `${HUB}/building-custom-agents/` },
  subagents: { label: 'Agents and Subagents', href: `${HUB}/agents-and-subagents/` },
  skills: { label: 'Creating Effective Skills', href: `${HUB}/creating-effective-skills/` },
  instructions: { label: 'Defining Custom Instructions', href: `${HUB}/defining-custom-instructions/` },
  mcp: { label: 'Understanding MCP Servers', href: `${HUB}/understanding-mcp-servers/` },
  hooks: { label: 'Automating with Hooks', href: `${HUB}/automating-with-hooks/` },
  config: { label: 'Copilot Configuration Basics', href: `${HUB}/copilot-configuration-basics/` },
  plugins: { label: 'Installing and Using Plugins', href: `${HUB}/installing-and-using-plugins/` },
  glossary: { label: 'GitHub Copilot Terminology Glossary', href: `${HUB}/github-copilot-terminology-glossary/` },
} satisfies Record<string, LearnMore>

export interface Resource {
  link: LearnMore
  topic: string
  icon: string
  summary: string
  levels: number[]
  relatesTo: string
}

export const RESOURCES: Resource[] = [
  { link: LINKS.primitives, topic: 'Foundations', icon: 'layers', summary: 'The core building blocks side by side — when something should be an agent, a skill or an instruction.', levels: [1, 3], relatesTo: 'Agent Basics · Skills' },
  { link: LINKS.customAgents, topic: 'Custom Agents', icon: 'bot', summary: 'Give an agent a persona, a focused job, a toolset and domain knowledge.', levels: [2], relatesTo: 'Build Your First Agent' },
  { link: LINKS.instructions, topic: 'Instructions', icon: 'scroll-text', summary: 'Persistent rules that shape behaviour automatically, every time.', levels: [1, 2], relatesTo: 'Instructions & guardrails' },
  { link: LINKS.skills, topic: 'Skills', icon: 'sparkles', summary: 'Package repeatable know-how so agents can discover and reuse it.', levels: [3], relatesTo: 'Skills' },
  { link: LINKS.subagents, topic: 'Agents & Subagents', icon: 'network', summary: 'Delegation, context isolation and when a primary agent should hand work off.', levels: [4], relatesTo: 'Multi-Agent Systems' },
  { link: LINKS.mcp, topic: 'MCP', icon: 'plug', summary: 'How Model Context Protocol servers connect agents to tools, data and APIs.', levels: [5], relatesTo: 'Tools & MCP' },
  { link: LINKS.hooks, topic: 'Hooks & Automation', icon: 'webhook', summary: 'Run deterministic checks automatically at points in an agent session — a practical governance lever.', levels: [6, 7], relatesTo: 'Reliability · Governance' },
  { link: LINKS.config, topic: 'Configuration', icon: 'settings', summary: 'Where settings live — user, workspace and repository — and how they combine.', levels: [2], relatesTo: 'Agent setup' },
  { link: LINKS.plugins, topic: 'Plugins', icon: 'package', summary: 'Bundles of agents, skills, hooks and integrations you can install and share.', levels: [3, 5], relatesTo: 'Reuse at scale' },
  { link: LINKS.glossary, topic: 'Glossary', icon: 'book-open', summary: 'Quick definitions for the terms you meet along the way.', levels: [1, 2, 3, 4, 5, 6, 7, 8], relatesTo: 'All levels' },
]

export const GLOSSARY: { term: string; def: string }[] = [
  { term: 'LLM', def: 'A large language model: predicts useful text from text. On its own it cannot look things up or take actions.' },
  { term: 'Agent', def: 'An LLM given a job, rules, tools and a loop so it can plan, act, observe and continue until the goal is met.' },
  { term: 'Instructions', def: 'The standing rules an agent always follows — tone, boundaries, definitions, what never to do.' },
  { term: 'Skill', def: 'Reusable know-how for one type of task: when to use it, the steps, inputs and expected output.' },
  { term: 'Tool', def: 'Something an agent can use to reach the real world: a database, an API, email, a file store, a calculator.' },
  { term: 'Context', def: 'Everything the model can "see" right now: instructions, conversation, retrieved data and tool results.' },
  { term: 'Orchestrator', def: 'A coordinating agent that breaks work into tasks and delegates them to specialists.' },
  { term: 'Subagent', def: 'A specialist launched by another agent to do part of the work in its own isolated context.' },
  { term: 'MCP', def: 'Model Context Protocol: a standard way for agents to discover and use tools and data sources.' },
  { term: 'QA gate', def: 'A validation step — ideally deterministic — that must pass before results move on.' },
  { term: 'Human-in-the-loop', def: 'A person reviews and approves before a consequential action happens.' },
  { term: 'Least privilege', def: 'Give each agent and tool only the access it needs for its job — nothing more.' },
  { term: 'Hallucination', def: 'When a model produces confident output that is not grounded in real data.' },
  { term: 'Observability', def: 'Logs and traces that let you see what an agent did, why, and with what data.' },
]
