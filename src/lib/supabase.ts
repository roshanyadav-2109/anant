import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

/**
 * A single Supabase client for the app. Auth session is persisted to
 * localStorage by the SDK; we never store the bearer token or any connector
 * secret ourselves. If env is missing the app still runs in a local demo
 * mode (see AuthProvider) so the interface is always inspectable.
 */
export const supabase =
  url && anon
    ? createClient(url, anon, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      })
    : null

export const supabaseConfigured = Boolean(supabase)
