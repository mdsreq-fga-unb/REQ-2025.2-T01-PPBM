<script lang="ts">
	import { authStore } from '../../stores/auth';

	function handleLogout() {
		if (confirm('Deseja realmente sair do sistema?')) {
			authStore.logout();
			window.location.href = '/login';
		}
	}

	$: currentUser = $authStore.currentUser;
</script>

<header
	id="header"
	class="sticky top-0 z-30 backdrop-blur bg-white/80 border-b border-slate-200"
>
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
		<div
			class="flex items-center justify-center w-12 h-12 rounded-xl bg-[#E11D48]/10 text-[#E11D48] soft-shadow"
		>
			<svg width="26" height="26" viewBox="0 0 24 24" fill="none" class="drop-shadow">
				<path
					d="M12 2l3 3 4 1-1 4 2 3-2 3 1 4-4 1-3 3-3-3-4-1 1-4-2-3 2-3-1-4 4-1 3-3z"
					fill="currentColor"
					opacity=".15"
				/>
				<path
					d="M12 6a6 6 0 016 6v6H6v-6a6 6 0 016-6z"
					stroke="currentColor"
					stroke-width="1.5"
					opacity=".6"
				/>
				<circle cx="12" cy="13" r="2.2" fill="currentColor" opacity=".6" />
			</svg>
		</div>
		<div class="flex-1">
			<h1 class="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
				Programa Bombeiro Mirim
			</h1>
			<p class="text-slate-500 text-sm">Sistema de gestão - Versão 8.1</p>
		</div>
		<div class="flex items-center gap-3">
			<div class="hidden md:flex items-center gap-2">
				<span
					class="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs border border-green-200"
				>
					Sistema Ativo
				</span>
				<span
					class="px-3 py-1 rounded-full bg-[#E11D48]/10 text-[#BE123C] text-xs border border-[#E11D48]/20"
				>
					Usuário: {currentUser?.name || 'Admin'}
				</span>
			</div>
			<button
				id="btnLogout"
				on:click={handleLogout}
				class="px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-sm transition"
			>
				Sair
			</button>
		</div>
	</div>
</header>

