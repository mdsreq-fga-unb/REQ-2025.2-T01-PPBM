<script lang="ts">
	let activeTab: 'equipe' | 'responsaveis' | 'avisos' = 'equipe';
	let destinatarios = 'todos';
	let mostrarSeletorIndividual = false;
	let assuntoMsg = '';
	let conteudoMsg = '';
	let urgente = false;
	let tipoAviso = 'informativo';
	let tituloAviso = '';
	let conteudoAviso = '';
	let validadeAviso = '';

	function handleNovaMsg() {
		activeTab = 'responsaveis';
	}

	function handleMarcarLidas() {
		alert('Funcionalidade em desenvolvimento.');
	}

	function handleEnviarMensagem(e: Event) {
		e.preventDefault();
		alert('Funcionalidade em desenvolvimento. A mensagem será enviada em breve.');
		assuntoMsg = '';
		conteudoMsg = '';
		urgente = false;
	}

	function handleCriarAviso(e: Event) {
		e.preventDefault();
		alert('Funcionalidade em desenvolvimento. O aviso será publicado em breve.');
		tituloAviso = '';
		conteudoAviso = '';
		validadeAviso = '';
	}

	$: {
		mostrarSeletorIndividual = destinatarios === 'individual';
	}
</script>

<section id="comunicacao" class="bg-white rounded-3xl p-6 soft-shadow border border-slate-200">
	<div class="flex items-center justify-between mb-6">
		<div>
			<h2 class="text-2xl font-bold text-slate-900 mb-1">Central de Comunicação</h2>
			<p class="text-slate-500">Comunique-se com a equipe e responsáveis</p>
		</div>
		<div class="flex gap-2">
			<button
				on:click={handleNovaMsg}
				class="px-4 py-2 rounded-lg bg-primary hover:bg-primary-dark text-white transition"
			>
				Nova Mensagem
			</button>
			<button
				on:click={handleMarcarLidas}
				class="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white transition"
			>
				Marcar como Lidas
			</button>
		</div>
	</div>

	<!-- Abas de Comunicação -->
	<div class="flex border-b border-slate-200 mb-6">
		<button
			on:click={() => (activeTab = 'equipe')}
			class="px-4 py-2 border-b-2 transition {activeTab === 'equipe'
				? 'border-primary text-primary font-medium'
				: 'border-transparent text-slate-500 hover:text-slate-700'}"
		>
			Equipe Interna
		</button>
		<button
			on:click={() => (activeTab = 'responsaveis')}
			class="px-4 py-2 border-b-2 transition {activeTab === 'responsaveis'
				? 'border-primary text-primary font-medium'
				: 'border-transparent text-slate-500 hover:text-slate-700'}"
		>
			Responsáveis
		</button>
		<button
			on:click={() => (activeTab = 'avisos')}
			class="px-4 py-2 border-b-2 transition {activeTab === 'avisos'
				? 'border-primary text-primary font-medium'
				: 'border-transparent text-slate-500 hover:text-slate-700'}"
		>
			Avisos Gerais
		</button>
	</div>

	<!-- Conteúdo das Abas -->
	{#if activeTab === 'equipe'}
		<div class="grid lg:grid-cols-3 gap-6">
			<!-- Lista de Conversas -->
			<div class="lg:col-span-1">
				<h3 class="font-semibold mb-3">Conversas da Equipe</h3>
				<div class="space-y-2 max-h-96 overflow-y-auto">
					<div class="p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
						<div class="flex items-center justify-between">
							<div class="font-medium">Geral</div>
							<span class="px-2 py-1 rounded-full bg-red-500 text-white text-xs">1</span>
						</div>
						<div class="text-sm text-slate-500">Admin, Coordenador, Instrutor</div>
					</div>
					<div class="p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
						<div class="flex items-center justify-between">
							<div class="font-medium">Coordenação</div>
						</div>
						<div class="text-sm text-slate-500">Admin, Coordenador</div>
					</div>
				</div>
			</div>

			<!-- Chat -->
			<div class="lg:col-span-2">
				<div class="border border-slate-200 rounded-xl h-96 flex flex-col">
					<div class="p-4 border-b border-slate-200 bg-slate-50 rounded-t-xl">
						<h4 class="font-medium">Selecione uma conversa</h4>
					</div>
					<div class="flex-1 p-4 overflow-y-auto space-y-3">
						<div class="text-center text-slate-500 py-8">Selecione uma conversa para começar</div>
					</div>
					<div class="p-4 border-t border-slate-200">
						<div class="flex gap-2">
							<input
								class="flex-1 px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary"
								placeholder="Digite sua mensagem..."
								disabled
							/>
							<button
								class="px-4 py-2 rounded-lg bg-primary hover:bg-primary-dark text-white transition"
								disabled
							>
								Enviar
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	{/if}

	{#if activeTab === 'responsaveis'}
		<div class="grid lg:grid-cols-2 gap-6">
			<!-- Enviar Mensagem -->
			<div>
				<h3 class="font-semibold mb-3">Enviar Mensagem para Responsáveis</h3>
				<form on:submit={handleEnviarMensagem} class="space-y-4">
					<div>
						<label class="block text-sm font-medium mb-1">Destinatários</label>
						<select
							bind:value={destinatarios}
							class="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary"
						>
							<option value="todos">Todos os responsáveis</option>
							<option value="turma-a">Responsáveis - Turma A</option>
							<option value="turma-b">Responsáveis - Turma B</option>
							<option value="turma-c">Responsáveis - Turma C</option>
							<option value="individual">Responsável específico</option>
						</select>
					</div>

					{#if mostrarSeletorIndividual}
						<div>
							<label class="block text-sm font-medium mb-1">Selecionar responsável</label>
							<select
								class="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary"
							>
								<option value="">Escolha um responsável</option>
							</select>
						</div>
					{/if}

					<div>
						<label class="block text-sm font-medium mb-1">Assunto</label>
						<input
							bind:value={assuntoMsg}
							class="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary"
							placeholder="Ex: Reunião de pais, Atividade especial..."
						/>
					</div>

					<div>
						<label class="block text-sm font-medium mb-1">Mensagem</label>
						<textarea
							bind:value={conteudoMsg}
							rows="6"
							class="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary"
							placeholder="Digite sua mensagem aqui..."
						></textarea>
					</div>

					<div class="flex items-center gap-2">
						<input bind:checked={urgente} id="urgente" type="checkbox" class="w-4 h-4 accent-primary" />
						<label for="urgente" class="text-sm">Marcar como urgente</label>
					</div>

					<button
						type="submit"
						class="w-full py-3 px-4 rounded-lg bg-primary hover:bg-primary-dark text-white transition"
					>
						Enviar Mensagem
					</button>
				</form>
			</div>

			<!-- Histórico de Mensagens -->
			<div>
				<h3 class="font-semibold mb-3">Mensagens Enviadas</h3>
				<div class="space-y-3 max-h-96 overflow-y-auto">
					<div class="text-center text-slate-500 py-4">Nenhuma mensagem enviada</div>
				</div>
			</div>
		</div>
	{/if}

	{#if activeTab === 'avisos'}
		<div class="grid lg:grid-cols-2 gap-6">
			<!-- Criar Aviso -->
			<div>
				<h3 class="font-semibold mb-3">Criar Aviso Geral</h3>
				<form on:submit={handleCriarAviso} class="space-y-4">
					<div>
						<label class="block text-sm font-medium mb-1">Tipo de aviso</label>
						<select
							bind:value={tipoAviso}
							class="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary"
						>
							<option value="informativo">Informativo</option>
							<option value="importante">Importante</option>
							<option value="urgente">Urgente</option>
							<option value="evento">Evento</option>
						</select>
					</div>

					<div>
						<label class="block text-sm font-medium mb-1">Título do aviso</label>
						<input
							bind:value={tituloAviso}
							class="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary"
							placeholder="Ex: Reunião de pais, Feriado..."
						/>
					</div>

					<div>
						<label class="block text-sm font-medium mb-1">Conteúdo</label>
						<textarea
							bind:value={conteudoAviso}
							rows="6"
							class="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary"
							placeholder="Descreva o aviso..."
						></textarea>
					</div>

					<div>
						<label class="block text-sm font-medium mb-1">Data de validade (opcional)</label>
						<input
							bind:value={validadeAviso}
							type="date"
							class="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary"
						/>
					</div>

					<button
						type="submit"
						class="w-full py-3 px-4 rounded-lg bg-primary hover:bg-primary-dark text-white transition"
					>
						Publicar Aviso
					</button>
				</form>
			</div>

			<!-- Lista de Avisos -->
			<div>
				<h3 class="font-semibold mb-3">Avisos Ativos</h3>
				<div class="space-y-3 max-h-96 overflow-y-auto">
					<div class="text-center text-slate-500 py-4">Nenhum aviso ativo</div>
				</div>
			</div>
		</div>
	{/if}
</section>

