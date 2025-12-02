/**
 * Supabase client for frontend authentication
 * Uses the anon key for client-side auth operations
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// For SSR, we need to check both import.meta.env (build-time) and process.env (runtime)
const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL ||
    (typeof process !== 'undefined' ? process.env.PUBLIC_SUPABASE_URL : '') ||
    'http://localhost:54321';

const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY ||
    (typeof process !== 'undefined' ? process.env.PUBLIC_SUPABASE_ANON_KEY : '') ||
    '';

// Only create client if we have the required key
if (!supabaseAnonKey && typeof window !== 'undefined') {
    console.error('WARNING: Supabase anon key is not configured. Auth will not work.');
}

// Lazy-initialize the Supabase client only on the browser to avoid SSR issues
let _supabaseClient: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient | null {
    // Don't create client during SSR
    if (typeof window === 'undefined') {
        return null;
    }
    
    // Create client only once
    if (!_supabaseClient && supabaseAnonKey) {
        _supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
            auth: {
                persistSession: true,
                autoRefreshToken: true,
                detectSessionInUrl: true,
            },
        });
    }
    
    return _supabaseClient;
}

// Export a getter that lazily initializes the client
export const supabase = typeof window !== 'undefined' ? getSupabaseClient() : null;

// Export the getter function for cases where we need to ensure client-side execution
export { getSupabaseClient };

/**
 * Get the current session from Supabase
 */
export async function getSession() {
    const client = getSupabaseClient();
    if (!client) return null;
    const { data: { session }, error } = await client.auth.getSession();
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
    const client = getSupabaseClient();
    if (!client) return null;
    const { data: { user }, error } = await client.auth.getUser();
    if (error) {
        console.error('Error getting user:', error);
        return null;
    }
    return user;
}
