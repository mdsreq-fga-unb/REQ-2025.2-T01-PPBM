<script lang="ts">
	import { authStore } from "../stores/auth";
	import { onMount } from "svelte";

	let loginEmail = "";
	let loginPassword = "";
	let rememberMe = false;
	let errorMessage = "";
	let isLoading = false;

	onMount(async () => {
		// Verificar se já está logado
		const isAuth = await authStore.checkAuth();
		if (isAuth) {
			// Redirecionar para página apropriada
			redirectToUserPage();
		}
	});

	async function handleSubmit(event: Event) {
		event.preventDefault();
		errorMessage = "";
		isLoading = true;

		const result = await authStore.login(
			loginEmail.trim(),
			loginPassword.trim(),
		);

		isLoading = false;

		if (result.success) {
			// Redirecionar baseado no tipo de usuário
			redirectToUserPage();
		} else {
			errorMessage = result.error || "Email ou senha incorretos!";
		}
	}

	function redirectToUserPage() {
		authStore.subscribe((state) => {
			if (state.currentUser) {
				switch (state.currentUser.userType) {
					case "admin":
						window.location.href = "/admin";
						break;
					case "docente":
						window.location.href = "/docente";
						break;
					case "responsavel":
						window.location.href = "/responsavel";
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
				<svg
					width="40"
					height="40"
					viewBox="0 0 24 24"
					fill="none"
					class="text-white"
				>
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
					<circle
						cx="12"
						cy="13"
						r="2.5"
						fill="currentColor"
						opacity=".8"
					/>
				</svg>
			</div>
			<h1 class="text-3xl font-bold text-slate-900 mb-2">
				Bombeiro Mirim
			</h1>
			<p class="text-slate-600">Sistema de Gestão v8.1</p>
		</div>

		<!-- Formulário de Login -->
		<div
			class="bg-white rounded-3xl p-8 soft-shadow border border-slate-200"
		>
			<form on:submit={handleSubmit} class="space-y-6">
				<div>
					<label class="block text-sm font-medium text-slate-700 mb-2"
						>Email</label
					>
					<input
						bind:value={loginEmail}
						type="email"
						required
						disabled={isLoading}
						class="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition disabled:opacity-50 disabled:cursor-not-allowed"
						placeholder="Digite seu email"
					/>
				</div>

				<div>
					<label class="block text-sm font-medium text-slate-700 mb-2"
						>Senha</label
					>
					<input
						bind:value={loginPassword}
						type="password"
						required
						disabled={isLoading}
						class="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition disabled:opacity-50 disabled:cursor-not-allowed"
						placeholder="Digite sua senha"
					/>
				</div>

				<div class="flex items-center">
					<input
						bind:checked={rememberMe}
						id="rememberMe"
						type="checkbox"
						disabled={isLoading}
						class="w-4 h-4 accent-primary"
					/>
					<label for="rememberMe" class="ml-2 text-sm text-slate-600"
						>Lembrar de mim</label
					>
				</div>

				{#if errorMessage}
					<div
						class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm"
					>
						{errorMessage}
					</div>
				{/if}

				<button
					type="submit"
					disabled={isLoading}
					class="w-full py-3 px-4 rounded-xl bg-primary hover:bg-primary-dark text-white font-medium transition transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
				>
					{#if isLoading}
						<span class="inline-flex items-center">
							<svg
								class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
							>
								<circle
									class="opacity-25"
									cx="12"
									cy="12"
									r="10"
									stroke="currentColor"
									stroke-width="4"
								></circle>
								<path
									class="opacity-75"
									fill="currentColor"
									d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
								></path>
							</svg>
							Entrando...
						</span>
					{:else}
						Entrar no Sistema
					{/if}
				</button>
			</form>

			<div class="mt-6 pt-6 border-t border-slate-200">
				<div class="text-center text-sm text-slate-600">
					<p class="mb-2">
						Não possui uma conta? <a
							href="/cadastro"
							class="text-indigo-600 hover:underline font-medium"
							>Cadastre-se</a
						>
					</p>
					<p class="text-slate-500">
						Problemas para acessar? Entre em contato com o
						administrador.
					</p>
				</div>
			</div>
		</div>

		<!-- Rodapé -->
		<div class="text-center mt-8 text-slate-500 text-sm">
			<p>© 2024 Corpo de Bombeiros - Sistema Interno</p>
		</div>
	</div>
</div>
