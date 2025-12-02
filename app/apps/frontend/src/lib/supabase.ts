/**
 * Supabase client for frontend authentication
 * Uses the anon key for client-side auth operations
 */
import { createClient } from '@supabase/supabase-js';

// For SSR, we need to check both import.meta.env (build-time) and process.env (runtime)
const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL || 
    (typeof process !== 'undefined' ? process.env.PUBLIC_SUPABASE_URL : '') || 
    'http://localhost:54321';

const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || 
    (typeof process !== 'undefined' ? process.env.PUBLIC_SUPABASE_ANON_KEY : '') || 
    '';

// Only create client if we have the required key
if (!supabaseAnonKey) {
    console.error('WARNING: Supabase anon key is not configured. Auth will not work.');
}

export const supabase = supabaseAnonKey 
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
        },
    })
    : null;

/**
 * Get the current session from Supabase
 */
export async function getSession() {
    if (!supabase) return null;
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
        console.error('Error getting session:', error);
        return null;
    }
    return session;
}

/**
 * Get current user from Supabase Auth
 */
export async function getSupabaseUser() {
    if (!supabase) return null;
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
        console.error('Error getting user:', error);
        return null;
    }
    return user;
}
