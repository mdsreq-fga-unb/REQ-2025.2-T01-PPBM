import { Request, Response } from 'express';
import { SupabaseWrapper } from './supabase_wrapper';

export class Pair<K, V> {
    key: K;
    value: V;

    constructor(key: K, value: V) {
        this.key = key;
        this.value = value;
    }
}

export async function requireAuth(req: Request, res: Response): Promise<{ ok: boolean; email?: string }> {
    const authorization = req.headers.authorization;
    if (!authorization) {
        return { ok: false };
    }
    const token = authorization.replace(/^Bearer\s+/i, '').trim();
    if (!token) {
        return { ok: false };
    }
    try {
        const { data, error } = await SupabaseWrapper.get().auth.getUser(token);
        if (error || !data?.user) {
            return { ok: false };
        }
        return { ok: true, email: data.user.email ?? undefined };
    } catch (e) {
        return { ok: false };
    }
}

export const Utils = {
    /**
     * Returns a formatted timestamp for logging
     */
    getTimestamp(): string {
        return new Date().toISOString();
    },

    /**
     * Logs an informational message
     * @param message The message to log
     * @param context Optional context object to log
     */
    info(message: string, context?: any): void {
        const timestamp = this.getTimestamp();
        console.log(`\x1b[36m[INFO]\x1b[0m [${timestamp}] ${message}`);
        if (context) {
            console.log('\x1b[36m[Context]\x1b[0m', context);
        }
    },

    /**
     * Logs a warning message
     * @param message The warning message to log
     * @param context Optional context object to log
     */
    warning(message: string, context?: any): void {
        const timestamp = this.getTimestamp();
        console.log(`\x1b[33m[WARNING]\x1b[0m [${timestamp}] ${message}`);
        if (context) {
            console.log('\x1b[33m[Context]\x1b[0m', context);
        }
    },

    /**
     * Logs an error message
     * @param message The error message to log
     * @param error Optional error object to log
     * @param context Optional context object to log
     */
    error(message: string, error?: Error, context?: any): void {
        const timestamp = this.getTimestamp();
        console.error(`\x1b[31m[ERROR]\x1b[0m [${timestamp}] ${message}`);
        if (error) {
            console.error('\x1b[31m[Error Details]\x1b[0m', error);
        }
        if (context) {
            console.error('\x1b[31m[Context]\x1b[0m', context);
        }
    }
};

export const AuthUtils = {
    async getEmailFromRequest(req: Request): Promise<string | null> {
        const authorization = req.headers.authorization;
        console.log(`Authorization: ${authorization}`);
        if (!authorization) return null;
        const token = authorization.replace(/^Bearer\s+/i, '').trim();
        if (!token) return null;
        try {
            const { data, error } = await SupabaseWrapper.get().auth.getUser(token);
            if (error || !data?.user) return null;
            return data.user.email ?? null;
        } catch (e) {
            return null;
        }
    },

    async getUserIdFromRequest(req: Request): Promise<number | null> {

        const email = await this.getEmailFromRequest(req);
        console.log(`Got email: ${email}, from request`);
        if (!email) return null;
        console.log(`Getting user id...`);
        return await SupabaseWrapper.getUserIdByEmail(email);
    }
}