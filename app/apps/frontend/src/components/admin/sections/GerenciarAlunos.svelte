<script lang="ts">
	import { onMount } from "svelte";
	import Toast from "../../ui/Toast.svelte";
	import ConfirmDialog from "../../ui/ConfirmDialog.svelte";
	import { apiFetch } from "../../../lib/api";

	interface Responsavel {
		id_responsavel: number;
		nome_responsavel: string;
		telefone_responsavel: string;
		email_responsavel: string;
	}

	interface Turma {
		id_turma: number;
		nome_turma: string;
		unidade_turma: string;
	}

	interface TurmaOption {
		id_turma: number;
		nome_turma: string;
		unidade_turma: string;
	}

	interface Aluno {
		id_aluno: number;
		nome_aluno: string;
		cpf_aluno: string;
		neurodivergente: boolean;
		alunos_por_turma: Array<{
			id_turma: number;
			turmas: Turma | null;
		}>;
		responsaveis_por_alunos: Array<{
			id_responsavel: number;
			responsaveis: Responsavel | null;
		}>;
	}

	let alunos: Aluno[] = [];
	let turmasOptions: TurmaOption[] = [];
	let loading = false;
	let loadingTurmas = false;

	let buscaGerenciar = "";
	let filtroTurmaGerenciar = "";
	let filtroStatus = "";

	// Pagination
	let currentPage = 1;
	let pageSize = 20;
	let total = 0;

	// Toast state
	let toastMessage = "";
	let toastType: "success" | "error" | "warning" | "info" = "info";
	let showToast = false;

	// Confirm dialog state
	let showConfirmDialog = false;
	let confirmDialogAction: (() => void) | null = null;
	let alunoToDelete: Aluno | null = null;
	let deletingAluno = false;

	function displayToast(
		message: string,
		type: "success" | "error" | "warning" | "info" = "info",
	) {
		toastMessage = message;
		toastType = type;
		showToast = true;
	}

	async function loadTurmas() {
		loadingTurmas = true;
		try {
			const response = await apiFetch<{ data: TurmaOption[] }>(
				"/turmas/listar?pageSize=100",
			);
			if (response.success) {
				turmasOptions = response.data?.data || [];
			}
		} catch (error) {
			console.error("Erro ao carregar turmas:", error);
		} finally {
			loadingTurmas = false;
		}
	}

	async function loadAlunos() {
		loading = true;
		try {
			let url = `/alunos/listar?page=${currentPage}&pageSize=${pageSize}`;

			if (buscaGerenciar.trim()) {
				url += `&nome=${encodeURIComponent(buscaGerenciar.trim())}`;
			}

			if (filtroTurmaGerenciar) {
				url += `&turmaId=${filtroTurmaGerenciar}`;
			}

			if (filtroStatus === "medico") {
				url += `&neurodivergente=true`;
			} else if (filtroStatus === "normal") {
				url += `&neurodivergente=false`;
			}

			const response = await apiFetch<{
				data: Aluno[];
				total: number;
				page: number;
				pageSize: number;
			}>(url);

			if (response.success) {
				alunos = response.data?.data || [];
				total = response.data?.total || 0;
			} else {
				displayToast("Erro ao carregar alunos", "error");
			}
		} catch (error) {
			console.error("Erro ao carregar alunos:", error);
			displayToast("Erro ao carregar alunos", "error");
		} finally {
			loading = false;
		}
	}

	function handleSearch() {
		currentPage = 1;
		loadAlunos();
	}

	function handleExportar() {
		displayToast(
			"Funcionalidade em desenvolvimento. A exportação será implementada em breve.",
			"info",
		);
	}

	function handleEditar(aluno: Aluno) {
		displayToast(
			`Funcionalidade em desenvolvimento. Edição do aluno ${aluno.nome_aluno} será implementada em breve.`,
			"info",
		);
	}

	function handleRemover(aluno: Aluno) {
		alunoToDelete = aluno;
		confirmDialogAction = async () => {
			if (!alunoToDelete) return;

			deletingAluno = true;
			try {
				const response = await apiFetch(
					`/alunos/deletar/${alunoToDelete.id_aluno}`,
					{ method: "DELETE" },
				);

				if (response.success) {
					displayToast("Aluno removido com sucesso!", "success");
					loadAlunos();
				} else {
					displayToast(
						response.error || "Erro ao remover aluno",
						"error",
					);
				}
			} catch (error) {
				console.error("Erro ao remover aluno:", error);
				displayToast("Erro ao remover aluno", "error");
			} finally {
				deletingAluno = false;
				showConfirmDialog = false;
				alunoToDelete = null;
			}
		};
		showConfirmDialog = true;
	}

	function getTurmaDisplay(aluno: Aluno): string {
		const turmas = aluno.alunos_por_turma
			?.map((apt) => apt.turmas?.nome_turma)
			.filter(Boolean);
		return turmas?.length ? turmas.join(", ") : "-";
	}

	function getResponsavelDisplay(aluno: Aluno): {
		nome: string;
		contato: string;
	} {
		const responsavel = aluno.responsaveis_por_alunos?.[0]?.responsaveis;
		if (!responsavel) {
			return { nome: "-", contato: "-" };
		}
		return {
			nome: responsavel.nome_responsavel || "-",
			contato:
				responsavel.telefone_responsavel ||
				responsavel.email_responsavel ||
				"-",
		};
	}

	function formatCPF(cpf: string): string {
		if (!cpf) return "-";
		const cleaned = cpf.replace(/\D/g, "");
		if (cleaned.length !== 11) return cpf;
		return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
	}

	// Reactive search with debounce
	let searchTimeout: ReturnType<typeof setTimeout>;
	$: {
		if (buscaGerenciar !== undefined) {
			clearTimeout(searchTimeout);
			searchTimeout = setTimeout(() => {
				handleSearch();
			}, 300);
		}
	}

	$: if (filtroTurmaGerenciar !== undefined || filtroStatus !== undefined) {
		currentPage = 1;
		loadAlunos();
	}

	onMount(async () => {
		await Promise.all([loadTurmas(), loadAlunos()]);
	});
