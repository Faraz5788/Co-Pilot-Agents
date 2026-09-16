import { createBrowserClient } from '@supabase/ssr'

/**
 * Creates a Supabase client for use in Client Components (browser context).
 * A new client should be created per-component-tree via this factory rather
 * than sharing a single module-level instance, per the @supabase/ssr guidance.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
