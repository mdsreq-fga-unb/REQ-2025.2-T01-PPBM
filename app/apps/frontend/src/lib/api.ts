/**
 * API helper functions for frontend-backend communication
 * Handles authentication tokens and API requests
 */

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
 * Get stored auth token
 */
export function getAuthToken(): string | null {
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
    const token = getAuthToken();
    
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
 * Refresh the auth token using the refresh token
 */
async function refreshAuthToken(): Promise<boolean> {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return false;

    try {
        const response = await fetch(`${API_URL}/auth/refresh`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refreshToken }),
        });

        if (!response.ok) {
            clearAuthTokens();
            return false;
        }

        const data = await response.json();
        if (data.token && data.refreshToken) {
            setAuthTokens(data.token, data.refreshToken);
            return true;
        }

        return false;
    } catch {
        clearAuthTokens();
        return false;
    }
}

/**
 * Login with email and password
 */
export async function login(email: string, password: string): Promise<LoginResponse> {
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                error: data.error || data.message || 'Login failed',
            };
        }

        return {
            success: true,
            data: {
                token: data.token,
                refreshToken: data.refreshToken,
                user: data.user,
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
    const token = getAuthToken();
    
    // Call logout endpoint (best effort)
    if (token) {
        try {
            await fetch(`${API_URL}/auth/logout`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
        } catch {
            // Ignore errors during logout
        }
    }

    // Clear local tokens regardless of API response
    clearAuthTokens();
}

/**
 * Get current user from token
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
    const response = await apiFetch<{ user: AuthUser }>('/auth/me');
    
    if (response.success && response.data) {
        return response.data.user;
    }

    return null;
}
