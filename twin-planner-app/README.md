# Twin Planner

A shared family calendar for parents of twins. Both parents see the same calendar and can add to it.

Live app: https://claude.ai/artifact/NQsiQw4pRcLMxmWEQnKTk4

## What it does
- **Upcoming**: the next 90 days, grouped by day. It flags appointments that no one has been assigned to.
- **Month**: a calendar grid. Tap a day to see what's on it.
- **Twins**: a profile for each twin, with upcoming appointments and a history that keeps outcome notes (weight, what the doctor said).
- **Daily log (Premium)**: a locked preview of the planned in-app purchase for feed, nappy and sleep tracking. Not built yet.
- Each entry has who it's for (Twin A, Twin B, family), a type (appointment, key date or reminder), a date and optional time, whether it repeats every year, who's handling it, notes, and what happened afterwards.
- **Names** sets the twins' names and the parents' names.

## How sharing works
The app runs as a claude.ai Artifact with a shared database (`db` capability). Entries are stored in the `events` collection and names in `family/settings`. Changes appear live on every open device.
To let a partner add entries, share the artifact with them from the Share menu and invite them by email as an **Editor**.

If you open `index.html` straight from disk, it runs in preview mode with sample data, and nothing is saved.
