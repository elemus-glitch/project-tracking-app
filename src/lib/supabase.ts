import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

/**
 * `isSupabaseConfigured` lets the UI show a friendly setup guide instead of
 * crashing when the environment variables have not been provided yet.
 */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

export const supabase: SupabaseClient<Database> | null = isSupabaseConfigured
  ? createClient<Database>(supabaseUrl as string, supabaseAnonKey as string, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        // Parses the access token that Supabase appends to the URL after OAuth
        // sign-in / email links. Required for the implicit flow used here.
        detectSessionInUrl: true,
        flowType: 'implicit',
      },
      realtime: {
        params: {
          // Realtime is what makes teammates see each other's changes live.
          eventsPerSecond: 5,
        },
      },
    })
  : null
