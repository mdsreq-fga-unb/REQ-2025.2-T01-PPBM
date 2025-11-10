<script lang="ts">
	let nome = '';
	let cpf = '';
	let nascimento = '';
	let escola = '';
	let turmaSelect = '';
	let idInterno = '';
	let nomeResp = '';
	let contatoResp = '';
	let parentesco = '';
	let condicaoMedica = 'normal';
	let alergias = '';
	let obsMedicas = '';
	let acompanhamento = false;
	let tipoAcompanhamento = '';
	let obsAcompanhamento = '';
	let mostrarAlertaMedico = false;
	let mostrarAcompanhamentoExtra = false;

	function handleNovo() {
		nome = '';
		cpf = '';
		nascimento = '';
		escola = '';
		turmaSelect = '';
		idInterno = '';
		nomeResp = '';
		contatoResp = '';
		parentesco = '';
		condicaoMedica = 'normal';
		alergias = '';
		obsMedicas = '';
		acompanhamento = false;
		tipoAcompanhamento = '';
		obsAcompanhamento = '';
		mostrarAlertaMedico = false;
		mostrarAcompanhamentoExtra = false;
	}

	function handleSalvar() {
		alert('Funcionalidade em desenvolvimento. O cadastro será salvo em breve.');
	}

	$: {
		const condicoesCriticas = ['asma', 'diabetes', 'epilepsia', 'cardiopatia'];
		mostrarAlertaMedico = condicoesCriticas.includes(condicaoMedica);
		mostrarAcompanhamentoExtra = acompanhamento;
	}
</script>

