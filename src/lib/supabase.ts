/**
 * Supabase Client Stub (Prepared for Phase 2)
 *
 * When you are ready to switch from local dummy data to Supabase:
 * 1. Create a Supabase project at https://supabase.com
 * 2. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your .env.local
 * 3. Install @supabase/supabase-js:
 *    npm install @supabase/supabase-js
 * 4. Uncomment the client initialization below and implement the SupabaseAdapter in dataService.ts
 */

/*
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
*/

export const isSupabaseConfigured = (): boolean => {
  return false; // Toggle to true once env variables are supplied in Phase 2
};

