import { writable } from 'svelte/store';

export type AdminSection = 'presencas' | 'cadastro' | 'gerenciar' | 'comunicacao' | 'relatorios' | 'dashboard';

function createNavigationStore() {
	const { subscribe, set } = writable<AdminSection>('presencas');

	return {
		subscribe,
		setSection: (section: AdminSection) => set(section),
		reset: () => set('presencas'),
	};
}

export const adminNavigation = createNavigationStore();

