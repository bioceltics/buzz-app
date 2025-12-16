import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const isConfigured = supabaseUrl.includes('supabase.co') && supabaseServiceKey.length > 20;

if (!isConfigured) {
  console.warn('⚠️  Supabase not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in api/.env');
  console.warn('   Get these from: https://supabase.com/dashboard/project/YOUR_PROJECT/settings/api');
}

// Admin client with service key for server-side operations
export const supabaseAdmin: SupabaseClient | null = isConfigured
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;

// Create client with user's access token
export function createSupabaseClient(accessToken: string): SupabaseClient | null {
  if (!isConfigured) return null;
  return createClient(supabaseUrl, supabaseServiceKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });
}

// Helper to check if Supabase is ready
export function requireSupabase(): SupabaseClient {
  if (!supabaseAdmin) {
    throw new Error('Supabase is not configured. Please add credentials to api/.env');
  }
  return supabaseAdmin;
}
