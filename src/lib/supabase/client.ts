import { createClient } from '@supabase/supabase-js';

/**
 * Browser-safe Supabase client using the public anon key.
 * Subject to Row Level Security policies.
 */
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
