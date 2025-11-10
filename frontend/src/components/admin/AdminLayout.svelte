<script lang="ts">
	import { onMount } from 'svelte';
	import { authStore } from '../../stores/auth';
	import { adminNavigation } from '../../stores/adminNavigation';
	import AdminHeader from './AdminHeader.svelte';
	import AdminSidebar from './AdminSidebar.svelte';
	import Presencas from './sections/Presencas.svelte';
	import Cadastro from './sections/Cadastro.svelte';
	import GerenciarAlunos from './sections/GerenciarAlunos.svelte';
	import Comunicacao from './sections/Comunicacao.svelte';
	import Relatorios from './sections/Relatorios.svelte';
	import DashboardAdmin from './sections/DashboardAdmin.svelte';

	$: currentSection = $adminNavigation;

	onMount(() => {
		// Verificar autenticação
		const isAuth = authStore.checkAuth();
		if (!isAuth) {
			window.location.href = '/login';
		}
	});
</script>

<div class="min-h-screen bg-gradient-to-br from-white via-slate-50 to-slate-100 text-slate-900">
	<AdminHeader />

	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-1 lg:grid-cols-[280px,1fr] gap-6">
		<AdminSidebar />

		<!-- Main Sections -->
		<main class="space-y-6">
			{#if currentSection === 'presencas'}
				<Presencas />
			{:else if currentSection === 'cadastro'}
				<Cadastro />
			{:else if currentSection === 'gerenciar'}
				<GerenciarAlunos />
			{:else if currentSection === 'comunicacao'}
				<Comunicacao />
			{:else if currentSection === 'relatorios'}
				<Relatorios />
			{:else if currentSection === 'dashboard'}
				<DashboardAdmin />
			{/if}
		</main>
	</div>
</div>