<section id="cadastro" class="bg-white rounded-3xl p-6 soft-shadow border border-slate-200">
	<div class="flex items-center justify-between mb-6">
		<div>
			<h2 class="text-2xl font-bold text-slate-900 mb-1">Cadastro de Crianças</h2>
			<p class="text-slate-500">Gerencie os dados das crianças do programa</p>
		</div>
		<div class="flex gap-2">
			<button
				on:click={handleNovo}
				class="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white transition"
			>
				Novo
			</button>
			<button
				on:click={handleSalvar}
				class="px-4 py-2 rounded-lg bg-primary hover:bg-primary-dark text-white transition"
			>
				Salvar
			</button>
		</div>
	</div>

	<form class="grid md:grid-cols-2 gap-4 mb-8" autocomplete="off">
		<input type="hidden" bind:value={idInterno} />

		<!-- Dados Básicos -->
		<div class="md:col-span-2 border-b pb-4 mb-4">
			<h3 class="font-semibold mb-3 text-primary">Dados Básicos</h3>
			<div class="grid md:grid-cols-3 gap-4">
				<div>
					<label class="block text-sm font-medium mb-1">Nome completo *</label>
					<input
						bind:value={nome}
						required
						class="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary"
						placeholder="Ex.: Ana Pereira"
					/>
				</div>
				<div>
					<label class="block text-sm font-medium mb-1">CPF da criança *</label>
					<input
						bind:value={cpf}
						required
						class="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary"
						placeholder="000.000.000-00"
						maxlength="14"
					/>
					<div class="text-red-500 text-xs mt-1 hidden">CPF inválido</div>
				</div>
				<div>
					<label class="block text-sm font-medium mb-1">Data de nascimento *</label>
					<input
						bind:value={nascimento}
						type="date"
						required
						class="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary"
					/>
					<div class="text-red-500 text-xs mt-1 hidden">Criança deve ter entre 7 e 14 anos</div>
				</div>
				<div>
					<label class="block text-sm font-medium mb-1">Escola</label>
					<input
						bind:value={escola}
						class="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary"
						placeholder="Nome da escola"
					/>
				</div>
				<div>
					<label class="block text-sm font-medium mb-1">Turma *</label>
					<select
						bind:value={turmaSelect}
						required
						class="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary"
					>
						<option value="">Selecione uma turma</option>
						<option value="turma-a">Turma A - Manhã</option>
						<option value="turma-b">Turma B - Tarde</option>
						<option value="turma-c">Turma C - Integral</option>
					</select>
				</div>
				<div>
					<label class="block text-sm font-medium mb-1">ID interno</label>
					<input
						bind:value={idInterno}
						disabled
						class="w-full px-4 py-2 rounded-lg border border-slate-200 bg-slate-50"
						placeholder="Gerado automaticamente"
					/>
				</div>
			</div>
		</div>

		<!-- Responsável Principal -->
		<div class="md:col-span-2 border-b pb-4 mb-4">
			<h3 class="font-semibold mb-3 text-primary">Responsável Principal</h3>
			<div class="grid md:grid-cols-3 gap-4">
				<div>
					<label class="block text-sm font-medium mb-1">Nome completo *</label>
					<input
						bind:value={nomeResp}
						required
						class="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary"
						placeholder="Nome do responsável"
					/>
				</div>
				<div>
					<label class="block text-sm font-medium mb-1">Contato *</label>
					<input
						bind:value={contatoResp}
						required
						class="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary"
						placeholder="(xx) xxxxx-xxxx"
					/>
					<div class="text-red-500 text-xs mt-1 hidden">Formato inválido</div>
				</div>
				<div>
					<label class="block text-sm font-medium mb-1">Parentesco *</label>
					<select
						bind:value={parentesco}
						required
						class="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary"
					>
						<option value="">Selecione</option>
						<option value="Pai">Pai</option>
						<option value="Mãe">Mãe</option>
						<option value="Avô">Avô</option>
						<option value="Avó">Avó</option>
						<option value="Tio">Tio</option>
						<option value="Tia">Tia</option>
						<option value="Responsável Legal">Responsável Legal</option>
					</select>
				</div>
			</div>
		</div>

		<!-- Informações Médicas -->
		<div class="md:col-span-2 border-b pb-4 mb-4">
			<h3 class="font-semibold mb-3 text-primary">Informações Médicas</h3>
			<div class="grid md:grid-cols-2 gap-4">
				<div>
					<label class="block text-sm font-medium mb-1">Condição médica</label>
					<select
						bind:value={condicaoMedica}
						class="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary"
					>
						<option value="normal">Normal</option>
						<option value="asma">Asma</option>
						<option value="diabetes">Diabetes</option>
						<option value="epilepsia">Epilepsia</option>
						<option value="cardiopatia">Cardiopatia</option>
						<option value="outras">Outras</option>
					</select>
				</div>
				<div>
					<label class="block text-sm font-medium mb-1">Alergias</label>
					<input
						bind:value={alergias}
						class="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary"
						placeholder="Ex.: poeira, lactose..."
					/>
				</div>
			</div>
			<div class="mt-3">
				<label class="block text-sm font-medium mb-1">Observações médicas importantes</label>
				<textarea
					bind:value={obsMedicas}
					rows="2"
					class="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary"
					placeholder="Informações importantes para emergências"
				></textarea>
			</div>
			{#if mostrarAlertaMedico}
				<div class="mt-3 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 alert-critical">
					⚠️ <strong>ATENÇÃO:</strong> Esta criança possui condição médica que requer cuidados
					especiais!
				</div>
			{/if}
		</div>

		<!-- Acompanhamento Especial -->
		<div class="md:col-span-2">
			<div class="flex items-center gap-3 mb-3">
				<input
					bind:checked={acompanhamento}
					id="acompanhamento"
					type="checkbox"
					class="w-5 h-5 accent-primary"
				/>
				<label for="acompanhamento" class="font-semibold text-primary"
					>Necessita acompanhamento pedagógico especial</label
				>
			</div>
			{#if mostrarAcompanhamentoExtra}
				<div class="grid md:grid-cols-2 gap-4">
					<div>
						<label class="block text-sm font-medium mb-1">Tipo de necessidade</label>
						<select
							bind:value={tipoAcompanhamento}
							class="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary"
						>
							<option value="">Selecione</option>
							<option value="autismo">Transtorno do Espectro Autista</option>
							<option value="tdah">TDAH</option>
							<option value="dislexia">Dislexia</option>
							<option value="deficiencia_intelectual">Deficiência Intelectual</option>
							<option value="outros">Outros</option>
						</select>
					</div>
					<div>
						<label class="block text-sm font-medium mb-1">Observações</label>
						<textarea
							bind:value={obsAcompanhamento}
							rows="2"
							class="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary"
							placeholder="Estratégias e cuidados especiais"
						></textarea>
					</div>
				</div>
			{/if}
		</div>
	</form>
</section>

