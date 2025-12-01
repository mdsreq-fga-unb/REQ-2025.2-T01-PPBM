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
			update(state => ({ ...state, isLoading: true }));

			

			try {
				const response = await apiLogin(email, password);

				if (response.success && response.data) {
					const { token, refreshToken, user } = response.data;

					// Store tokens
					setAuthTokens(token, refreshToken);

					// Store user in localStorage for persistence
					if (typeof window !== 'undefined') {
						localStorage.setItem('bm_user', JSON.stringify(user));
					}

					// Update store
					set({
						isLoggedIn: true,
						currentUser: user,
						isLoading: false,
					});

					return { success: true };
				}

				update(state => ({ ...state, isLoading: false }));
				return { success: false, error: response.error || 'Erro ao fazer login' };
			} catch (error) {
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
			// First check if we have a token
			const token = getAuthToken();
			if (!token) {
				return false;
			}

			// Try to load from localStorage first for faster UX
			if (typeof window !== 'undefined') {
				const savedUser = localStorage.getItem('bm_user');
				if (savedUser) {
					try {
						const user = JSON.parse(savedUser) as AuthUser;
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
				const response = await getCurrentUser();

				if (response.success && response.data?.user) {
					const user = response.data.user;

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

				// Token invalid, clear everything
				clearAuthTokens();
				set({
					isLoggedIn: false,
					currentUser: null,
					isLoading: false,
				});

				return false;
			} catch {
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

