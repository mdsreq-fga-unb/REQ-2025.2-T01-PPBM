<script lang="ts">
	let turmaPresenca = '';
	let dataPresenca = new Date().toISOString().slice(0, 10);
	let totalHoje = 0;
	let presentesHoje = 0;
	let atrasosHoje = 0;
	let faltasHoje = 0;

	function handleSalvarPresencas() {
		alert('Funcionalidade em desenvolvimento. As presenças serão salvas em breve.');
	}
</script>

<section id="presencas" class="bg-white rounded-3xl p-6 soft-shadow border border-slate-200">
	<div class="flex flex-col lg:flex-row lg:items-end gap-4 mb-6">
		<div class="flex-1">
			<h2 class="text-2xl font-bold text-slate-900 mb-1">Controle de Presenças</h2>
			<p class="text-slate-500">Registre presença, falta ou atraso por turma</p>
		</div>
		<div class="flex flex-col sm:flex-row gap-3">
			<div>
				<label class="block text-sm font-medium mb-1">Turma</label>
				<select
					bind:value={turmaPresenca}
					class="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary"
				>
					<option value="">Selecione uma turma</option>
					<option value="turma-a">Turma A - Manhã</option>
					<option value="turma-b">Turma B - Tarde</option>
					<option value="turma-c">Turma C - Integral</option>
				</select>
			</div>
			<div>
				<label class="block text-sm font-medium mb-1">Data</label>
				<input
					bind:value={dataPresenca}
					type="date"
					class="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary"
				/>
			</div>
			<div class="flex items-end">
				<button
					on:click={handleSalvarPresencas}
					class="w-full px-6 py-2 rounded-lg bg-primary hover:bg-primary-dark text-white transition whitespace-nowrap"
				>
					Salvar Presenças
				</button>
			</div>
		</div>
	</div>

	<!-- Resumo Rápido -->
	<div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
		<div class="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white text-center">
			<div class="text-2xl font-bold">{totalHoje}</div>
			<div class="text-sm opacity-90">Total Hoje</div>
		</div>
		<div class="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 text-white text-center">
			<div class="text-2xl font-bold">{presentesHoje}</div>
			<div class="text-sm opacity-90">Presentes</div>
		</div>
		<div class="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl p-4 text-white text-center">
			<div class="text-2xl font-bold">{atrasosHoje}</div>
			<div class="text-sm opacity-90">Atrasos</div>
		</div>
		<div class="bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-4 text-white text-center">
			<div class="text-2xl font-bold">{faltasHoje}</div>
			<div class="text-sm opacity-90">Faltas</div>
		</div>
	</div>

	<div class="overflow-x-auto">
		<table class="w-full border border-slate-200 rounded-xl overflow-hidden">
			<thead class="bg-slate-50">
				<tr class="text-left text-sm">
					<th class="p-4">Criança</th>
					<th class="p-4">Status</th>
					<th class="p-4">Observações</th>
				</tr>
			</thead>
			<tbody id="tabelaPresencas" class="text-sm">
				<tr>
					<td colspan="3" class="p-4 text-center text-slate-500">
						Selecione uma turma para visualizar as crianças
					</td>
				</tr>
			</tbody>
		</table>
	</div>
</section>

