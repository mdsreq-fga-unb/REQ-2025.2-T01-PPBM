<script lang="ts">
    import { onMount } from "svelte";
    import DataTable from "../ui/DataTable.svelte";
    import Toast from "../ui/Toast.svelte";
    import FormSelect from "../ui/FormSelect.svelte";
    import type { Column } from "../../interfaces/table";
    import { apiFetch } from "../../lib/api";

    interface Aluno {
        id_aluno: number;
        nome_aluno: string;
        cpf_aluno: string;
        data_nascimento_aluno: string;
        escola_unidade: string;
        neurodivergente: boolean;
        alunos_por_turma?: { id_turma: number }[];
        turma_info?: Turma;
    }

    interface Turma {
        id_turma: number;
        nome_turma: string;
        unidade_turma: string;
    }

    interface EstatisticasResponse {
        success: boolean;
        aluno: any;
        estatisticas: {
            presenca: {
                totalAulas: number;
                presentes: number;
                atrasos: number;
                faltas: number;
                taxaPresenca: number;
            };
            justificativas: {
                total: number;
                aprovadas: number;
                pendentes: number;
                rejeitadas: number;
            };
            advertencias: {
                total: number;
            };
        };
    }

    let alunosData: Aluno[] = [];
    let turmas: Turma[] = [];
    let loading = true;
    let errorMessage = "";

    // Filter state
    let searchTerm = "";
    let turmaFilter = "";

    // Pagination state
    let currentPage = 1;
    let totalPages = 1;
    let totalAlunos = 0;
    const pageSize = 20;

    // Stats cache for students
    let statsCache: Map<number, EstatisticasResponse["estatisticas"]> =
        new Map();
    let loadingStats: Set<number> = new Set();

    // Toast state
    let toastMessage = "";
    let toastType: "success" | "error" | "warning" | "info" = "info";
    let showToast = false;

    function displayToast(
        message: string,
        type: "success" | "error" | "warning" | "info" = "info",
    ) {
        toastMessage = message;
        toastType = type;
        showToast = true;
    }

    function formatCPF(cpf: string | null): string {
        if (!cpf) return "-";
        const cleaned = cpf.replace(/\D/g, "");
        if (cleaned.length !== 11) return cpf;
        return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    }

    async function loadStats(alunoId: number): Promise<void> {
        if (statsCache.has(alunoId) || loadingStats.has(alunoId)) return;

        loadingStats.add(alunoId);
        loadingStats = loadingStats;

        try {
            const response = await apiFetch<EstatisticasResponse>(
                `/alunos/estatisticas/${alunoId}`,
            );
            if (response.success && response.data) {
                statsCache.set(alunoId, response.data.estatisticas);
                statsCache = statsCache;
            }
        } catch (error) {
            console.error(
                `Erro ao carregar estatísticas do aluno ${alunoId}:`,
                error,
            );
        } finally {
            loadingStats.delete(alunoId);
            loadingStats = loadingStats;
        }
    }

    function getTaxaPresenca(alunoId: number): string {
        const stats = statsCache.get(alunoId);
        if (!stats) return "-";
        return `${stats.presenca.taxaPresenca}%`;
    }

    // Define table columns
    const columns: Column[] = [
        {
            key: "aluno",
            label: "Aluno",
            sortable: true,
            render: (row: Aluno) => ({
                component: "html",
                props: {
                    html: `
                        <div class="student-info">
                            <span class="student-name">${row.nome_aluno || "-"}</span>
                            ${row.neurodivergente ? '<span class="badge-neuro">📚 Acomp. Especial</span>' : ""}
                        </div>
                    `,
                },
            }),
        },
        {
            key: "cpf",
            label: "CPF",
            render: (row: Aluno) => formatCPF(row.cpf_aluno),
        },
        {
            key: "turma",
            label: "Turma",
            render: (row: Aluno) => row.turma_info?.nome_turma || "-",
        },
        {
            key: "taxaPresenca",
            label: "Taxa de Presença",
            align: "center",
            render: (row: Aluno) => {
                const stats = statsCache.get(row.id_aluno);
                if (loadingStats.has(row.id_aluno)) {
                    return "...";
                }
                if (!stats) {
                    // Trigger async load
                    loadStats(row.id_aluno);
                    return "-";
                }
                const taxa = stats.presenca.taxaPresenca;
                return {
                    component: "badge",
                    props: {
                        variant:
                            taxa >= 75
                                ? "success"
                                : taxa >= 50
                                  ? "warning"
                                  : "danger",
                        text: `${taxa}%`,
                    },
                };
            },
        },
        {
            key: "acoes",
            label: "Ações",
            width: "min",
            render: (row: Aluno) => [
                {
                    component: "button",
                    props: {
                        variant: "primary",
                        text: "Ver Histórico",
                        onClick: () => verHistorico(row.id_aluno),
                    },
                },
            ],
        },
    ];

    // Map rows with id field for the DataTable
    $: tableRows = alunosData.map((aluno) => ({
        ...aluno,
        id: aluno.id_aluno,
    }));

    async function loadTurmas() {
        try {
            const response = await apiFetch<{ data: Turma[] }>(
                "/turmas/listar?pageSize=100",
            );
            if (response.success && response.data) {
                turmas = response.data.data || [];
            }
        } catch (error) {
            console.error("Erro ao carregar turmas:", error);
        }
    }

    async function loadAlunos() {
        loading = true;
        errorMessage = "";

        try {
            const params = new URLSearchParams();
            params.append("page", currentPage.toString());
            params.append("pageSize", pageSize.toString());

            if (searchTerm) params.append("nome", searchTerm);
            if (turmaFilter) params.append("turmaId", turmaFilter);

            const response = await apiFetch<{ data: Aluno[]; total: number }>(
                `/alunos/listar?${params}`,
            );

            if (response.success && response.data) {
                const rawAlunos = response.data.data || [];

                // Add turma_info to each aluno based on their alunos_por_turma relationship
                alunosData = rawAlunos.map((aluno: Aluno) => {
                    const turmaId = aluno.alunos_por_turma?.[0]?.id_turma;
                    const turmaInfo = turmaId
                        ? turmas.find((t) => t.id_turma === turmaId)
                        : undefined;
                    return {
                        ...aluno,
                        turma_info: turmaInfo,
                    };
                });

                totalAlunos = response.data.total || 0;
                totalPages = Math.ceil(totalAlunos / pageSize);
            } else {
                errorMessage = response.error || "Erro ao carregar alunos";
            }
        } catch (error) {
            console.error("Erro ao carregar alunos:", error);
            errorMessage =
                error instanceof Error
                    ? error.message
                    : "Erro ao carregar alunos";
        } finally {
            loading = false;
        }
    }

    function handlePageChange(event: CustomEvent<number>) {
        currentPage = event.detail;
        loadAlunos();
    }

    // Debounce search
    let searchTimeout: ReturnType<typeof setTimeout>;
    function handleSearchInput() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            currentPage = 1;
            loadAlunos();
        }, 300);
    }

    function handleFilterChange() {
        currentPage = 1;
        loadAlunos();
    }

    function verHistorico(id: number) {
        window.location.href = `/docente/alunos/${id}`;
    }

    onMount(async () => {
        await loadTurmas();
        await loadAlunos();
    });
