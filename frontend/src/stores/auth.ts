import { writable } from 'svelte/store';

export interface User {
	username: string;
	userType: 'admin' | 'docente' | 'responsavel';
	name?: string;
}

export interface AuthState {
	isLoggedIn: boolean;
	currentUser: User | null;
}

// Definir usuários válidos (conforme protótipo)
const VALID_USERS = [
	{ username: 'admin', password: '123456', userType: 'admin' as const, name: 'Administrador' },
	{ username: 'prof.silva', password: '123456', userType: 'docente' as const, name: 'Prof. Carlos Silva' },
	{ username: 'prof.santos', password: '123456', userType: 'docente' as const, name: 'Prof. Ana Santos' },
	{ username: 'marcos.pereira', password: '123456', userType: 'responsavel' as const, name: 'Marcos Pereira' },
	{ username: 'paula.santos', password: '123456', userType: 'responsavel' as const, name: 'Paula Santos' },
];

// Criar store de autenticação
function createAuthStore() {
	const { subscribe, set, update } = writable<AuthState>({
		isLoggedIn: false,
		currentUser: null,
	});

	return {
		subscribe,
		login: (username: string, password: string): boolean => {
			// Buscar usuário válido
			const user = VALID_USERS.find(
				(u) => u.username === username && u.password === password
			);

			if (user) {
				const authUser: User = {
					username: user.username,
					userType: user.userType,
					name: user.name,
				};

				// Atualizar store
				set({
					isLoggedIn: true,
					currentUser: authUser,
				});

				// Salvar no localStorage
				if (typeof window !== 'undefined') {
					localStorage.setItem('bm_auth', JSON.stringify(authUser));
				}

				return true;
			}

			return false;
		},
		logout: () => {
			// Limpar store
			set({
				isLoggedIn: false,
				currentUser: null,
			});

			// Remover do localStorage
			if (typeof window !== 'undefined') {
				localStorage.removeItem('bm_auth');
			}
		},
		checkAuth: () => {
			// Verificar se há usuário salvo no localStorage
			if (typeof window !== 'undefined') {
				const savedAuth = localStorage.getItem('bm_auth');
				if (savedAuth) {
					try {
						const user = JSON.parse(savedAuth) as User;
						set({
							isLoggedIn: true,
							currentUser: user,
						});
						return true;
					} catch (e) {
						console.error('Erro ao carregar autenticação:', e);
					}
				}
			}
			return false;
		},
	};
}

export const authStore = createAuthStore();

