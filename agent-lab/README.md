# Agent Lab

**Learn to build AI systems by building them.**

Agent Lab is an interactive web app that teaches agent architecture — agents, instructions, skills, tools, MCP, orchestration, reliability and governance — through hands-on challenges instead of passive tutorials. It is aimed at technically curious business professionals, not software engineers.

Learning loop: **LEARN → PLAY → BUILD → BREAK → FIX → UNLOCK**

## Run it

```bash
cd agent-lab
npm install
npm run dev        # http://localhost:5173
npm test           # engine + content integrity tests
npm run build      # static build in dist/ (hash routing, works on any static host)
```

Progress is saved in the browser (localStorage). No account or backend is needed.
Tip: **Settings → Preview all levels** unlocks every level so you can explore.

## What's inside

| Area | What the learner does |
| --- | --- |
| **Home dashboard** | Continue mission, current level, XP, missions, agents, skills, streak, map, badges |
| **Learning path** | 8 levels, locked until the previous one is complete |
| **L1 Agent Basics** | LLM vs agent, the agent loop, building blocks; split a mega-prompt into Agent / Instructions / Skills / Tools |
| **L2 First Agent** | Agent Builder (role, goal, instructions, tools, skills, inputs, outputs, guardrails), then stress-test it with 3 requests — one of them is dangerous |
| **L3 Skills** | WHO / HOW / WHAT / RULES; route questions to skills; build 3 reusable skills with validation |
| **L4 Multi-Agent** | Parallel vs sequential; wire an orchestrator to specialists on a canvas, then animate it |
| **L5 Tools & MCP** | Pick the right tool; MCP as the standard socket; READ / WRITE / EXECUTE and least privilege |
| **L6 Reliability** | Validate, retry, fall back, escalate, observe; diagnose a wrong headcount and repair the workflow with a QA gate |
| **L7 Governance** | ALLOW / DENY / REQUIRE APPROVAL decisions on realistic scenarios |
| **L8 Final build** | Blank canvas; the design is scored on six principles and must survive an injected fault |
| **Agent Playground** | Canvas with Orchestrator, Agent, Skill, Tool, QA Gate, Human Approval and Output nodes; inspector panel; **Run simulation**, fault injection, interactive approval, architecture review; templates and saved designs |
| **Achievements / Resources / Profile / Settings** | Badges and ranks, GitHub Copilot Learning Hub links and a glossary, built agents/skills/designs, theme, reduced motion, export/import/reset |

All data is fictional (*Halcyon Group*, 10,450 employees, organised as Division → Department → Team → Location).

## Architecture

```
src/
  content/            # WHAT is taught: pure data, no React
    lessons/levelN.ts # levels → lessons → typed steps
    lessons/checks.ts # reusable architecture checks for challenges
    catalog.ts        # tools, skills, instruction/guardrail cards
    hrData.ts         # fictional workforce dataset + metric helpers
    skillSpecs.ts     # Skill Builder validation specs
    achievements.ts   # badges (progress functions)
    xp.ts, resources.ts, templates.ts, types.ts, course.ts
  engine/             # HOW things behave: pure, unit-tested logic
    graph.ts          # framework-agnostic architecture graph
    simulation.ts     # graph → explainable execution timeline
    evaluate.ts       # principle-based architecture review (6 dimensions)
    agentRunner.ts    # single-agent simulator for Level 2
    nodeFactory.ts, palette.ts
  state/              # learner progress
    progress.ts       # zustand store: XP, lessons, badges, agents, skills, designs, streak
    storage.ts        # ProgressRepository interface (localStorage now; HTTP example included)
    ui.ts             # toasts & celebrations
  components/
    steps/            # one component per step kind + registry.tsx
    playground/       # React Flow canvas, inspector, simulator UI, review
    learning/         # lesson player, level map, visual diagrams
    layout/, ui/
  pages/              # route screens
```

### Adding content

- **A lesson:** add a `Lesson` to a level in `src/content/lessons/levelN.ts`. Steps are typed (`learn`, `cards`, `quiz`, `sort`, `sequence`, `match`, `break-fix`, `architecture`, `reflect`, …) and pick up XP, missions and progress automatically.
- **A new interaction type:** add a variant to `Step` in `content/types.ts`, write a component in `components/steps/`, and register it in `components/steps/registry.tsx`.
- **An architecture challenge:** give an `architecture` step a start graph, a palette, and either `checks` (pass/fail with hints) or `grading: 'score'`.

### Adding a backend

`state/storage.ts` defines `ProgressRepository`. Swap `localRepository` for an implementation backed by your API (a `createHttpRepository` example is included). The store's persisted shape is `ProgressData` in `state/progress.ts`.

## Learn more

Concepts link to the [GitHub Copilot Learning Hub](https://awesome-copilot.github.com/learning-hub/). Agent Lab summarises them in its own words and points there for depth.
