import { createClient } from '@supabase/supabase-js'

// Public project config. The anon key is browser-safe (Row Level Security
// enforces access), so it ships as a fallback for hosts without env vars set;
// VITE_SUPABASE_* environment variables override it when present.
const DEFAULT_URL = 'https://faczfhnilcoppstallbx.supabase.co'
const DEFAULT_ANON =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhY3pmaG5pbGNvcHBzdGFsbGJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMzMzEzNTYsImV4cCI6MjA5ODkwNzM1Nn0.nUgfcsFK3YUC94IXDa_zPHFlqB-WoEWAZvU6DRIDQl4'

const url = (import.meta.env.VITE_SUPABASE_URL as string | undefined) || DEFAULT_URL
const anon = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) || DEFAULT_ANON

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
