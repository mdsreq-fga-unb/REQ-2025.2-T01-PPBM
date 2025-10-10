import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_URL } from '../environment';
import jwt from 'jsonwebtoken';

export class SupabaseWrapper {
    private static _client: SupabaseClient | null = null;

    static init(): void {
        if (this._client) return;
        if (!SUPABASE_URL) throw new Error('SUPABASE_URL not configured');
        this._client = createClient(SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY ?? '');
    }

    static get(): SupabaseClient {
        if (!this._client) throw new Error('Supabase not initialized');
        return this._client;
    }

    static async getUserIdByEmail(email: string): Promise<number | null> {
        const { data, error } = await this.get()
            .from('users')
            .select('id_user')
            .eq('email', email)
            .maybeSingle();

        if (error) {
            console.log(`Error getting user id by email: ${error}`);
            return null;
        }
        console.log(`Got user id: ${data?.id_user}, from email: ${email}`);
        if (!data || typeof (data as any).id_user !== 'number') return null;
        return (data as any).id_user as number;
    }

    static getUserFromToken(token: string): { email: string; userId: string } | null {
        try {
            // Decode the JWT token (Supabase JWTs are signed but we can decode the payload)
            const decoded = jwt.decode(token) as any;
            if (!decoded || !decoded.email || !decoded.sub) {
                return null;
            }
            return {
                email: decoded.email,
                userId: decoded.sub
            };
        } catch (error) {
            console.log(`Error decoding JWT token: ${error}`);
            return null;
        }
    }
}