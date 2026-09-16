/**
 * Provisions the demo user accounts for Recruitment Hub.
 *
 * `supabase/seed/seed.sql` deliberately never touches `auth.users` or the
 * `users` table, because those can only be created through Supabase Auth
 * (not plain SQL). This script does that part: it creates each demo user
 * via the Supabase Auth Admin API, mirrors them into `public.users`, and
 * assigns their role.
 *
 * Usage:
 *   1. Apply the migrations and run `supabase/seed/seed.sql` first (e.g.
 *      `supabase db reset`), so the `roles` table is populated.
 *   2. Make sure `.env.local` (or `.env`) has NEXT_PUBLIC_SUPABASE_URL and
 *      SUPABASE_SERVICE_ROLE_KEY set (see `.env.example`).
 *   3. Run:  npx tsx scripts/setup-demo.ts
 *
 * The script is idempotent — re-running it reuses existing auth users
 * (matched by email) instead of failing, and upserts their profile/role
 * rows. At the end it prints a ready-to-paste block of user id constants
 * for `supabase/seed/demo-data.sql`.
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

// ---------------------------------------------------------------------------
// Minimal .env loader (no extra dependency). Only sets variables that are
// not already present in the environment.
// ---------------------------------------------------------------------------

function loadEnvFile(path: string) {
  if (!existsSync(path)) return
  const contents = readFileSync(path, 'utf-8')
  for (const rawLine of contents.split('\n')) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) continue
    const eq = line.indexOf('=')
    if (eq === -1) continue
    const key = line.slice(0, eq).trim()
    let value = line.slice(eq + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    if (process.env[key] === undefined) {
      process.env[key] = value
    }
  }
}

loadEnvFile(resolve(process.cwd(), '.env.local'))
loadEnvFile(resolve(process.cwd(), '.env'))

// ---------------------------------------------------------------------------
// Demo accounts
// ---------------------------------------------------------------------------

const DEMO_PASSWORD = 'Demo1234!'

interface DemoAccount {
  email: string
  firstName: string
  lastName: string
  role: string
  /** The constant name this account maps to in `demo-data.sql`. */
  placeholder: string
}

const DEMO_ACCOUNTS: DemoAccount[] = [
  { email: 'admin@recruitment-hub.dev', firstName: 'Admin', lastName: 'User', role: 'admin', placeholder: 'ADMIN_USER' },
  { email: 'sarah.jones@recruitment-hub.dev', firstName: 'Sarah', lastName: 'Jones', role: 'recruiter', placeholder: 'RECRUITER_1' },
  { email: 'alex.smith@recruitment-hub.dev', firstName: 'Alex', lastName: 'Smith', role: 'recruiter', placeholder: 'RECRUITER_2' },
  { email: 'james.wilson@recruitment-hub.dev', firstName: 'James', lastName: 'Wilson', role: 'hiring_manager', placeholder: 'HM_1' },
  { email: 'emma.thompson@recruitment-hub.dev', firstName: 'Emma', lastName: 'Thompson', role: 'hiring_manager', placeholder: 'HM_2' },
  { email: 'david.brown@recruitment-hub.dev', firstName: 'David', lastName: 'Brown', role: 'hiring_manager', placeholder: 'HM_3' },
  { email: 'lisa.chen@recruitment-hub.dev', firstName: 'Lisa', lastName: 'Chen', role: 'interviewer', placeholder: 'INTERVIEWER_1' },
  { email: 'hr.reward@recruitment-hub.dev', firstName: 'Rachel', lastName: 'Green', role: 'hr_reward', placeholder: 'HR_REWARD' },
  { email: 'rec.admin@recruitment-hub.dev', firstName: 'Tom', lastName: 'Richards', role: 'rec_admin', placeholder: 'REC_ADMIN' },
]

// ---------------------------------------------------------------------------
// Console helpers
// ---------------------------------------------------------------------------

