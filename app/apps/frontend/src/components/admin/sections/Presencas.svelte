<script lang="ts">
	import Toast from '../../ui/Toast.svelte';

	let turmaPresenca = '';
	let dataPresenca = new Date().toISOString().slice(0, 10);
	let totalHoje = 0;
	let presentesHoje = 0;
	let atrasosHoje = 0;
	let faltasHoje = 0;

	// Toast state
	let toastMessage = '';
	let toastType: 'success' | 'error' | 'warning' | 'info' = 'info';
	let showToast = false;

	function displayToast(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') {
		toastMessage = message;
		toastType = type;
		showToast = true;
	}

	function handleSalvarPresencas() {
		displayToast('Funcionalidade em desenvolvimento. As presenças serão salvas em breve.', 'info');
	}
</script>

	<section id="presencas" class="w-full h-full bg-white p-6 rounded-3xl shadow-lg border border-slate-200 mx-auto transition-all duration-300">
	<!-- Layout de duas colunas -->
	<div class="flex flex-col lg:flex-row gap-6 mb-6">
		<!-- Coluna esquerda: Título e descrição -->
		<div class="flex flex-col justify-center lg:w-1/3">
			<h2 class="text-2xl font-bold text-slate-900 mb-2">Controle de Presenças</h2>
			<p class="text-slate-500">Registre presença, falta ou atraso por turma</p>
		</div>

		<!-- Coluna direita: Formulário -->
		<div class="flex flex-col md:flex-row gap-4 md:items-end lg:w-2/3">
		<div class="flex flex-col w-full md:w-1/3">
			<label for="turma" class="text-slate-600 mb-1 font-medium">Turma</label>
			<select
				id="turma"
				bind:value={turmaPresenca}
				class="border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-[#E11D48] focus:outline-none"
			>
				<option value="">Selecione</option>
				<option value="turma-a">Turma A - Manhã</option>
				<option value="turma-b">Turma B - Tarde</option>
				<option value="turma-c">Turma C - Integral</option>
			</select>
		</div>

		<div class="flex flex-col w-full md:w-1/3">
			<label for="data" class="text-slate-600 mb-1 font-medium">Data</label>
			<input
				id="data"
				type="date"
				bind:value={dataPresenca}
				class="border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-[#E11D48] focus:outline-none"
			/>
		</div>

			<button
				on:click={handleSalvarPresencas}
				class="bg-[#E11D48] hover:bg-[#BE123C] text-white font-semibold px-5 py-3 rounded-xl transition-colors duration-200 w-full md:w-auto"
			>
				Salvar Presenças
			</button>
		</div>
	</div>

	<!-- Cards de status -->
	<div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
		<div class="rounded-2xl p-4 text-center text-white font-semibold bg-blue-500 shadow-md">
			<p class="text-2xl">{totalHoje}</p>
			<p class="text-sm opacity-90">Total Hoje</p>
		</div>
		<div class="rounded-2xl p-4 text-center text-white font-semibold bg-green-500 shadow-md">
			<p class="text-2xl">{presentesHoje}</p>
			<p class="text-sm opacity-90">Presentes</p>
		</div>
		<div class="rounded-2xl p-4 text-center text-white font-semibold bg-amber-500 shadow-md">
			<p class="text-2xl">{atrasosHoje}</p>
			<p class="text-sm opacity-90">Atrasos</p>
		</div>
		<div class="rounded-2xl p-4 text-center text-white font-semibold bg-red-500 shadow-md">
			<p class="text-2xl">{faltasHoje}</p>
			<p class="text-sm opacity-90">Faltas</p>
		</div>
	</div>

	<!-- Tabela -->
	<div class="overflow-x-auto rounded-2xl border border-slate-200">
		<table class="w-full text-left border-collapse">
			<thead class="bg-slate-50 text-slate-600 text-sm">
				<tr>
					<th class="p-3">Criança</th>
					<th class="p-3">Status</th>
					<th class="p-3">Observações</th>
				</tr>
			</thead>
			<tbody class="text-slate-700">
				<tr>
					<td colspan="3" class="p-4 text-center text-slate-500">
						Selecione uma turma para visualizar as crianças
					</td>
				</tr>
			</tbody>
		</table>
	</div>
</section>

<!-- Toast notifications -->
<Toast 
	bind:show={showToast} 
	message={toastMessage} 
	type={toastType} 
/>

<style>
	@media (max-width: 768px) {
		button {
			align-self: stretch;
		}
	}
</style>

