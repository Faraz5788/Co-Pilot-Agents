# Circle Planner (web app)

A standalone version of the planner: email sign-in, groups, invite links and a shared database, with no Claude account needed.

- **Database and sign-in:** Supabase project `circle-planner` (London). See `supabase/README.md`.
- **Hosting:** Vercel, serving this folder as a static site (no build step).
- **UI:** generated from `../circle-planner-app/index.html` by `build.py`. Change the UI there, then run `python3 circle-planner-web/build.py` and commit both.

## Files
| File | What it is |
|---|---|
| `index.html` | The app (generated, so don't edit by hand) |
| `shim.js` | Supabase connector: sign-in screens, groups, invites, storage and live updates |
| `build.py` | Builds `index.html` from the planner UI |
| `vercel.json` | Security headers and caching |
| `manifest.webmanifest`, `icon.svg`, `*.png` | "Add to Home Screen" support |

## One-time setup

### 1. Deploy on Vercel
1. Go to https://vercel.com/new and choose **Import Git Repository**, then pick `Faraz5788/Co-Pilot-Agents`. If it isn't listed, choose "Adjust GitHub App Permissions" and give Vercel access to that repo.
2. Set **Root Directory** to `circle-planner-web` and **Framework Preset** to **Other**. Leave the build command empty.
3. Click **Deploy**. Note the address, e.g. `https://circle-planner.vercel.app`.
4. Vercel deploys the repo's main branch. Until this folder is merged into main, set **Settings → Git → Production Branch** to the branch it's on.

### 2. Tell Supabase the app's address (needed for sign-in links)
In Supabase, open **Authentication → URL Configuration** for the `circle-planner` project:
- **Site URL:** your Vercel address, e.g. `https://circle-planner.vercel.app`
- **Redirect URLs:** add `https://circle-planner.vercel.app/**`, and `https://*-faraztak-1494s-projects.vercel.app/**` for preview deployments

Without this, the sign-in email links point to `localhost` and won't work.

### 3. (Recommended before inviting lots of people) email sending
Supabase's built-in email service only sends a few sign-in emails per hour. For real use, connect your own email provider (for example Resend) under **Authentication → Emails → SMTP Settings**.

## Running locally
Serve this folder with any static server (for example `npx serve circle-planner-web`). Add `http://localhost:3000/**` to the Supabase redirect URLs while developing.
