<script lang="ts">
	import { authStore } from '../stores/auth';
	import { onMount } from 'svelte';

	let loginUser = 'admin';
	let loginPassword = '123456';
	let rememberMe = false;
	let errorMessage = '';

	onMount(() => {
		// Verificar se já está logado
		const isAuth = authStore.checkAuth();
		if (isAuth) {
			// Redirecionar para página apropriada
			redirectToUserPage();
		}
	});

	function handleSubmit(event: Event) {
		event.preventDefault();
		errorMessage = '';

		const success = authStore.login(loginUser.trim(), loginPassword.trim());

		if (success) {
			// Redirecionar baseado no tipo de usuário
			redirectToUserPage();
		} else {
			errorMessage = 'Usuário ou senha incorretos!\n\nVerifique as credenciais disponíveis.';
		}
	}

	function redirectToUserPage() {
		authStore.subscribe((state) => {
			if (state.currentUser) {
				switch (state.currentUser.userType) {
					case 'admin':
						window.location.href = '/admin';
						break;
					case 'docente':
						window.location.href = '/docente';
						break;
					case 'responsavel':
						window.location.href = '/usuario';
						break;
				}
			}
		})();
	}
</script>

<div
	class="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center p-4"
>
	<div class="w-full max-w-md">
		<!-- Logo e Título -->
		<div class="text-center mb-8">
			<div
				class="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary-dark mb-4 floating-animation soft-shadow"
			>
				<svg width="40" height="40" viewBox="0 0 24 24" fill="none" class="text-white">
					<path
						d="M12 2l3 3 4 1-1 4 2 3-2 3 1 4-4 1-3 3-3-3-4-1 1-4-2-3 2-3-1-4 4-1 3-3z"
						fill="currentColor"
						opacity=".2"
					/>
					<path
						d="M12 6a6 6 0 016 6v6H6v-6a6 6 0 016-6z"
						stroke="currentColor"
						stroke-width="1.5"
						opacity=".8"
					/>
					<circle cx="12" cy="13" r="2.5" fill="currentColor" opacity=".8" />
				</svg>
			</div>
			<h1 class="text-3xl font-bold text-slate-900 mb-2">Bombeiro Mirim</h1>
			<p class="text-slate-600">Sistema de Gestão v8.1</p>
		</div>

		<!-- Formulário de Login -->
		<div class="bg-white rounded-3xl p-8 soft-shadow border border-slate-200">
			<form on:submit={handleSubmit} class="space-y-6">
				<div>
					<label class="block text-sm font-medium text-slate-700 mb-2">Usuário</label>
					<input
						bind:value={loginUser}
						type="text"
						required
						class="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
						placeholder="Digite seu usuário"
					/>
				</div>

				<div>
					<label class="block text-sm font-medium text-slate-700 mb-2">Senha</label>
					<input
						bind:value={loginPassword}
						type="password"
						required
						class="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
						placeholder="Digite sua senha"
					/>
				</div>

				<div class="flex items-center">
					<input
						bind:checked={rememberMe}
						id="rememberMe"
						type="checkbox"
						class="w-4 h-4 accent-primary"
					/>
					<label for="rememberMe" class="ml-2 text-sm text-slate-600">Lembrar de mim</label>
				</div>

				{#if errorMessage}
					<div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
						{errorMessage}
					</div>
				{/if}

				<button
					type="submit"
					class="w-full py-3 px-4 rounded-xl bg-primary hover:bg-primary-dark text-white font-medium transition transform hover:scale-[1.02] active:scale-[0.98]"
				>
					Entrar no Sistema
				</button>
			</form>

			<div class="mt-6 pt-6 border-t border-slate-200">
				<div class="text-center text-sm text-slate-500">
					<p>Credenciais de Exemplo:</p>
					<p class="font-mono bg-slate-100 px-2 py-1 rounded mt-1">admin / 123456</p>
					<p class="font-mono bg-slate-100 px-2 py-1 rounded mt-1">prof.silva / 123456</p>
					<p class="font-mono bg-slate-100 px-2 py-1 rounded mt-1">marcos.pereira / 123456</p>
				</div>
			</div>
		</div>

		<!-- Rodapé -->
		<div class="text-center mt-8 text-slate-500 text-sm">
			<p>© 2024 Corpo de Bombeiros - Sistema Interno</p>
		</div>
	</div>
</div>

