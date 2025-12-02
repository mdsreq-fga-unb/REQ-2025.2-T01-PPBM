import { writable, get } from 'svelte/store';
import {
	login as apiLogin,
	logout as apiLogout,
	getCurrentUser,
	setAuthTokens,
	clearAuthTokens,
	getAuthToken,
	type AuthUser
} from '../lib/api';

export type { AuthUser };

export interface AuthState {
	isLoggedIn: boolean;
	currentUser: AuthUser | null;
	isLoading: boolean;
}

// Create auth store
function createAuthStore() {
	const { subscribe, set, update } = writable<AuthState>({
		isLoggedIn: false,
		currentUser: null,
		isLoading: false,
	});

	return {
		subscribe,

		/**
		 * Login with email and password
		 */
		login: async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
			console.log('[AuthStore] login() called for:', email);
			update(state => ({ ...state, isLoading: true }));

			try {
				console.log('[AuthStore] Calling apiLogin...');
				const response = await apiLogin(email, password);
				console.log('[AuthStore] apiLogin response:', response);

				if (response.success && response.data) {
					const { token, refreshToken, user } = response.data;
					console.log('[AuthStore] Login successful, user:', user);					// Store tokens
					setAuthTokens(token, refreshToken);

					// Store user in localStorage for persistence
					if (typeof window !== 'undefined') {
						localStorage.setItem('bm_user', JSON.stringify(user));
					}

					// Update store
					console.log('[AuthStore] Updating store with user data');
					set({
						isLoggedIn: true,
						currentUser: user,
						isLoading: false,
					});

					console.log('[AuthStore] Store updated, returning success');
					return { success: true };
				}

				console.log('[AuthStore] Login failed:', response.error);
				update(state => ({ ...state, isLoading: false }));
				return { success: false, error: response.error || 'Erro ao fazer login' };
			} catch (error) {
				console.error('[AuthStore] Login exception:', error);
				update(state => ({ ...state, isLoading: false }));
				return { success: false, error: 'Erro de conexão com o servidor' };
			}
		},

		/**
		 * Logout user
		 */
		logout: async () => {
			try {
				await apiLogout();
			} catch {
				// Even if API call fails, clear local state
			}

			// Clear tokens and user data
			clearAuthTokens();

			// Clear store
			set({
				isLoggedIn: false,
				currentUser: null,
				isLoading: false,
			});
		},

		/**
		 * Check if user is authenticated (on page load)
		 */
		checkAuth: async (): Promise<boolean> => {
			console.log('[AuthStore] checkAuth() called');
			
			// First check if we have a token
			const token = await getAuthToken();
			console.log('[AuthStore] Token from getAuthToken:', token ? 'exists' : 'null');
			
			if (!token) {
				// Also check localStorage backup
				if (typeof window !== 'undefined') {
					const backupToken = localStorage.getItem('bm_token');
					console.log('[AuthStore] Backup token:', backupToken ? 'exists' : 'null');
					if (!backupToken) {
						console.log('[AuthStore] No token found, returning false');
						return false;
					}
				} else {
					return false;
				}
			}

			// Try to load from localStorage first for faster UX
			if (typeof window !== 'undefined') {
				const savedUser = localStorage.getItem('bm_user');
				console.log('[AuthStore] Saved user in localStorage:', savedUser ? 'exists' : 'null');
				if (savedUser) {
					try {
						const user = JSON.parse(savedUser) as AuthUser;
						console.log('[AuthStore] Parsed saved user:', user);
						set({
							isLoggedIn: true,
							currentUser: user,
							isLoading: true, // Still loading to verify token
						});
					} catch {
						// Invalid saved user, continue with API check
					}
				}
			}

			// Verify token with API
			try {
				console.log('[AuthStore] Calling getCurrentUser() to verify token...');
				const response = await getCurrentUser();
				console.log('[AuthStore] getCurrentUser() response:', response);

				if (response.success && response.data?.user) {
					const user = response.data.user;
					console.log('[AuthStore] User verified:', user);

					// Update localStorage with fresh data
					if (typeof window !== 'undefined') {
						localStorage.setItem('bm_user', JSON.stringify(user));
					}

					set({
						isLoggedIn: true,
						currentUser: user,
						isLoading: false,
					});

					return true;
				}

				console.log('[AuthStore] Token verification failed:', response.error);
				// Token invalid, clear everything
				clearAuthTokens();
				set({
					isLoggedIn: false,
					currentUser: null,
					isLoading: false,
				});

				return false;
			} catch (error) {
				console.error('[AuthStore] Exception during token verification:', error);
				// Network error, but we have cached user, keep them logged in
				const state = get({ subscribe });
				if (state.currentUser) {
					update(s => ({ ...s, isLoading: false }));
					return true;
				}

				set({
					isLoggedIn: false,
					currentUser: null,
					isLoading: false,
				});

				return false;
			}
		},

		/**
		 * Get current user synchronously from store
		 */
		getUser: (): AuthUser | null => {
			return get({ subscribe }).currentUser;
		},

		/**
		 * Check if user has specific role
		 */
		hasRole: (role: AuthUser['tipo']): boolean => {
			const state = get({ subscribe });
			return state.currentUser?.tipo === role;
		},
	};
}

export const authStore = createAuthStore();

