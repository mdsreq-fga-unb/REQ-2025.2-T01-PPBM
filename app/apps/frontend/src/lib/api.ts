/**
 * API helper functions for frontend-backend communication
 * Handles authentication tokens and API requests
 */
import { supabase, getSession } from './supabase';

// Get API URL from environment or default
const API_URL = import.meta.env.PUBLIC_API_URL || 'http://localhost:3000';

// Token storage keys
const TOKEN_KEY = 'bm_token';
const REFRESH_TOKEN_KEY = 'bm_refresh_token';

/**
 * User type definitions
 */
export type UserType = 'admin' | 'docente' | 'responsavel';

export interface AuthUser {
    id: string;
    email: string;
    nome: string;
    tipo: UserType;
}

export interface LoginResponse {
    success: boolean;
    data?: {
        token: string;
        refreshToken: string;
        user: AuthUser;
    };
    error?: string;
}

export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
}

/**
 * Get stored auth token from Supabase session
 */
export async function getAuthToken(): Promise<string | null> {
    if (typeof window === 'undefined') return null;
    const session = await getSession();
    return session?.access_token ?? null;
}

/**
 * Get stored auth token synchronously (from localStorage backup)
 */
export function getAuthTokenSync(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
}

/**
 * Get stored refresh token
 */
export function getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(REFRESH_TOKEN_KEY);
}

/**
 * Store auth tokens
 */
export function setAuthTokens(token: string, refreshToken: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

/**
 * Clear auth tokens (logout)
 */
export function clearAuthTokens(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem('bm_user');
}

/**
 * Make an authenticated API request
 */
export async function apiFetch<T = unknown>(
    endpoint: string,
    options: RequestInit = {}
): Promise<ApiResponse<T>> {
    const token = await getAuthToken();

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers,
        });

        const data = await response.json();

        if (!response.ok) {
            // If unauthorized, try to refresh token
            if (response.status === 401 && getRefreshToken()) {
                const refreshed = await refreshAuthToken();
                if (refreshed) {
                    // Retry the request with new token
                    return apiFetch<T>(endpoint, options);
                }
            }

            return {
                success: false,
                error: data.error || data.message || `HTTP ${response.status}`,
            };
        }

        return {
            success: true,
            data: data,
        };
    } catch (error) {
        console.error('API request failed:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Network error',
        };
    }
}

/**
 * Refresh the auth token using Supabase
 */
async function refreshAuthToken(): Promise<boolean> {
    try {
        const { data, error } = await supabase.auth.refreshSession();

        if (error || !data.session) {
            clearAuthTokens();
            return false;
        }

        // Store backup in localStorage
        setAuthTokens(data.session.access_token, data.session.refresh_token ?? '');
        return true;
    } catch {
        clearAuthTokens();
        return false;
    }
}

/**
 * Login with email and password using Supabase Auth
 * Then fetch user details from backend
 */
export async function login(email: string, password: string): Promise<LoginResponse> {
    try {
        console.log('Attempting login for:', email);

        // Step 1: Authenticate with Supabase directly
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (authError || !authData.user) {
            console.error('Supabase auth error:', authError);
            return {
                success: false,
                error: authError?.message || 'Credenciais inválidas',
            };
        }

        // Store tokens as backup
        if (authData.session) {
            setAuthTokens(authData.session.access_token, authData.session.refresh_token ?? '');
        }

        // Step 2: Get user details from backend
        const response = await fetch(`${API_URL}/auth/user-by-email`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authData.session?.access_token}`,
            },
            body: JSON.stringify({ email }),
        });

        const userData = await response.json();

        if (!response.ok || !userData.success) {
            // Auth succeeded but user not in system
            return {
                success: false,
                error: userData.error || 'Usuário não cadastrado no sistema',
            };
        }

        return {
            success: true,
            data: {
                token: authData.session?.access_token ?? '',
                refreshToken: authData.session?.refresh_token ?? '',
                user: userData.data.user,
            },
        };
    } catch (error) {
        console.error('Login failed:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Network error',
        };
    }
}

/**
 * Logout the current user
 */
export async function logout(): Promise<void> {
    try {
        // Sign out from Supabase (this handles session cleanup)
        await supabase.auth.signOut();
    } catch {
        // Ignore errors during logout
    }

    // Clear local tokens regardless
    clearAuthTokens();
}

/**
 * Get current user from token
 */
export async function getCurrentUser(): Promise<ApiResponse<{ user: AuthUser }>> {
    return apiFetch<{ user: AuthUser }>('/auth/me');
}

/**
 * Register a new responsável
 */
export interface RegisterData {
    email: string;
    password: string;
    nome: string;
    telefone: string;
    cpf: string;
}

export interface RegisterResponse {
    success: boolean;
    data?: {
        user: AuthUser;
    };
    error?: string;
}

export async function register(data: RegisterData): Promise<RegisterResponse> {
    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        const result = await response.json();

        if (!response.ok) {
            return {
                success: false,
                error: result.error || result.message || 'Erro ao cadastrar',
            };
        }

        return {
            success: true,
            data: result.data,
        };
    } catch (error) {
        console.error('Registration failed:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Erro de conexão',
        };
    }
}
