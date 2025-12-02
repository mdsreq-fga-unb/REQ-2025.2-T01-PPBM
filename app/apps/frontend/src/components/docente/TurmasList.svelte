<script lang="ts">
    import { onMount } from "svelte";
    import Toast from "../ui/Toast.svelte";
    import FormSelect from "../ui/FormSelect.svelte";
    import { apiFetch } from "../../lib/api";

    interface Turma {
        id_turma: number;
        nome_turma: string;
        limite_alunos_turma: number;
        unidade_turma: string;
        alunos_count: number;
        created_at: string;
    }

    interface Aluno {
        id_aluno: number;
        nome_aluno: string;
        cpf_aluno: string;
        neurodivergente: boolean;
    }

    let turmas: Turma[] = [];
    let loading = true;
    let errorMessage = "";

    // Filter state
    let searchTerm = "";
    let unidadeFilter = "";

    // Pagination state
    let currentPage = 1;
    let totalPages = 1;
    let totalTurmas = 0;
    const pageSize = 10;

    // Modal state
    let showModal = false;
    let selectedTurma: Turma | null = null;
    let turmaAlunos: Aluno[] = [];
    let loadingAlunos = false;

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

    function getOcupacaoPercentage(turma: Turma): number {
        if (!turma.limite_alunos_turma || turma.limite_alunos_turma === 0)
            return 0;
        return Math.round(
            (turma.alunos_count / turma.limite_alunos_turma) * 100,
        );
    }

    function getOcupacaoColor(percentage: number): string {
        if (percentage >= 90) return "bg-red-500";
        if (percentage >= 70) return "bg-yellow-500";
        return "bg-green-500";
    }

    async function loadTurmas() {
        loading = true;
        errorMessage = "";

        try {
            const params = new URLSearchParams();
            params.append("page", currentPage.toString());
            params.append("pageSize", pageSize.toString());

            if (searchTerm) params.append("nome", searchTerm);
            if (unidadeFilter) params.append("unidade", unidadeFilter);

            const response = await apiFetch<{ data: Turma[]; total: number }>(
                `/turmas/listar?${params}`,
            );

            if (response.success && response.data) {
                turmas = response.data.data || [];
                totalTurmas = response.data.total || 0;
                totalPages = Math.ceil(totalTurmas / pageSize);
            } else {
                errorMessage = response.error || "Erro ao carregar turmas";
            }
        } catch (error) {
            console.error("Erro ao carregar turmas:", error);
            errorMessage =
                error instanceof Error
                    ? error.message
                    : "Erro ao carregar turmas";
        } finally {
            loading = false;
        }
    }

    async function loadTurmaAlunos(turmaId: number) {
        loadingAlunos = true;
        try {
            const response = await apiFetch<{ alunos: Aluno[] }>(
                `/turmas/${turmaId}/alunos`,
            );
            if (response.success && response.data) {
                turmaAlunos = response.data.alunos || [];
            } else {
                displayToast("Erro ao carregar alunos da turma", "error");
            }
        } catch (error) {
            console.error("Erro ao carregar alunos:", error);
            displayToast("Erro ao carregar alunos da turma", "error");
        } finally {
            loadingAlunos = false;
        }
    }

    function openTurmaDetails(turma: Turma) {
        selectedTurma = turma;
        showModal = true;
        loadTurmaAlunos(turma.id_turma);
    }

    function closeModal() {
        showModal = false;
        selectedTurma = null;
        turmaAlunos = [];
    }

    function handlePageChange(newPage: number) {
        if (newPage >= 1 && newPage <= totalPages) {
            currentPage = newPage;
            loadTurmas();
        }
    }

    // Debounce search
    let searchTimeout: ReturnType<typeof setTimeout>;
    function handleSearchInput() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            currentPage = 1;
            loadTurmas();
        }, 300);
    }

    function handleFilterChange() {
        currentPage = 1;
        loadTurmas();
    }

    function navigateToAlunos() {
        window.location.href = "/docente/alunos";
    }

    onMount(() => {
        loadTurmas();
    });
