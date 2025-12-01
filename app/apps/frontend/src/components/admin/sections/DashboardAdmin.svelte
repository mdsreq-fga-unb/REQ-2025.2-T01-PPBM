<script lang="ts">
	let totalAlunos = 0;
	let presencaMedia = '0%';
	let alertasMedicos = 0;
	let acompanhamentoEspecial = 0;

	function handleAtualizar() {
		alert('Funcionalidade em desenvolvimento. Os dados serão atualizados em breve.');
	}
</script>

<section id="dashboard" class="bg-white rounded-3xl p-6 soft-shadow border border-slate-200">
	<div class="flex items-center justify-between mb-4">
		<h2 class="text-xl font-semibold">Dashboard</h2>
		<button
			on:click={handleAtualizar}
			class="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white transition"
		>
			Atualizar
		</button>
	</div>

	<!-- KPIs -->
	<div class="grid md:grid-cols-4 gap-4 mb-6">
		<div class="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white">
			<div class="text-2xl font-bold">{totalAlunos}</div>
			<div class="text-sm opacity-90">Total de Alunos</div>
		</div>
		<div class="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 text-white">
			<div class="text-2xl font-bold">{presencaMedia}</div>
			<div class="text-sm opacity-90">Taxa de Presença</div>
		</div>
		<div class="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl p-4 text-white">
			<div class="text-2xl font-bold">{alertasMedicos}</div>
			<div class="text-sm opacity-90">Alertas Médicos</div>
		</div>
		<div class="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-4 text-white">
			<div class="text-2xl font-bold">{acompanhamentoEspecial}</div>
			<div class="text-sm opacity-90">Acompanhamento Especial</div>
		</div>
	</div>

	<!-- Resumo por Turma -->
	<div class="grid lg:grid-cols-2 gap-6">
		<div class="border rounded-2xl p-4 border-slate-200">
			<h3 class="font-semibold mb-3">Resumo por Turma</h3>
			<div class="space-y-3">
				<div class="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
					<div>
						<div class="font-medium">Turma A - Manhã</div>
						<div class="text-sm text-slate-500">0 alunos</div>
					</div>
					<div class="text-right">
						<div class="text-sm text-green-600">Sem alertas</div>
					</div>
				</div>
				<div class="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
					<div>
						<div class="font-medium">Turma B - Tarde</div>
						<div class="text-sm text-slate-500">0 alunos</div>
					</div>
					<div class="text-right">
						<div class="text-sm text-green-600">Sem alertas</div>
					</div>
				</div>
				<div class="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
					<div>
						<div class="font-medium">Turma C - Integral</div>
						<div class="text-sm text-slate-500">0 alunos</div>
					</div>
					<div class="text-right">
						<div class="text-sm text-green-600">Sem alertas</div>
					</div>
				</div>
			</div>
		</div>
		<div class="border rounded-2xl p-4 border-slate-200">
			<h3 class="font-semibold mb-3">Últimas Atividades</h3>
			<div class="space-y-3">
				<div class="text-center text-slate-500 py-4">Nenhuma atividade recente</div>
			</div>
		</div>
	</div>
</section>

