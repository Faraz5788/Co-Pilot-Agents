# Circle Planner

A shared planner for any family or group: a household, parents and grandparents, flatmates, or a friend staying for a month. Everyone sees the same group calendar, keeps a personal calendar, and can see who's around on a given day.

Live app: https://claude.ai/artifact/NQsiQw4pRcLMxmWEQnKTk4

## Features
- **Group calendar**: shared entries. Each entry has who it's for, a type (appointment, key date or reminder), a date and optional time, whether it repeats yearly, who's handling it, notes, and what happened afterwards.
- **Profiles**: the people the group plans for who don't use the app themselves (kids, grandparents, pets). You can add any number, each with a colour. Each profile has a page showing what's coming up and a history with outcome notes.
- **Who's handling it**: choose from the people who actually share the planner, or "Everyone". Appointments with no one assigned are flagged.
- **Personal calendars**: Add → *My calendar*. Each person chooses whether others see full details or "Busy" only.
- **People**: a "who's around" view, similar to Outlook's scheduling view. Pick a day to see every calendar side by side.
- **Ongoing or temporary sharing**: the owner sets each person as *Family · ongoing* or *Visitor until a date*. When the date passes, the visitor stops seeing the calendars. The owner can also remove people.
- **Care log (Premium)**: a locked preview of the planned in-app purchase for feed, nappy, sleep and medicine tracking. Not built yet.
- **Group** settings: the group's name and its profiles.

## How it's built
A single-page claude.ai Artifact using the shared database (`db`) and `user` capabilities.

Data: `events` (group calendar), `cals/<personId>/events` (personal calendars), `members/<personId>` (name and sharing choice), `access/<personId>` (family/visitor/removed with end date), and `family/settings` (group name and profiles; older saves with fixed `kids` names are read as two profiles).

Access rules: anyone with access reads everything. Each person writes only their own `members` and `cals` entries. Only the owner writes `access`.

## Inviting people
Share the artifact from the Share menu and invite them by email as an **Editor**. They appear under People the first time they open it.

Limitation: claude.ai's Share menu decides who can open the page. A visitor's end date hides the calendars inside the app, but it doesn't revoke their claude.ai access, so the app reminds the owner to remove them in Share as well. A standalone product would need its own backend to enforce expiry on the server.

If you open `index.html` straight from disk, it runs in preview mode with sample data, and nothing is saved.
