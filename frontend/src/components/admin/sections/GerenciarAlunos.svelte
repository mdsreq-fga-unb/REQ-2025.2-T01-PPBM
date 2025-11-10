<script lang="ts">
	let buscaGerenciar = '';
	let filtroTurmaGerenciar = '';
	let filtroStatus = '';

	function handleExportar() {
		alert('Funcionalidade em desenvolvimento. A exportação será implementada em breve.');
	}

	function handleEditar(id: string) {
		alert(`Funcionalidade em desenvolvimento. Edição do aluno ${id} será implementada em breve.`);
	}

	function handleRemover(id: string) {
		if (confirm('Tem certeza que deseja remover este aluno?')) {
			alert('Funcionalidade em desenvolvimento. A remoção será implementada em breve.');
		}
	}
</script>

<section id="gerenciar" class="bg-white rounded-3xl p-6 soft-shadow border border-slate-200">
	<div class="flex items-center justify-between mb-6">
		<div>
			<h2 class="text-2xl font-bold text-slate-900 mb-1">Gerenciar Alunos</h2>
			<p class="text-slate-500">Busque, edite e remova alunos do sistema</p>
		</div>
		<button
			on:click={handleExportar}
			class="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white transition"
		>
			Exportar Lista
		</button>
	</div>

	<!-- Filtros de Busca -->
	<div class="grid md:grid-cols-4 gap-4 mb-6">
		<div class="md:col-span-2">
			<label class="block text-sm font-medium mb-1">Buscar aluno</label>
			<input
				bind:value={buscaGerenciar}
				class="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary"
				placeholder="Nome, CPF ou responsável..."
			/>
		</div>
		<div>
			<label class="block text-sm font-medium mb-1">Filtrar por turma</label>
			<select
				bind:value={filtroTurmaGerenciar}
				class="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary"
			>
				<option value="">Todas as turmas</option>
				<option value="turma-a">Turma A - Manhã</option>
				<option value="turma-b">Turma B - Tarde</option>
				<option value="turma-c">Turma C - Integral</option>
			</select>
		</div>
		<div>
			<label class="block text-sm font-medium mb-1">Status especial</label>
			<select
				bind:value={filtroStatus}
				class="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary"
			>
				<option value="">Todos</option>
				<option value="medico">Com alerta médico</option>
				<option value="pedagogico">Acompanhamento pedagógico</option>
				<option value="normal">Sem alertas</option>
			</select>
		</div>
	</div>

	<!-- Lista de Alunos -->
	<div class="overflow-x-auto">
		<table class="w-full border border-slate-200 rounded-xl overflow-hidden">
			<thead class="bg-slate-50">
				<tr class="text-left text-sm">
					<th class="p-3">Aluno</th>
					<th class="p-3">CPF</th>
					<th class="p-3">Turma</th>
					<th class="p-3">Responsável</th>
					<th class="p-3">Contato</th>
					<th class="p-3">Status</th>
					<th class="p-3">Ações</th>
				</tr>
			</thead>
			<tbody id="listaAlunosGerenciar" class="text-sm">
				<tr>
					<td colspan="7" class="p-3 text-center text-slate-500">
						Nenhum aluno encontrado. Funcionalidade em desenvolvimento.
					</td>
				</tr>
			</tbody>
		</table>
	</div>
</section>