</script>

<div class="turmas-list">
    <!-- Page Header -->
    <div class="page-header">
        <div class="title">
            <h1>Turmas</h1>
            <p>Visualize suas turmas e alunos matriculados</p>
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
            <label for="buscar">Buscar turma</label>
            <input
                type="text"
                id="buscar"
                bind:value={searchTerm}
                on:input={handleSearchInput}
                placeholder="Nome da turma..."
            />
        </div>
        <div class="filter-group">
            <label for="unidade">Filtrar por unidade</label>
            <input
                type="text"
                id="unidade"
                bind:value={unidadeFilter}
                on:input={handleSearchInput}
                placeholder="Nome da unidade..."
            />
        </div>
    </div>

    <!-- Results info -->
    <div class="results-info">
        <span>{totalTurmas} turma(s) encontrada(s)</span>
    </div>

    <!-- Turmas Grid -->
    {#if loading}
        <div class="loading-state">
            <div class="spinner"></div>
            <span>Carregando turmas...</span>
        </div>
    {:else if turmas.length === 0}
        <div class="empty-state">
            <span class="empty-icon">📚</span>
            <p>Nenhuma turma encontrada</p>
        </div>
    {:else}
        <div class="turmas-grid">
            {#each turmas as turma}
                {@const ocupacao = getOcupacaoPercentage(turma)}
                <div class="turma-card">
                    <div class="turma-header">
                        <h3>{turma.nome_turma}</h3>
                        <span class="unidade-badge"
                            >{turma.unidade_turma || "Sem unidade"}</span
                        >
                    </div>

                    <div class="turma-stats">
                        <div class="stat">
                            <span class="stat-label">Alunos</span>
                            <span class="stat-value"
                                >{turma.alunos_count} / {turma.limite_alunos_turma}</span
                            >
                        </div>
                        <div class="stat">
                            <span class="stat-label">Ocupação</span>
                            <div class="ocupacao-bar">
                                <div
                                    class="ocupacao-fill {getOcupacaoColor(
                                        ocupacao,
                                    )}"
                                    style="width: {ocupacao}%"
                                ></div>
                            </div>
                            <span class="ocupacao-text">{ocupacao}%</span>
                        </div>
                    </div>

                    <div class="turma-actions">
                        <button
                            class="btn-view"
                            on:click={() => openTurmaDetails(turma)}
                        >
                            Ver Alunos
                        </button>
                    </div>
                </div>
            {/each}
        </div>

        <!-- Pagination -->
        {#if totalPages > 1}
            <div class="pagination">
                <button
                    class="pagination-btn"
                    disabled={currentPage === 1}
                    on:click={() => handlePageChange(currentPage - 1)}
                >
                    ← Anterior
                </button>
                <span class="pagination-info">
                    Página {currentPage} de {totalPages}
                </span>
                <button
                    class="pagination-btn"
                    disabled={currentPage === totalPages}
                    on:click={() => handlePageChange(currentPage + 1)}
                >
                    Próxima →
                </button>
            </div>
        {/if}
    {/if}
</div>

<!-- Modal de Detalhes da Turma -->
{#if showModal && selectedTurma}
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div class="modal-overlay" on:click={closeModal}>
        <div
            class="modal"
            on:click|stopPropagation
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
        >
            <div class="modal-header">
                <h2 id="modal-title">{selectedTurma.nome_turma}</h2>
                <button
                    class="modal-close"
                    on:click={closeModal}
                    aria-label="Fechar">×</button
                >
            </div>

            <div class="modal-body">
                <div class="turma-info">
                    <div class="info-item">
                        <span class="info-label">Unidade:</span>
                        <span class="info-value"
                            >{selectedTurma.unidade_turma ||
                                "Não definida"}</span
                        >
                    </div>
                    <div class="info-item">
                        <span class="info-label">Capacidade:</span>
                        <span class="info-value"
                            >{selectedTurma.alunos_count} / {selectedTurma.limite_alunos_turma}
                            alunos</span
                        >
                    </div>
                </div>

                <h3 class="alunos-title">
                    Alunos Matriculados ({turmaAlunos.length})
                </h3>

                {#if loadingAlunos}
                    <div class="loading-alunos">
                        <div class="spinner-small"></div>
                        <span>Carregando alunos...</span>
                    </div>
                {:else if turmaAlunos.length === 0}
                    <div class="empty-alunos">
                        Nenhum aluno matriculado nesta turma
                    </div>
                {:else}
                    <div class="alunos-list">
                        {#each turmaAlunos as aluno}
                            <div class="aluno-item">
                                <div class="aluno-info">
                                    <span class="aluno-nome"
                                        >{aluno.nome_aluno}</span
                                    >
                                    {#if aluno.neurodivergente}
                                        <span class="badge-neuro"
                                            >📚 Acomp. Especial</span
                                        >
                                    {/if}
                                </div>
                                <span class="aluno-cpf"
                                    >{aluno.cpf_aluno ||
                                        "CPF não informado"}</span
                                >
                            </div>
                        {/each}
                    </div>
                {/if}
            </div>

            <div class="modal-footer">
                <button class="btn-secondary" on:click={closeModal}
                    >Fechar</button
                >
                <button class="btn-primary" on:click={navigateToAlunos}>
                    Consultar Alunos
                </button>
            </div>
        </div>
    </div>
{/if}

<!-- Toast Notification -->
<Toast bind:show={showToast} message={toastMessage} type={toastType} />

<style>
    .turmas-list {
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

    .loading-state,
    .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 3rem;
        color: #718096;
    }

    .spinner {
        width: 40px;
        height: 40px;
        border: 3px solid #e2e8f0;
        border-top-color: #e53e3e;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin-bottom: 1rem;
    }

    .spinner-small {
        width: 20px;
        height: 20px;
        border: 2px solid #e2e8f0;
        border-top-color: #e53e3e;
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }

    .empty-icon {
        font-size: 3rem;
        margin-bottom: 1rem;
    }

    .turmas-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 1.5rem;
    }

    .turma-card {
        background: #fff;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 1.5rem;
        transition:
            box-shadow 0.3s,
            transform 0.2s;
    }

    .turma-card:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        transform: translateY(-2px);
    }

    .turma-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 1rem;
    }

    .turma-header h3 {
        font-size: 1.1rem;
        font-weight: 600;
        color: #2d3748;
        margin: 0;
    }

    .unidade-badge {
        font-size: 0.75rem;
        padding: 0.25rem 0.5rem;
        background-color: #ebf8ff;
        color: #2b6cb0;
        border-radius: 999px;
    }

    .turma-stats {
        margin-bottom: 1rem;
    }

    .stat {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 0.5rem;
    }

    .stat-label {
        font-size: 0.85rem;
        color: #718096;
        min-width: 70px;
    }

    .stat-value {
        font-size: 0.9rem;
        font-weight: 600;
        color: #2d3748;
    }

    .ocupacao-bar {
        flex: 1;
        height: 8px;
        background-color: #e2e8f0;
        border-radius: 999px;
        overflow: hidden;
    }

    .ocupacao-fill {
        height: 100%;
        border-radius: 999px;
        transition: width 0.3s ease;
    }

    .ocupacao-text {
        font-size: 0.85rem;
        font-weight: 600;
        color: #2d3748;
        min-width: 40px;
        text-align: right;
    }

    .turma-actions {
        display: flex;
        justify-content: flex-end;
        padding-top: 1rem;
        border-top: 1px solid #e2e8f0;
    }

    .btn-view {
        padding: 0.5rem 1rem;
        background-color: #3182ce;
        color: white;
        border: none;
        border-radius: 6px;
        font-size: 0.9rem;
        font-weight: 500;
        cursor: pointer;
        transition: background-color 0.3s;
    }

    .btn-view:hover {
        background-color: #2c5282;
    }

    .pagination {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 1rem;
        margin-top: 2rem;
        padding-top: 1rem;
        border-top: 1px solid #e2e8f0;
    }

    .pagination-btn {
        padding: 0.5rem 1rem;
        background-color: #f7fafc;
        border: 1px solid #cbd5e0;
        border-radius: 6px;
        color: #2d3748;
        font-size: 0.9rem;
        cursor: pointer;
        transition: all 0.3s;
    }

    .pagination-btn:hover:not(:disabled) {
        background-color: #e2e8f0;
    }

    .pagination-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .pagination-info {
        color: #718096;
        font-size: 0.9rem;
    }

    /* Modal Styles */
    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        padding: 1rem;
    }

    .modal {
        background-color: white;
        border-radius: 16px;
        width: 100%;
        max-width: 600px;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
    }

    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1.5rem;
        border-bottom: 1px solid #e2e8f0;
    }

    .modal-header h2 {
        margin: 0;
        font-size: 1.25rem;
        color: #2d3748;
    }

    .modal-close {
        background: none;
        border: none;
        font-size: 1.5rem;
        color: #718096;
        cursor: pointer;
        padding: 0.25rem;
        line-height: 1;
    }

    .modal-close:hover {
        color: #2d3748;
    }

    .modal-body {
        padding: 1.5rem;
    }

    .turma-info {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 1rem;
        margin-bottom: 1.5rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid #e2e8f0;
    }

    .info-item {
        display: flex;
        flex-direction: column;
    }

    .info-label {
        font-size: 0.85rem;
        color: #718096;
        margin-bottom: 0.25rem;
    }

    .info-value {
        font-weight: 600;
        color: #2d3748;
    }

    .alunos-title {
        font-size: 1rem;
        color: #2d3748;
        margin: 0 0 1rem 0;
    }

    .loading-alunos {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 1rem;
        color: #718096;
    }

    .empty-alunos {
        text-align: center;
        padding: 2rem;
        color: #718096;
        background-color: #f7fafc;
        border-radius: 8px;
    }

    .alunos-list {
        max-height: 300px;
        overflow-y: auto;
    }

    .aluno-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.75rem;
        border-bottom: 1px solid #e2e8f0;
    }

    .aluno-item:last-child {
        border-bottom: none;
    }

    .aluno-info {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
    }

    .aluno-nome {
        font-weight: 600;
        color: #2d3748;
    }

    .aluno-cpf {
        font-size: 0.85rem;
        color: #718096;
    }

    .badge-neuro {
        display: inline-block;
        font-size: 0.7rem;
        padding: 0.15rem 0.5rem;
        background: linear-gradient(135deg, #9f7aea 0%, #6b46c1 100%);
        color: white;
        border-radius: 999px;
        width: fit-content;
    }

    .modal-footer {
        display: flex;
        justify-content: flex-end;
        gap: 0.75rem;
        padding: 1rem 1.5rem;
        border-top: 1px solid #e2e8f0;
    }

    .btn-primary,
    .btn-secondary {
        padding: 0.75rem 1.25rem;
        border-radius: 6px;
        border: none;
        font-size: 0.95rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s;
    }

    .btn-primary {
        background-color: #e53e3e;
        color: white;
    }

    .btn-primary:hover {
        background-color: #c53030;
    }

    .btn-secondary {
        background-color: #e2e8f0;
        color: #4a5568;
    }

    .btn-secondary:hover {
        background-color: #cbd5e0;
    }

    @media (max-width: 768px) {
        .filters-section {
            flex-direction: column;
        }

        .filter-group {
            width: 100%;
        }

        .turmas-grid {
            grid-template-columns: 1fr;
        }

        .turma-info {
            grid-template-columns: 1fr;
        }

        .modal-footer {
            flex-direction: column;
        }

        .btn-primary,
        .btn-secondary {
            width: 100%;
        }
    }
</style>
