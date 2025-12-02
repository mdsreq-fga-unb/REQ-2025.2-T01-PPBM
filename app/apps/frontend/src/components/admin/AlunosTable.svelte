<script lang="ts">
    import { onMount } from "svelte";
    import DataTable from "../ui/DataTable.svelte";
    import Toast from "../ui/Toast.svelte";
    import ConfirmDialog from "../ui/ConfirmDialog.svelte";
    import FormSelect from "../ui/FormSelect.svelte";
    import AlunoDetailModal from "./AlunoDetailModal.svelte";
    import type { Column } from "../../interfaces/table";

    export let apiUrl: string = "";

    interface Aluno {
        id_aluno: number;
        nome_aluno: string;
        cpf_aluno: string;
        data_nascimento_aluno: string;
        escola_unidade: string;
        neurodivergente: boolean;
        turma_id?: number;
        alunos_por_turma?: { id_turma: number }[];
        turma_info?: Turma;
    }

    interface Turma {
        id_turma: number;
        nome_turma: string;
        unidade_turma: string;
    }

    let alunosData: Aluno[] = [];
    let turmas: Turma[] = [];
    let loading = true;
    let errorMessage = "";

    // Filter state
    let searchTerm = "";
    let turmaFilter = "";
    let unidadeFilter = "";
    let statusFilter = "";

    // Get unique unidades from turmas
    $: unidades = [
        ...new Set(turmas.map((t) => t.unidade_turma).filter(Boolean)),
    ];

    // Filter turmas by selected unidade
    $: filteredTurmas = unidadeFilter
        ? turmas.filter((t) => t.unidade_turma === unidadeFilter)
        : turmas;

    // Pagination state
    let currentPage = 1;
    let totalPages = 1;
    let totalAlunos = 0;
    const pageSize = 20;

    // Toast state
    let toastMessage = "";
    let toastType: "success" | "error" | "warning" | "info" = "info";
    let showToast = false;

    // Confirm dialog state
    let showConfirmDialog = false;
    let confirmDialogTitle = "";
    let confirmDialogMessage = "";
    let confirmDialogAction: (() => Promise<void>) | null = null;
    let confirmLoading = false;

    // Detail modal state
    let showDetailModal = false;
    let selectedAlunoId: number | null = null;

    function displayToast(
        message: string,
        type: "success" | "error" | "warning" | "info" = "info",
    ) {
        toastMessage = message;
        toastType = type;
        showToast = true;
    }

    // Stats
    $: stats = {
        total: totalAlunos,
        neurodivergente: alunosData.filter((a) => a.neurodivergente === true)
            .length,
    };

    function formatCPF(cpf: string | null): string {
        if (!cpf) return "-";
        const cleaned = cpf.replace(/\D/g, "");
        if (cleaned.length !== 11) return cpf;
        return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
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
            key: "unidade",
            label: "Unidade",
            sortable: true,
            render: (row: Aluno) => {
                // Get unidade from turma_info if available
                if (row.turma_info?.unidade_turma) {
                    return row.turma_info.unidade_turma;
                }
                return row.escola_unidade || "-";
            },
        },
        {
            key: "status",
            label: "Status",
            render: (row: Aluno) => {
                const isNeurodivergente = row.neurodivergente === true;
                return {
                    component: "badge",
                    props: {
                        variant: isNeurodivergente ? "purple" : "success",
                        text: isNeurodivergente
                            ? "📚 Acomp. Especial"
                            : "Normal",
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
                        variant: "info",
                        text: "Detalhes",
                        onClick: () => verDetalhes(row.id_aluno),
                    },
                },
                {
                    component: "button",
                    props: {
                        variant: "primary",
                        text: "Editar",
                        onClick: () => editarAluno(row.id_aluno),
                    },
                },
                {
                    component: "button",
                    props: {
                        variant: "danger",
                        text: "Remover",
                        onClick: () =>
                            removerAluno(row.id_aluno, row.nome_aluno || ""),
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

    async function getAuthToken(): Promise<string | null> {
        return localStorage.getItem("bm_token");
    }

    async function loadTurmas() {
        try {
            const token = await getAuthToken();
            const response = await fetch(
                `${apiUrl}/turmas/listar?pageSize=100`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                },
            );

            if (!response.ok) throw new Error("Erro ao carregar turmas");

            const data = await response.json();
            turmas = data.data || [];
        } catch (error) {
            console.error("Erro ao carregar turmas:", error);
        }
    }

    async function loadAlunos() {
        loading = true;
        errorMessage = "";

        try {
            const token = await getAuthToken();
            const params = new URLSearchParams();
            params.append("page", currentPage.toString());
            params.append("pageSize", pageSize.toString());

            if (searchTerm) params.append("nome", searchTerm);
            if (turmaFilter) params.append("turmaId", turmaFilter);
            if (statusFilter) params.append("neurodivergente", statusFilter);

            const response = await fetch(`${apiUrl}/alunos/listar?${params}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) throw new Error("Erro ao carregar alunos");

            const data = await response.json();
            const rawAlunos = data.data || [];

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

            totalAlunos = data.total || 0;
            totalPages = Math.ceil(totalAlunos / pageSize);
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

    function handleUnidadeFilterChange() {
        // Reset turma filter when unidade changes since turmas are filtered
        turmaFilter = "";
        currentPage = 1;
        loadAlunos();
    }

    function verDetalhes(id: number) {
        selectedAlunoId = id;
        showDetailModal = true;
    }

    function editarAluno(id: number) {
        window.location.href = `/admin/cadastrar-alunos?id=${id}`;
    }

    async function removerAluno(id: number, nome: string) {
        confirmDialogTitle = "Remover Aluno";
        confirmDialogMessage = `Tem certeza que deseja remover o aluno <strong>"${nome}"</strong>?<br><br>Esta ação não pode ser desfeita.`;
        confirmDialogAction = async () => {
            confirmLoading = true;
            try {
                const token = await getAuthToken();
                const response = await fetch(`${apiUrl}/alunos/deletar/${id}`, {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || "Erro ao remover aluno");
                }

                showConfirmDialog = false;
                displayToast("Aluno removido com sucesso!", "success");
                await loadAlunos();
            } catch (error) {
                console.error("Erro ao remover aluno:", error);
                displayToast(
                    `Erro ao remover aluno: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
                    "error",
                );
            } finally {
                confirmLoading = false;
            }
        };
        showConfirmDialog = true;
    }

    function exportarLista() {
        if (alunosData.length === 0) {
            displayToast("Nenhum aluno para exportar", "warning");
            return;
        }

        const dados = alunosData.map((aluno) => ({
            Nome: aluno.nome_aluno || "",
            ID: aluno.id_aluno,
            CPF: formatCPF(aluno.cpf_aluno),
            "Data Nascimento": aluno.data_nascimento_aluno || "",
            Unidade:
                aluno.turma_info?.unidade_turma || aluno.escola_unidade || "",
            Neurodivergente: aluno.neurodivergente ? "Sim" : "Não",
        }));

        const headers = Object.keys(dados[0]);
        const csvContent = [
            headers.join(","),
            ...dados.map((row: any) =>
                headers.map((header) => `"${row[header]}"`).join(","),
            ),
        ].join("\n");

        const blob = new Blob(["\ufeff" + csvContent], {
            type: "text/csv;charset=utf-8;",
        });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute(
            "download",
            `alunos_${new Date().toISOString().split("T")[0]}.csv`,
        );
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    onMount(async () => {
        await loadTurmas();
        await loadAlunos();

        // Expose export function for external use
        (window as any).exportarAlunos = exportarLista;
    });
</script>

<div class="alunos-manager">
    <!-- Stats Grid -->
    <div class="stats-grid">
        <div class="stat-card total">
            <h3>Total de Alunos</h3>
            <p class="value">{stats.total}</p>
        </div>
        <div class="stat-card neurodivergente">
            <h3>Acompanhamento Especial</h3>
            <p class="value">{stats.neurodivergente}</p>
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
                placeholder="Nome do aluno..."
            />
        </div>
        <FormSelect
            id="unidade"
            label="Filtrar por unidade"
            bind:value={unidadeFilter}
            on:change={handleUnidadeFilterChange}
        >
            <option value="">Todas as unidades</option>
            {#each unidades as unidade}
                <option value={unidade}>
                    {unidade}
                </option>
            {/each}
        </FormSelect>
        <FormSelect
            id="turma"
            label="Filtrar por turma"
            bind:value={turmaFilter}
            on:change={handleFilterChange}
        >
            <option value="">Todas as turmas</option>
            {#each filteredTurmas as turma}
                <option value={turma.id_turma}>
                    {turma.nome_turma}{unidadeFilter
                        ? ""
                        : ` - ${turma.unidade_turma || "Sem unidade"}`}
                </option>
            {/each}
        </FormSelect>
        <FormSelect
            id="status"
            label="Status especial"
            bind:value={statusFilter}
            on:change={handleFilterChange}
        >
            <option value="">Todos</option>
            <option value="true">Neurodivergente</option>
            <option value="false">Sem acompanhamento</option>
        </FormSelect>
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

<!-- Confirm Dialog -->
<ConfirmDialog
    bind:show={showConfirmDialog}
    title={confirmDialogTitle}
    message={confirmDialogMessage}
    confirmText="Remover"
    confirmVariant="danger"
    loading={confirmLoading}
    on:confirm={() => confirmDialogAction && confirmDialogAction()}
    on:cancel={() => (showConfirmDialog = false)}
/>

<!-- Aluno Detail Modal -->
<AlunoDetailModal
    bind:show={showDetailModal}
    alunoId={selectedAlunoId}
    {apiUrl}
    on:close={() => {
        showDetailModal = false;
        selectedAlunoId = null;
    }}
/>

<style>
    .alunos-manager {
        width: 100%;
    }

    .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 1rem;
        margin-bottom: 2rem;
    }

    .stat-card {
        padding: 1rem;
        border-radius: 8px;
        text-align: center;
        background-color: #e2e8f0;
    }

    .stat-card.total {
        background: linear-gradient(135deg, #4299e1 0%, #2b6cb0 100%);
        color: white;
    }

    .stat-card.neurodivergente {
        background: linear-gradient(135deg, #9f7aea 0%, #6b46c1 100%);
        color: white;
    }

    .stat-card h3 {
        font-size: 0.8rem;
        margin: 0 0 0.25rem 0;
        font-weight: 500;
        opacity: 0.9;
    }

    .stat-card .value {
        font-size: 1.75rem;
        font-weight: 700;
        margin: 0;
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
        margin-bottom: 2rem;
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

    /* Custom styles for student info in table */
    :global(.student-info) {
        display: flex;
        flex-direction: column;
    }

    :global(.student-name) {
        font-weight: 600;
        color: #2d3748;
        margin-bottom: 0.25rem;
    }

    :global(.student-id) {
        font-size: 0.85rem;
        color: #718096;
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
