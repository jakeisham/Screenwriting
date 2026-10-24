import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// Public by design: the project URL and publishable key ship in every browser bundle.
// Row Level Security (supabase/schema.sql) is what keeps each user's data private.
// Vercel env vars, if set, take precedence.
const url = (import.meta.env.VITE_SUPABASE_URL as string | undefined) || 'https://fxxdtoymllkxjzpldigu.supabase.co'
const key = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) || 'sb_publishable_-rarHu126YOn1B0xeC4z2A_ip5sqont'

export const supabase: SupabaseClient | null =
  !import.meta.env.VITE_DEMO && url && key
    ? createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } })
    : null

export const syncConfigured = !!supabase

// Single-owner app: no sign-in, every device syncs as this person.
export const OWNER_NAME = 'Jake Isham'
