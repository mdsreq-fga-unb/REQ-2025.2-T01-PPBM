import { writable } from 'svelte/store';

export type ResponsavelSection = 'presencas' | 'advertencias' | 'comunicacao' | 'relatorio';

function createNavigationStore() {
    const { subscribe, set } = writable<ResponsavelSection>('presencas');

    return {
        subscribe,
        setSection: (section: ResponsavelSection) => set(section),
        reset: () => set('presencas'),
    };
}

export const responsavelNavigation = createNavigationStore();