</script>

<div class="consulta-alunos">
    <!-- Page Header -->
    <div class="page-header">
        <div class="title">
            <h1>Consultar Alunos</h1>
            <p>Pesquise e visualize o histórico de frequência dos alunos</p>
        </div>
    </div>

    {#if errorMessage}
        <div class="error-state">
            {errorMessage}
        </div>
    {/if}

    <!-- Filters -->
    <div class="filters-section">
        <div class="filter-group full-width">
            <label for="buscar">Buscar aluno</label>
            <input
                type="text"
                id="buscar"
                bind:value={searchTerm}
                on:input={handleSearchInput}
                placeholder="Nome ou CPF do aluno..."
            />
        </div>
        <FormSelect
            id="turma"
            label="Filtrar por turma"
            bind:value={turmaFilter}
            on:change={handleFilterChange}
        >
            <option value="">Todas as turmas</option>
            {#each turmas as turma}
                <option value={turma.id_turma}>
                    {turma.nome_turma} - {turma.unidade_turma || "Sem unidade"}
                </option>
            {/each}
        </FormSelect>
    </div>

    <!-- Results info -->
    <div class="results-info">
        <span>{totalAlunos} aluno(s) encontrado(s)</span>
    </div>

    <!-- Table -->
    <DataTable
        {columns}
        rows={tableRows}
        {loading}
        keyField="id"
        emptyMessage="Nenhum aluno encontrado com os filtros selecionados."
        loadingMessage="Carregando alunos..."
        showPagination={true}
        {currentPage}
        {totalPages}
        pageInfo="Página {currentPage} de {totalPages}"
        on:pageChange={handlePageChange}
    />
</div>

<!-- Toast Notification -->
<Toast bind:show={showToast} message={toastMessage} type={toastType} />

<style>
    .consulta-alunos {
        width: 100%;
    }

    .page-header {
        margin-bottom: 2rem;
        padding-bottom: 1.5rem;
        border-bottom: 2px solid #e2e8f0;
    }

    .page-header h1 {
        font-size: 1.8rem;
        margin: 0 0 0.5rem 0;
        color: #2d3748;
    }

    .page-header p {
        font-size: 1rem;
        margin: 0;
        color: #718096;
    }

    .error-state {
        text-align: center;
        padding: 2rem 1rem;
        color: #c53030;
        background-color: #fed7d7;
        border-radius: 8px;
        margin-bottom: 1rem;
    }

    .filters-section {
        display: flex;
        gap: 1rem;
        margin-bottom: 1.5rem;
        flex-wrap: wrap;
    }

    .filter-group {
        display: flex;
        flex-direction: column;
        flex: 1;
        min-width: 200px;
    }

    .filter-group.full-width {
        flex: 2;
    }

    .filter-group label {
        font-size: 0.9rem;
        margin-bottom: 0.5rem;
        color: #718096;
        font-weight: 500;
    }

    .filter-group input {
        padding: 0.75rem;
        border: 1px solid #cbd5e0;
        border-radius: 6px;
        font-size: 1rem;
        color: #2d3748;
        background-color: #fdfdfd;
    }

    .filter-group input:focus {
        outline: none;
        border-color: #3182ce;
        box-shadow: 0 0 0 2px rgba(49, 130, 206, 0.2);
    }

    .results-info {
        margin-bottom: 1rem;
        color: #718096;
        font-size: 0.9rem;
    }

    /* Custom styles for student info in table */
    :global(.student-info) {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
    }

    :global(.student-name) {
        font-weight: 600;
        color: #2d3748;
    }

    :global(.badge-neuro) {
        display: inline-block;
        font-size: 0.75rem;
        padding: 0.15rem 0.5rem;
        background: linear-gradient(135deg, #9f7aea 0%, #6b46c1 100%);
        color: white;
        border-radius: 999px;
        width: fit-content;
    }

    @media (max-width: 768px) {
        .filters-section {
            flex-direction: column;
        }

        .filter-group {
            width: 100%;
        }
    }
</style>
