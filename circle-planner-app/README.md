# Circle Planner

A shared planner for any group: parents with kids, people caring for a relative, couples, friends, housemates and students. Everyone sees the same group calendar, keeps a personal calendar, and can see who's around on a given day.

Live app: https://claude.ai/artifact/NQsiQw4pRcLMxmWEQnKTk4

## Getting started (group types)
The first time the owner opens the planner, they choose what it's for. The choice sets which pages show and how they're worded:

| Type | Pages beyond Home / Upcoming / Month / People |
|---|---|
| Parents with kids | Dates, Lists, Trips, Chat, Kids, Care log |
| Caring for someone | Dates, Lists, Chat, Cared for, Care log |
| Couple | Dates, Lists, Trips, Chat |
| Friends | Trips, Dates, Lists, Chat |
| Students / study group | Deadlines, Lists, Chat |
| Housemates | Lists, Dates, Chat |
| Something else | Dates, Lists, Trips, Chat, Profiles |

The owner can change the type later under **Group**. To show the setup screen again, add `#setup` to the page address.

## Features
- **Key dates / Deadlines**: birthdays, anniversaries and one-off dates with a countdown. A big "next up" card is followed by the next 30 days, later this year and further ahead. Birthdays show the age they'll turn, and anniversaries show which one it is.
- **Repeats**: entries can repeat every week (classes, routines, football) or every year.
- **Import a calendar (.ics)**: under **Group**, add a timetable or calendar export from Google, Outlook, Apple or a university. Weekly and yearly repeats are kept, and past one-off entries are skipped (up to 200 entries per import).
- **Trips**: Wish list, Planned and Been tabs. Everyone can tap "I want to go", and the wish list sorts by votes. Each trip has dates with a countdown, who's going, notes, and an optional packing list (a shared list linked to the trip). The next planned trip shows on Home.
- **Group chat**: one chat for everyone with access. It shows an unread badge on the tab and a note on Home, and you can delete your own messages. It loads the latest 300 messages.
- **Home dashboard**: tiles for things today, the next 7 days, entries that need someone, and lists to finish. Below them: today's and tomorrow's plans, entries needing someone, every list with its completion percentage, key dates in the next 60 days, and (for the owner) visits that are ending or have ended.
- **One shared calendar**: each entry has who it's for, a type (event, key date or reminder), a date and optional time, whether it repeats yearly, notes, and what happened afterwards.
- **Who is it for**: lists everyone, both the people who use the app and the profiles, plus "Whole group". To add your own plans, pick yourself.
- **Shared lists**: a list can stand on its own (packing, party prep) or be attached to an event. Link a list in either direction: pick an existing list (or "Create a new list") in an entry's *Shared list* menu, or open a list and use *Link to a calendar entry*, where you can also make a new entry for it. Lists can be moved to another entry or unlinked. Everyone with access can add items, tick them off and remove them, and each item shows who added it and who got it. Each item is its own document, so people adding at the same time don't overwrite each other.
- **Profiles**: people the group plans for who don't use the app themselves (young kids, grandparents, pets). You can add any number, each with a colour. Each profile has a page showing what's coming up and a history with outcome notes.
- **Someone needs to sort it**: optional. Tick it when someone has to take or drive a person, or deal with something, then pick who's doing it. Only these entries get a "Needs someone" flag.
- **Private**: when an entry is only for you, you can mark it private. Others see "Busy".
- **People**: a "who's around" view, similar to Outlook's scheduling view. Pick a day to see every calendar side by side.
- **Ongoing or temporary sharing**: the owner sets each person as *Family · ongoing* or *Visitor until a date*. When the date passes, the visitor stops seeing the calendars. The owner can also remove people.
- **Care log (Premium)**: one-tap logging of feeds (bottle ml, breast side and minutes, solids), nappies (wet, dirty, both), sleep (start, then "Woke up") and medicine (name and dose, with a "last given" warning). For each person you plan for, it shows cards for time since the last feed, nappy and medicine, and how long they've been asleep or awake. It also shows today's totals (feeds, ml, wet and dirty nappies, sleep time) and a timeline for today and yesterday with who logged each entry.
  - The **owner always has access** (owner preview). Everyone else sees the locked Premium page until the owner taps **Turn on for everyone**. That switch stands in for the future in-app purchase; real payments can't run inside a claude.ai artifact.
- **Group** settings: the group's name and its profiles.

## How it's built
A single-page claude.ai Artifact using the shared database (`db`) and `user` capabilities.

Data: `events` (group calendar), `cals/<personId>/events` (personal calendars), `members/<personId>` (name and sharing choice), `access/<personId>` (family/visitor/removed with end date), and `trips/<tripId>` (destination, status, dates, who's going, votes per person, notes, packing list), `messages/<msgId>` (text, sender, time), `carelog/<logId>` (profile, kind, time, date, end time for sleep, details, logged by), `family/premium` (on/off, owner-only), `lists/<listId>` (title and linked event) with `lists/<listId>/items/<itemId>` (text, done, added by, got by), and `family/settings` (group name and profiles; older saves with fixed `kids` names are read as two profiles).

Access rules: anyone with access reads everything. Each person writes only their own `members` and `cals` entries. Only the owner writes `access` and `family/premium`.

## Inviting people
Share the artifact from the Share menu and invite them by email as an **Editor**. They appear under People the first time they open it.

Limitation: claude.ai's Share menu decides who can open the page. A visitor's end date hides the calendars inside the app, but it doesn't revoke their claude.ai access, so the app reminds the owner to remove them in Share as well. A standalone product would need its own backend to enforce expiry on the server.

If you open `index.html` straight from disk, it runs in preview mode with sample data, and nothing is saved.

## Product notes: what a full app would need
- **One account, many groups.** Here each planner is one artifact, so one group. A real app would let a person belong to several groups (family, flat, study group) and switch between them, with a combined "everything I'm in" view.
- **Joining.** Today people join through the claude.ai Share menu. A real app would use invite links or codes, with roles (owner, member, visitor until a date) enforced on the server.
- **Live calendar sync.** The .ics import is a one-off copy. Keeping Google, Outlook or university calendars in sync needs a backend that subscribes to those calendars.
- **Notifications, payments and storage.** Push reminders, App Store / Google Play purchases for Premium, and unlimited chat and log history all need a real backend.

## Colours
The palette comes from Kenya's lilac-breasted roller (*Coracias caudatus*): lilac breast, turquoise belly, ultramarine flight feathers (the main accent), cinnamon back and olive crown. The bird's dark eye-stripe is used for text. Neutrals carry a faint lilac tint, and a thin "plumage" stripe runs across the top of the app. Each colour has a lighter version for dark mode.
Each person can pick **Auto**, **Light** or **Dark** with the theme button in the header, or under Group → Appearance. The choice is saved on that device only. Auto follows the claude.ai theme setting, then the device's own setting.