</script>

<section
	id="gerenciar"
	class="bg-white rounded-3xl p-6 soft-shadow border border-slate-200"
>
	<div class="flex items-center justify-between mb-6">
		<div>
			<h2 class="text-2xl font-bold text-slate-900 mb-1">
				Gerenciar Alunos
			</h2>
			<p class="text-slate-500">
				Busque, edite e remova alunos do sistema
			</p>
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
			<label for="busca-aluno" class="block text-sm font-medium mb-1"
				>Buscar aluno</label
			>
			<input
				id="busca-aluno"
				bind:value={buscaGerenciar}
				class="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#E11D48]"
				placeholder="Nome do aluno..."
			/>
		</div>
		<div>
			<label for="filtro-turma" class="block text-sm font-medium mb-1"
				>Filtrar por turma</label
			>
			<select
				id="filtro-turma"
				bind:value={filtroTurmaGerenciar}
				class="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#E11D48]"
			>
				<option value="">Todas as turmas</option>
				{#each turmasOptions as turma}
					<option value={turma.id_turma}>
						{turma.nome_turma}
						{turma.unidade_turma ? `- ${turma.unidade_turma}` : ""}
					</option>
				{/each}
			</select>
		</div>
		<div>
			<label for="filtro-status" class="block text-sm font-medium mb-1"
				>Status especial</label
			>
			<select
				id="filtro-status"
				bind:value={filtroStatus}
				class="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#E11D48]"
			>
				<option value="">Todos</option>
				<option value="medico">Neurodivergente</option>
				<option value="normal">Sem acompanhamento</option>
			</select>
		</div>
	</div>

	<!-- Lista de Alunos -->
	<div class="overflow-x-auto">
		<table
			class="w-full border border-slate-200 rounded-xl overflow-hidden"
		>
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
				{#if loading}
					<tr>
						<td colspan="7" class="p-6 text-center text-slate-500">
							<div class="flex items-center justify-center gap-2">
								<span class="loading-spinner"></span>
								Carregando alunos...
							</div>
						</td>
					</tr>
				{:else if alunos.length === 0}
					<tr>
						<td colspan="7" class="p-6 text-center text-slate-500">
							Nenhum aluno encontrado.
						</td>
					</tr>
				{:else}
					{#each alunos as aluno (aluno.id_aluno)}
						{@const responsavel = getResponsavelDisplay(aluno)}
						<tr class="border-t border-slate-100 hover:bg-slate-50">
							<td class="p-3">
								<div class="font-medium text-slate-900">
									{aluno.nome_aluno || "-"}
								</div>
							</td>
							<td class="p-3 text-slate-600">
								{formatCPF(aluno.cpf_aluno)}
							</td>
							<td class="p-3 text-slate-600">
								{getTurmaDisplay(aluno)}
							</td>
							<td class="p-3 text-slate-600">
								{responsavel.nome}
							</td>
							<td class="p-3 text-slate-600">
								{responsavel.contato}
							</td>
							<td class="p-3">
								{#if aluno.neurodivergente}
									<span
										class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
									>
										📚 Acomp. Especial
									</span>
								{:else}
									<span
										class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
									>
										✓ Regular
									</span>
								{/if}
							</td>
							<td class="p-3">
								<div class="flex gap-2">
									<button
										on:click={() => handleEditar(aluno)}
										class="px-3 py-1 text-xs rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 transition"
									>
										Editar
									</button>
									<button
										on:click={() => handleRemover(aluno)}
										class="px-3 py-1 text-xs rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition"
									>
										Remover
									</button>
								</div>
							</td>
						</tr>
					{/each}
				{/if}
			</tbody>
		</table>
	</div>

	<!-- Pagination info -->
	{#if !loading && alunos.length > 0}
		<div class="mt-4 text-sm text-slate-500 text-right">
			Mostrando {alunos.length} de {total} alunos
		</div>
	{/if}
</section>

<!-- Toast notifications -->
<Toast bind:show={showToast} message={toastMessage} type={toastType} />

<!-- Confirm dialog -->
<ConfirmDialog
	bind:show={showConfirmDialog}
	title="Remover Aluno"
	message={alunoToDelete
		? `Tem certeza que deseja remover o aluno <strong>${alunoToDelete.nome_aluno}</strong>? Esta ação não pode ser desfeita.`
		: "Tem certeza que deseja remover este aluno?"}
	confirmText="Remover"
	cancelText="Cancelar"
	confirmVariant="danger"
	loading={deletingAluno}
	on:confirm={() => {
		if (confirmDialogAction) confirmDialogAction();
	}}
	on:cancel={() => {
		showConfirmDialog = false;
		confirmDialogAction = null;
		alunoToDelete = null;
	}}
/>

<style>
	.loading-spinner {
		display: inline-block;
		width: 20px;
		height: 20px;
		border: 2px solid #e2e8f0;
		border-top-color: #e11d48;
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
</style>