const log = {
  info: (msg: string) => console.log(`\x1b[36m•\x1b[0m ${msg}`),
  ok: (msg: string) => console.log(`\x1b[32m✓\x1b[0m ${msg}`),
  warn: (msg: string) => console.log(`\x1b[33m!\x1b[0m ${msg}`),
  error: (msg: string) => console.error(`\x1b[31m✗\x1b[0m ${msg}`),
  heading: (msg: string) => console.log(`\n\x1b[1m${msg}\x1b[0m`),
}

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    log.error(
      'Missing NEXT_PUBLIC_SUPABASE_URL and/or SUPABASE_SERVICE_ROLE_KEY. ' +
        'Set them in .env.local (see .env.example) before running this script.'
    )
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  log.heading('Recruitment Hub — Demo Account Setup')

  // Look up role ids up front so we can fail fast with a clear message if
  // `supabase/seed/seed.sql` hasn't been run yet.
  const { data: roleRows, error: roleError } = await supabase.from('roles').select('id, name')
  if (roleError) {
    log.error(`Failed to load roles: ${roleError.message}`)
    process.exit(1)
  }
  const roleIdByName = new Map((roleRows ?? []).map((r) => [r.name, r.id as string]))

  const missingRoles = [...new Set(DEMO_ACCOUNTS.map((a) => a.role))].filter((r) => !roleIdByName.has(r))
  if (missingRoles.length > 0) {
    log.error(
      `Missing role(s) in the database: ${missingRoles.join(', ')}. ` +
        'Run supabase/seed/seed.sql first.'
    )
    process.exit(1)
  }

  const results: Array<{ account: DemoAccount; userId: string }> = []
  const failures: string[] = []

  for (const account of DEMO_ACCOUNTS) {
    try {
      const userId = await ensureAuthUser(supabase, account)
      await ensureProfile(supabase, userId, account)
      await ensureRole(supabase, userId, roleIdByName.get(account.role)!)

      results.push({ account, userId })
      log.ok(`${account.firstName} ${account.lastName} <${account.email}> — ${account.role} (${userId})`)
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      failures.push(`${account.email}: ${message}`)
      log.error(`${account.email} — ${message}`)
    }
  }

  log.heading('Login credentials')
  log.info(`Password for every demo account: ${DEMO_PASSWORD}`)

  if (results.length > 0) {
    log.heading('User ids for supabase/seed/demo-data.sql')
    console.log(
      'Paste these over the placeholder `declare` block near the top of demo-data.sql:\n'
    )
    for (const { account, userId } of results) {
      console.log(`  ${account.placeholder.padEnd(14)} uuid := '${userId}'; -- ${account.firstName} ${account.lastName}`)
    }
    console.log('')
  }

  if (failures.length > 0) {
    log.heading('Failures')
    failures.forEach((f) => log.warn(f))
    process.exit(1)
  }

  log.ok('All demo accounts are ready.')
}

/** Creates the Supabase Auth user, or reuses an existing one with the same email. */
async function ensureAuthUser(
  supabase: SupabaseClient,
  account: DemoAccount
): Promise<string> {
  const { data: created, error: createError } = await supabase.auth.admin.createUser({
    email: account.email,
    password: DEMO_PASSWORD,
    email_confirm: true,
    user_metadata: { first_name: account.firstName, last_name: account.lastName },
  })

  if (!createError && created?.user) {
    return created.user.id
  }

  // Already exists — look it up instead of failing the whole run.
  const existing = await findUserByEmail(supabase, account.email)
  if (existing) return existing.id

  throw createError ?? new Error('Failed to create or find user')
}

async function findUserByEmail(supabase: SupabaseClient, email: string) {
  let page = 1
  const perPage = 200
  for (;;) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage })
    if (error) throw error
    const match = data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase())
    if (match) return match
    if (data.users.length < perPage) return null
    page += 1
  }
}

/** Upserts the `public.users` profile row for this auth user. */
async function ensureProfile(supabase: SupabaseClient, userId: string, account: DemoAccount) {
  const { error } = await supabase.from('users').upsert(
    {
      id: userId,
      email: account.email,
      first_name: account.firstName,
      last_name: account.lastName,
      status: 'active',
    },
    { onConflict: 'id' }
  )
  if (error) throw error
}

/** Assigns the role, ignoring the unique-constraint error if it's already assigned. */
async function ensureRole(supabase: SupabaseClient, userId: string, roleId: string) {
  const { error } = await supabase.from('user_roles').upsert(
    { user_id: userId, role_id: roleId },
    { onConflict: 'user_id,role_id' }
  )
  if (error) throw error
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
