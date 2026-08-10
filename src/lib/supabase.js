import { createClient } from '@supabase/supabase-js';

// These are public project identifiers, safe to expose in a browser. User data
// remains protected by the RLS policies in supabase/friendship-archive.sql.
const url = import.meta.env.VITE_SUPABASE_URL || 'https://xvdsrmagrultbhmqihuq.supabase.co';
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_6DFGWf1w1xh9guD2365bjw_Fuwa7VTJ';

export const supabase = createClient(url, anonKey, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
});

export const archivistEndpoint = import.meta.env.VITE_ARCHIVIST_ENDPOINT || `${url}/functions/v1/friendship-archivist`;
