# Twin Planner

A shared family calendar for parents of twins. Both parents see the same calendar and can add to it.

Live app: https://claude.ai/artifact/NQsiQw4pRcLMxmWEQnKTk4

## What it does
- **Upcoming**: the next 90 days, grouped by day. It flags appointments that no one has been assigned to.
- **Month**: a calendar grid. Tap a day to see what's on it.
- **Twins**: a profile for each twin, with upcoming appointments and a history that keeps outcome notes (weight, what the doctor said).
- **Daily log (Premium)**: a locked preview of the planned in-app purchase for feed, nappy and sleep tracking. Not built yet.
- Each entry has who it's for (Twin A, Twin B, family), a type (appointment, key date or reminder), a date and optional time, whether it repeats every year, who's handling it, notes, and what happened afterwards.
- **People**: a "who's around" view, similar to Outlook's scheduling view. Pick a day to see the family calendar and each person's own calendar side by side.
- **Personal calendars**: Add → *My calendar*. Each person chooses whether others see full details or only "Busy".
- **Family or visitor access**: the owner sets each person as *Family · ongoing* or *Visitor until a date*. When the date passes, the visitor stops seeing the calendars and their calendar drops off everyone else's view. The owner can also remove someone.
- **Names** sets the twins' names and the parents' names.

## How sharing works
The app runs as a claude.ai Artifact with a shared database (`db` capability). Entries are stored in the `events` collection and names in `family/settings`. Changes appear live on every open device.
Data layout: `events` (family calendar), `cals/<personId>/events` (personal calendars), `members/<personId>` (name and sharing choice), `access/<personId>` (family/visitor/removed with end date), and `family/settings`.

Access rules: anyone with access reads everything. Each person writes only their own `members` and `cals` entries. Only the owner writes `access`.

To invite someone (partner, sibling, friend): share the artifact from the Share menu and invite them by email as an **Editor**. They appear under People the first time they open it.

Limitation: claude.ai's Share menu decides who can open the page. A visitor's end date hides the calendars inside the app, but it doesn't revoke their claude.ai access. The app reminds the owner to remove them in the Share menu as well. A standalone product would need its own backend to enforce expiry on the server.

If you open `index.html` straight from disk, it runs in preview mode with sample data, and nothing is saved.
