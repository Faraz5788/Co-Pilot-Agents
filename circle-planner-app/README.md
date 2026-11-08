# Circle Planner

A shared planner for any family or group: a household, parents and grandparents, flatmates, or a friend staying for a month. Everyone sees the same group calendar, keeps a personal calendar, and can see who's around on a given day.

Live app: https://claude.ai/artifact/NQsiQw4pRcLMxmWEQnKTk4

## Features
- **One shared calendar**: each entry has who it's for, a type (event, key date or reminder), a date and optional time, whether it repeats yearly, notes, and what happened afterwards.
- **Who is it for**: lists everyone, both the people who use the app and the profiles, plus "Whole group". To add your own plans, pick yourself.
- **Shared lists**: a list can stand on its own (packing, party prep) or be attached to an event. Tick "Add a shared list" when you add one, for example "Food shop, Sunday 18:00". Everyone with access can add items, tick them off and remove them, and each item shows who added it and who got it. Each item is its own document, so people adding at the same time don't overwrite each other.
- **Profiles**: people the group plans for who don't use the app themselves (young kids, grandparents, pets). You can add any number, each with a colour. Each profile has a page showing what's coming up and a history with outcome notes.
- **Someone needs to sort it**: optional. Tick it when someone has to take or drive a person, or deal with something, then pick who's doing it. Only these entries get a "Needs someone" flag.
- **Private**: when an entry is only for you, you can mark it private. Others see "Busy".
- **People**: a "who's around" view, similar to Outlook's scheduling view. Pick a day to see every calendar side by side.
- **Ongoing or temporary sharing**: the owner sets each person as *Family · ongoing* or *Visitor until a date*. When the date passes, the visitor stops seeing the calendars. The owner can also remove people.
- **Care log (Premium)**: a locked preview of the planned in-app purchase for feed, nappy, sleep and medicine tracking. Not built yet.
- **Group** settings: the group's name and its profiles.

## How it's built
A single-page claude.ai Artifact using the shared database (`db`) and `user` capabilities.

Data: `events` (group calendar), `cals/<personId>/events` (personal calendars), `members/<personId>` (name and sharing choice), `access/<personId>` (family/visitor/removed with end date), and `lists/<listId>` (title and linked event) with `lists/<listId>/items/<itemId>` (text, done, added by, got by), and `family/settings` (group name and profiles; older saves with fixed `kids` names are read as two profiles).

Access rules: anyone with access reads everything. Each person writes only their own `members` and `cals` entries. Only the owner writes `access`.

## Inviting people
Share the artifact from the Share menu and invite them by email as an **Editor**. They appear under People the first time they open it.

Limitation: claude.ai's Share menu decides who can open the page. A visitor's end date hides the calendars inside the app, but it doesn't revoke their claude.ai access, so the app reminds the owner to remove them in Share as well. A standalone product would need its own backend to enforce expiry on the server.

If you open `index.html` straight from disk, it runs in preview mode with sample data, and nothing is saved.
