/**
 * Setup Demo Users
 *
 * Creates Supabase Auth users for the demo accounts defined in supabase/seed.sql.
 * Run BEFORE the seed SQL so that auth.users rows exist for the FK constraints.
 *
 * Usage:
 *   npx tsx scripts/setup-demo.ts
 *
 * Requires env vars:
 *   NEXT_PUBLIC_SUPABASE_URL    — your Supabase project URL
 *   SUPABASE_SERVICE_ROLE_KEY   — the service-role key (NOT the anon key)
 *
 * ⚠ Never commit the service-role key. Use .env.local or export it in your shell.
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    'Missing env vars. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.'
  )
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const DEMO_PASSWORD = 'Demo123!'

const DEMO_USERS = [
  { id: 'a0000000-0000-0000-0000-000000000001', email: 'admin@recruitment-hub.dev',             firstName: 'System', lastName: 'Admin' },
  { id: 'a0000000-0000-0000-0000-000000000002', email: 'rec.admin@recruitment-hub.dev',         firstName: 'Rachel', lastName: 'Thompson' },
  { id: 'a0000000-0000-0000-0000-000000000003', email: 'sarah.recruiter@recruitment-hub.dev',   firstName: 'Sarah',  lastName: 'Mitchell' },
  { id: 'a0000000-0000-0000-0000-000000000004', email: 'james.recruiter@recruitment-hub.dev',   firstName: 'James',  lastName: 'Wilson' },
  { id: 'a0000000-0000-0000-0000-000000000005', email: 'helen.manager@recruitment-hub.dev',     firstName: 'Helen',  lastName: 'Carter' },
  { id: 'a0000000-0000-0000-0000-000000000006', email: 'david.manager@recruitment-hub.dev',     firstName: 'David',  lastName: 'Okoro' },
  { id: 'a0000000-0000-0000-0000-000000000007', email: 'emily.interviewer@recruitment-hub.dev', firstName: 'Emily',  lastName: 'Zhao' },
  { id: 'a0000000-0000-0000-0000-000000000008', email: 'claire.reward@recruitment-hub.dev',     firstName: 'Claire', lastName: 'Morrison' },
]

async function main() {
  console.log('Creating demo auth users...\n')

  for (const user of DEMO_USERS) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: user.email,
      password: DEMO_PASSWORD,
      email_confirm: true,
      user_metadata: { first_name: user.firstName, last_name: user.lastName },
    })

    if (error) {
      if (error.message?.includes('already been registered')) {
        console.log(`  [skip] ${user.email} — already exists`)
      } else {
        console.error(`  [FAIL] ${user.email} — ${error.message}`)
      }
      continue
    }

    if (data.user && data.user.id !== user.id) {
      console.warn(
        `  [WARN] ${user.email} created with id ${data.user.id} — expected ${user.id}.\n` +
        `         Update seed.sql user IDs to match, or delete & recreate with the correct ID.`
      )
    } else {
      console.log(`  [ok]   ${user.email}`)
    }
  }

  console.log('\nDone. Now run supabase/seed.sql against your database.')
}

main().catch((err) => {
  console.error('Fatal:', err)
  process.exit(1)
})
