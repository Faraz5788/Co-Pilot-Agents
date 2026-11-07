# Work Allocation – fee earner matching

A one-file web app (`index.html`). When a new piece of work comes in, it checks every fee earner's **skills**, **absence** and **utilisation** over the work period and ranks who is best placed to take it.

Open `index.html` in Edge or Chrome. You don't need to install anything or run a server. It starts with fictional demo data. You can clear that under **Data & settings**.

## Tabs

| Tab | What it's for |
|---|---|
| **Allocate work** | Enter the matter, dates, estimated hours, how many people you need, which grades can do it and which skills (with minimum level) it needs. You get a ranked list, a plain-English reason for each person, and a list of who was left out and why. **Allocate** books the hours to that person. |
| **Fee earners** | Grade, practice group, office, daily chargeable target, current utilisation and skills. |
| **Absence** | Annual leave, sickness, training, secondment, parental leave. |
| **My skills** | Fee earners choose their own name and keep their skills up to date (1 Working knowledge, 2 Experienced, 3 Expert). |
| **Allocations** | Work assigned through the app. These hours count against a person's capacity in later searches. |
| **Data & settings** | Scoring weights, utilisation ceiling, bank holidays, CSV imports, and JSON backup and restore. |

## How the matching works

For each fee earner, over the work's start and end dates:

1. **Days available**: working days (Mon–Fri, minus bank holidays) when they are not absent.
2. **Free capacity**: `available days × daily chargeable target × (ceiling − utilisation%)`, minus hours already allocated in the app that overlap the period. This is compared with the hours each person needs to do.
3. **Skills match**: for each required skill, the level they hold ÷ the level required, capped at 100%. A missing skill counts as 0.
4. **Score** = weighted average of the three. The default weights are Skills 45, Capacity 35, Availability 20, and you can change them.

**Excluded** (shown under "not suggested"): wrong grade, wrong practice group (if you chose one), absent for the whole period, no spare capacity, or missing a required skill. You can switch the missing-skill rule to "score lower" instead of excluding.

## Getting real data in

Under **Data & settings → Import**, each data type has a template you can download:

- **Fee earners**: `name, email, grade, team, office, daily_target_hours, utilisation, skills`. Write skills like `M&A:3; Due Diligence:2`.
- **Utilisation**: `name, utilisation`. This is the regular refresh, e.g. a weekly export from your time-recording system or Power BI.
- **Absence**: `name, from, to, type`. Dates can be YYYY-MM-DD or DD/MM/YYYY.

People are matched by email if it's in the file, otherwise by name.

## Limitations of this version

- Data is stored in the **browser it's used in** (localStorage). It is not shared between people. Use **Export backup / Restore backup** to move it between machines.
- There is no login. **My skills** trusts whoever picks a name.
- Utilisation is a single current figure per person, not a forecast.

The natural next step for firm-wide use is to keep the same logic and move the data to SharePoint lists or Dataverse, as a Power App, so that everyone shares one dataset, logs in with Microsoft 365, and gets utilisation and absence fed automatically from Power BI or the HR system.
