# Database (Supabase)

Project: `circle-planner` (London, eu-west-2), ref `xfzkugkhascthehwnxrw`.

Migrations applied:
1. `circle_planner_core`: tables `groups`, `group_members`, `invites`, `docs`; triggers; RPCs `create_invite`, `invite_info`, `join_group`; row level security; realtime.
2. `lock_down_helper_functions`: moves `is_owner`, `is_member`, `doc_write_ok` to a private schema and revokes direct execution of trigger functions.

## How access works
- Every planner record is a row in `docs` (`group_id`, `path`, `data`), e.g. `events/<id>`, `lists/<id>/items/<id>`.
- Only active members of a group can read its rows. The owner always can. Visitors can read until their `until` date has passed, and removed members can't read at all.
- Members can write everything except `access/*`, `family/premium` and other people's `members/*` docs. Only the owner can write those.
- When the owner writes `access/<userId>` (family / visitor until / removed), a trigger copies it into `group_members`, so visitor expiry and removal are enforced by the database, not just the app.
- Invite codes are 12 random hex characters and expire after 14 days. `join_group` adds the signed-in user as a member.
