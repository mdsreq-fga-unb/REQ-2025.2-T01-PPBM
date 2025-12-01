<script lang="ts">
	import { adminNavigation, type AdminSection } from '../../stores/adminNavigation';
	import SidebarCard from './SidebarCard.svelte';

	const sections: Array<{ id: AdminSection; label: string; icon: string }> = [
		{ id: 'presencas', label: 'Presenças', icon: '🗓️' },
		{ id: 'cadastro', label: 'Cadastro', icon: '👶' },
		{ id: 'gerenciar', label: 'Gerenciar Alunos', icon: '👥' },
		{ id: 'comunicacao', label: 'Comunicação', icon: '💬' },
		{ id: 'relatorios', label: 'Relatórios', icon: '📊' },
		{ id: 'dashboard', label: 'Dashboard', icon: '📈' },
	];

	function handleClick(section: AdminSection) {
		adminNavigation.setSection(section);
	}

	$: activeSection = $adminNavigation;
</script>

<aside id="sidebar" class="lg:sticky lg:top-20 self-start">
	<nav class="bg-white rounded-2xl p-3 soft-shadow border border-slate-200">
		<ul class="space-y-2">
			{#each sections as section}
				<SidebarCard
					isActive={activeSection === section.id}
					icon={section.icon}
					label={section.label}
					sectionId={section.id}
					onClick={() => handleClick(section.id)}
				/>
			{/each}
		</ul>
	</nav>
</aside>

