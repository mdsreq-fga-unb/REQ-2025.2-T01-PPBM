<script lang="ts">
	let tipoRelatorio = 'presencas';
	let dataInicio = '';
	let dataFim = '';
	let relTurma = '';

	function handleGerarRelatorio() {
		alert('Funcionalidade em desenvolvimento. O relatório será gerado em breve.');
	}

	function handleExportarRelatorio() {
		alert('Funcionalidade em desenvolvimento. A exportação será implementada em breve.');
	}
</script>

<section id="relatorios" class="bg-white rounded-3xl p-6 soft-shadow border border-slate-200">
	<div class="flex items-center justify-between mb-4">
		<h2 class="text-xl font-semibold">Relatórios</h2>
		<div class="flex gap-2">
			<button
				on:click={handleGerarRelatorio}
				class="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white transition"
			>
				Gerar
			</button>
			<button
				on:click={handleExportarRelatorio}
				class="px-4 py-2 rounded-lg bg-[#E11D48] hover:bg-[#BE123C] text-white transition"
			>
				Exportar
			</button>
		</div>
	</div>

	<div class="grid md:grid-cols-4 gap-4 mb-4">
		<div>
			<label class="block text-sm font-medium mb-1">Tipo de relatório</label>
			<select
				bind:value={tipoRelatorio}
				class="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#E11D48]"
			>
				<option value="presencas">Presenças por período</option>
				<option value="individual">Relatório individual</option>
				<option value="turma">Resumo por turma</option>
				<option value="medico">Condições médicas</option>
			</select>
		</div>
		<div>
			<label class="block text-sm font-medium mb-1">Data inicial</label>
			<input
				bind:value={dataInicio}
				type="date"
				class="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#E11D48]"
			/>
		</div>
		<div>
			<label class="block text-sm font-medium mb-1">Data final</label>
			<input
				bind:value={dataFim}
				type="date"
				class="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#E11D48]"
			/>
		</div>
		<div>
			<label class="block text-sm font-medium mb-1">Turma</label>
			<select
				bind:value={relTurma}
				class="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#E11D48]"
			>
				<option value="">Todas</option>
				<option value="turma-a">Turma A - Manhã</option>
				<option value="turma-b">Turma B - Tarde</option>
				<option value="turma-c">Turma C - Integral</option>
			</select>
		</div>
	</div>

	<div id="relatorioConteudo" class="overflow-x-auto">
		<div class="text-center py-8 text-slate-500">
			Selecione os filtros e clique em "Gerar" para visualizar o relatório
		</div>
	</div>
</section>

