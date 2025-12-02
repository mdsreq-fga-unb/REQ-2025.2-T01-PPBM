<script lang="ts">
    import { onMount } from "svelte";
    import Toast from "../ui/Toast.svelte";
    import FormSelect from "../ui/FormSelect.svelte";

    interface Aluno {
        id_aluno: number;
        nome_aluno: string;
    }

    interface Docente {
        id_docente: number;
        nome_docente: string;
    }

    interface Advertencia {
        id_advertencia: number;
        created_at: string;
        id_aluno: number;
        id_docente: number | null;
        descricao_advertencia: string;
        alunos: Aluno | null;
        docentes: Docente | null;
    }

    // Props
    export let apiUrl: string = "http://localhost:3000";

    // State
    let advertencias: Advertencia[] = [];
    let alunos: Aluno[] = [];
    let isLoading = true;
    let errorMessage = "";

    // Pagination
    let currentPage = 1;
    let totalPages = 1;
    let totalAdvertencias = 0;
    const pageSize = 20;

    // Filters
    let alunoFilter = "";
    let dateFrom = "";
    let dateTo = "";

    // Create form state
    let showCreateForm = false;
    let createAlunoId = "";
    let createDescricao = "";
    let isCreating = false;

    // Detail modal state
    let showDetailModal = false;
    let selectedAdvertencia: Advertencia | null = null;

    // Toast state
    let toastMessage = "";
    let toastType: "success" | "error" | "warning" | "info" = "info";
    let showToast = false;

    // Stats
    $: stats = {
        total: totalAdvertencias,
        thisMonth: advertencias.filter((a) => {
            const date = new Date(a.created_at);
            const now = new Date();
            return (
                date.getMonth() === now.getMonth() &&
                date.getFullYear() === now.getFullYear()
            );
        }).length,
    };

    function displayToast(
        message: string,
        type: "success" | "error" | "warning" | "info" = "info",
    ) {
        toastMessage = message;
        toastType = type;
        showToast = true;
    }

    async function getAuthToken(): Promise<string | null> {
        return localStorage.getItem("bm_token");
    }

    async function loadAlunos() {
        try {
            const token = await getAuthToken();
            const response = await fetch(
                `${apiUrl}/alunos/listar?pageSize=500`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                },
            );

            if (!response.ok) throw new Error("Erro ao carregar alunos");

            const data = await response.json();
            alunos = data.data || [];
        } catch (error) {
            console.error("Erro ao carregar alunos:", error);
        }
    }

    async function loadAdvertencias() {
        isLoading = true;
        errorMessage = "";

        try {
            const token = await getAuthToken();
            const params = new URLSearchParams();
            params.append("page", currentPage.toString());
            params.append("pageSize", pageSize.toString());

            if (alunoFilter) params.append("alunoId", alunoFilter);
            if (dateFrom) params.append("from", dateFrom);
            if (dateTo) params.append("to", dateTo);

            const response = await fetch(
                `${apiUrl}/advertencias/listar?${params}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                },
            );

            if (!response.ok) throw new Error("Erro ao carregar advertências");

            const data = await response.json();
            advertencias = data.data || [];
            totalAdvertencias = data.total || 0;
            totalPages = Math.ceil(totalAdvertencias / pageSize);
        } catch (error) {
            console.error("Erro ao carregar advertências:", error);
            errorMessage =
                error instanceof Error
                    ? error.message
                    : "Erro ao carregar advertências";
            displayToast(errorMessage, "error");
        } finally {
            isLoading = false;
        }
    }

    function handleFilterChange() {
        currentPage = 1;
        loadAdvertencias();
    }

    function resetFilters() {
        alunoFilter = "";
        dateFrom = "";
        dateTo = "";
        currentPage = 1;
        loadAdvertencias();
    }

    function handlePageChange(page: number) {
        currentPage = page;
        loadAdvertencias();
    }

    function openCreateForm() {
        showCreateForm = true;
        createAlunoId = "";
        createDescricao = "";
    }

    function closeCreateForm() {
        showCreateForm = false;
        createAlunoId = "";
        createDescricao = "";
    }

    async function handleCreate() {
        if (!createAlunoId || !createDescricao.trim()) {
            displayToast("Preencha todos os campos obrigatórios", "warning");
            return;
        }

        isCreating = true;

        try {
            const token = await getAuthToken();
            const response = await fetch(`${apiUrl}/advertencias/criar`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    id_aluno: Number(createAlunoId),
                    descricao_advertencia: createDescricao.trim(),
                }),
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.error || "Erro ao criar advertência");
            }

            displayToast("Advertência registrada com sucesso!", "success");
            closeCreateForm();
            loadAdvertencias();
        } catch (error) {
            console.error("Erro ao criar advertência:", error);
            displayToast(
                error instanceof Error
                    ? error.message
                    : "Erro ao criar advertência",
                "error",
            );
        } finally {
            isCreating = false;
        }
    }

    function openDetailModal(advertencia: Advertencia) {
        selectedAdvertencia = advertencia;
        showDetailModal = true;
    }

    function closeDetailModal() {
        showDetailModal = false;
        selectedAdvertencia = null;
    }

    function formatDate(dateString: string): string {
        return new Date(dateString).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    }

    function formatDateTime(dateString: string): string {
        return new Date(dateString).toLocaleString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    }

    function truncateText(text: string, maxLength: number = 60): string {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + "...";
    }

    function handleKeydown(e: KeyboardEvent) {
        if (e.key === "Escape") {
            if (showDetailModal) closeDetailModal();
            if (showCreateForm) closeCreateForm();
        }
    }

    onMount(() => {
        loadAlunos();
        loadAdvertencias();
    });
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="advertencias-manager">
    <!-- Header -->
    <div class="page-header">
        <div class="title">
            <h1>Advertências</h1>
            <p>Gerencie as advertências dos alunos</p>
        </div>
        <button class="btn-primary" on:click={openCreateForm}>
            + Nova Advertência
        </button>
    </div>

    <!-- Stats -->
    <div class="stats-grid">
        <div class="stat-card total">
            <h3>Total de Advertências</h3>
            <p class="value">{stats.total}</p>
        </div>
        <div class="stat-card month">
            <h3>Este Mês</h3>
            <p class="value">{stats.thisMonth}</p>
        </div>
    </div>

    <!-- Filters -->
    <div class="filters-section">
        <FormSelect
            id="aluno-filter"
            label="Filtrar por aluno"
            bind:value={alunoFilter}
            on:change={handleFilterChange}
        >
            <option value="">Todos os alunos</option>
            {#each alunos as aluno}
                <option value={aluno.id_aluno}>{aluno.nome_aluno}</option>
            {/each}
        </FormSelect>

        <div class="filter-group">
            <label for="date-from">Data inicial</label>
            <input
                type="date"
                id="date-from"
                bind:value={dateFrom}
                on:change={handleFilterChange}
            />
        </div>

        <div class="filter-group">
            <label for="date-to">Data final</label>
            <input
                type="date"
                id="date-to"
                bind:value={dateTo}
                on:change={handleFilterChange}
            />
        </div>

        <button class="btn-reset" on:click={resetFilters}> Limpar </button>
    </div>

    <!-- Table -->
    <div class="table-container">
        {#if isLoading}
            <div class="loading-state">Carregando advertências...</div>
        {:else if errorMessage}
            <div class="error-state">{errorMessage}</div>
        {:else if advertencias.length === 0}
            <div class="empty-state">
                Nenhuma advertência encontrada com os filtros selecionados.
            </div>
        {:else}
            <table class="table">
                <thead>
                    <tr>
                        <th>Data</th>
                        <th>Aluno</th>
                        <th>Docente</th>
                        <th>Descrição</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {#each advertencias as advertencia (advertencia.id_advertencia)}
                        <tr>
                            <td>{formatDate(advertencia.created_at)}</td>
                            <td>
                                <span class="aluno-name">
                                    {advertencia.alunos?.nome_aluno || "-"}
                                </span>
                            </td>
                            <td>
                                {advertencia.docentes?.nome_docente || "-"}
                            </td>
                            <td>
                                <span class="descricao-text">
                                    {truncateText(
                                        advertencia.descricao_advertencia,
                                    )}
                                </span>
                            </td>
                            <td>
                                <button
                                    class="btn-view"
                                    on:click={() =>
                                        openDetailModal(advertencia)}
                                >
                                    Ver
                                </button>
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>

            <!-- Pagination -->
            {#if totalPages > 1}
                <div class="pagination">
                    <button
                        class="pagination-btn"
                        disabled={currentPage === 1}
                        on:click={() => handlePageChange(currentPage - 1)}
                    >
                        Anterior
                    </button>
                    <span class="pagination-info">
                        Página {currentPage} de {totalPages}
                    </span>
                    <button
                        class="pagination-btn"
                        disabled={currentPage === totalPages}
                        on:click={() => handlePageChange(currentPage + 1)}
                    >
                        Próxima
                    </button>
                </div>
            {/if}
        {/if}
    </div>
</div>

<!-- Create Modal -->
{#if showCreateForm}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <!-- svelte-ignore a11y_interactive_supports_focus -->
    <div
        class="modal-overlay"
        on:click={closeCreateForm}
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-modal-title"
    >
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
        <div class="modal" on:click|stopPropagation>
            <div class="modal-header">
                <h3 id="create-modal-title">Nova Advertência</h3>
                <button
                    class="close-btn"
                    on:click={closeCreateForm}
                    aria-label="Fechar"
                >
                    &times;
                </button>
            </div>

            <form on:submit|preventDefault={handleCreate}>
                <div class="form-group">
                    <label for="create-aluno">Aluno *</label>
                    <select
                        id="create-aluno"
                        bind:value={createAlunoId}
                        required
                    >
                        <option value="">Selecione um aluno</option>
                        {#each alunos as aluno}
                            <option value={aluno.id_aluno}>
                                {aluno.nome_aluno}
                            </option>
                        {/each}
                    </select>
                </div>

                <div class="form-group">
                    <label for="create-descricao">Descrição *</label>
                    <textarea
                        id="create-descricao"
                        bind:value={createDescricao}
                        placeholder="Descreva o motivo da advertência..."
                        rows="4"
                        required
                    ></textarea>
                </div>

                <div class="modal-buttons">
                    <button
                        type="button"
                        class="btn-cancel"
                        on:click={closeCreateForm}
                        disabled={isCreating}
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        class="btn-submit"
                        disabled={isCreating}
                    >
                        {isCreating
                            ? "Registrando..."
                            : "Registrar Advertência"}
                    </button>
                </div>
            </form>
        </div>
    </div>
{/if}

<!-- Detail Modal -->
{#if showDetailModal && selectedAdvertencia}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <!-- svelte-ignore a11y_interactive_supports_focus -->
    <div
        class="modal-overlay"
        on:click={closeDetailModal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="detail-modal-title"
    >
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
        <div class="modal detail-modal" on:click|stopPropagation>
            <div class="modal-header">
                <h3 id="detail-modal-title">Detalhes da Advertência</h3>
                <button
                    class="close-btn"
                    on:click={closeDetailModal}
                    aria-label="Fechar"
                >
                    &times;
                </button>
            </div>

            <div class="detail-content">
                <div class="detail-row">
                    <span class="detail-label">Data/Hora:</span>
                    <span class="detail-value">
                        {formatDateTime(selectedAdvertencia.created_at)}
                    </span>
                </div>

                <div class="detail-row">
                    <span class="detail-label">Aluno:</span>
                    <span class="detail-value">
                        {selectedAdvertencia.alunos?.nome_aluno || "-"}
                    </span>
                </div>

                <div class="detail-row">
                    <span class="detail-label">Docente:</span>
                    <span class="detail-value">
                        {selectedAdvertencia.docentes?.nome_docente ||
                            "Não informado"}
                    </span>
                </div>

                <div class="detail-row full-width">
                    <span class="detail-label">Descrição:</span>
                    <p class="detail-description">
                        {selectedAdvertencia.descricao_advertencia}
                    </p>
                </div>
            </div>

            <div class="modal-buttons">
                <button class="btn-cancel" on:click={closeDetailModal}>
                    Fechar
                </button>
            </div>
        </div>
    </div>
{/if}

<!-- Toast -->
<Toast bind:show={showToast} message={toastMessage} type={toastType} />

<style>
    .advertencias-manager {
        width: 100%;
    }

    /* Header */
    .page-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 2rem;
        padding-bottom: 1.5rem;
        border-bottom: 2px solid #e2e8f0;
    }

    .page-header .title h1 {
        font-size: 1.8rem;
        margin: 0 0 0.5rem 0;
        color: #2d3748;
    }

    .page-header .title p {
        font-size: 1rem;
        margin: 0;
        color: #718096;
    }

    .btn-primary {
        padding: 0.75rem 1.5rem;
        background: linear-gradient(135deg, #e53e3e 0%, #c53030 100%);
        color: white;
        border: none;
        border-radius: 8px;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
    }

    .btn-primary:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(229, 62, 62, 0.3);
    }

    /* Stats */
    .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: 1rem;
        margin-bottom: 2rem;
    }

    .stat-card {
        padding: 1.25rem;
        border-radius: 12px;
        text-align: center;
    }

    .stat-card.total {
        background: linear-gradient(135deg, #e53e3e 0%, #c53030 100%);
        color: white;
    }

    .stat-card.month {
        background: linear-gradient(135deg, #ed8936 0%, #c05621 100%);
        color: white;
    }

    .stat-card h3 {
        font-size: 0.85rem;
        margin: 0 0 0.5rem 0;
        font-weight: 500;
        opacity: 0.9;
    }

    .stat-card .value {
        font-size: 2rem;
        font-weight: 700;
        margin: 0;
    }

    /* Filters */
    .filters-section {
        display: flex;
        gap: 1rem;
        margin-bottom: 1.5rem;
        flex-wrap: wrap;
        align-items: flex-end;
    }

    .filter-group {
        display: flex;
        flex-direction: column;
        min-width: 150px;
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
        background: #fdfdfd;
    }

    .filter-group input:focus {
        outline: none;
        border-color: #3182ce;
        box-shadow: 0 0 0 2px rgba(49, 130, 206, 0.2);
    }

    .btn-reset {
        padding: 0.75rem 1.25rem;
        background: #e2e8f0;
        color: #4a5568;
        border: none;
        border-radius: 6px;
        font-size: 0.9rem;
        font-weight: 500;
        cursor: pointer;
        transition: background 0.2s;
        height: fit-content;
    }

    .btn-reset:hover {
        background: #cbd5e0;
    }

    /* Table */
    .table-container {
        overflow-x: auto;
    }

    .table {
        width: 100%;
        border-collapse: collapse;
        background: white;
    }

    .table thead {
        background: #e2e8f0;
    }

    .table th {
        text-align: left;
        padding: 1rem;
        font-weight: 600;
        color: #2d3748;
        border-bottom: 2px solid #cbd5e0;
    }

    .table td {
        padding: 1rem;
        border-bottom: 1px solid #cbd5e0;
        vertical-align: middle;
    }

    .table tbody tr:hover {
        background: #f7fafc;
    }

    .aluno-name {
        font-weight: 600;
        color: #2d3748;
    }

    .descricao-text {
        color: #4a5568;
        font-size: 0.9rem;
    }

    .btn-view {
        padding: 0.5rem 1rem;
        background: #4299e1;
        color: white;
        border: none;
        border-radius: 6px;
        font-size: 0.875rem;
        font-weight: 500;
        cursor: pointer;
        transition: background 0.2s;
    }

    .btn-view:hover {
        background: #3182ce;
    }

    /* States */
    .loading-state,
    .empty-state,
    .error-state {
        text-align: center;
        padding: 3rem;
        color: #718096;
        font-size: 1.1rem;
    }

    .error-state {
        color: #e53e3e;
    }

    /* Pagination */
    .pagination {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 1rem;
        margin-top: 1.5rem;
        padding-top: 1rem;
        border-top: 1px solid #e2e8f0;
    }

    .pagination-btn {
        padding: 0.5rem 1rem;
        background: #e2e8f0;
        color: #4a5568;
        border: none;
        border-radius: 6px;
        font-size: 0.9rem;
        cursor: pointer;
        transition: background 0.2s;
    }

    .pagination-btn:hover:not(:disabled) {
        background: #cbd5e0;
    }

    .pagination-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .pagination-info {
        color: #718096;
        font-size: 0.9rem;
    }

    /* Modal */
    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        animation: fadeIn 0.2s ease-out;
    }

    @keyframes fadeIn {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }

    .modal {
        background: white;
        padding: 1.5rem;
        border-radius: 12px;
        max-width: 500px;
        width: 90%;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
        animation: scaleIn 0.2s ease-out;
    }

    .detail-modal {
        max-width: 600px;
    }

    @keyframes scaleIn {
        from {
            transform: scale(0.95);
            opacity: 0;
        }
        to {
            transform: scale(1);
            opacity: 1;
        }
    }

    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid #e2e8f0;
    }

    .modal-header h3 {
        margin: 0;
        font-size: 1.25rem;
        color: #2d3748;
    }

    .close-btn {
        background: none;
        border: none;
        font-size: 1.5rem;
        color: #718096;
        cursor: pointer;
        padding: 0;
        line-height: 1;
        transition: color 0.2s;
    }

    .close-btn:hover {
        color: #2d3748;
    }

    .form-group {
        margin-bottom: 1.25rem;
    }

    .form-group label {
        display: block;
        font-size: 0.9rem;
        font-weight: 500;
        color: #4a5568;
        margin-bottom: 0.5rem;
    }

    .form-group select,
    .form-group textarea {
        width: 100%;
        padding: 0.75rem;
        border: 1px solid #cbd5e0;
        border-radius: 6px;
        font-size: 1rem;
        color: #2d3748;
        background: #fdfdfd;
        box-sizing: border-box;
    }

    .form-group select:focus,
    .form-group textarea:focus {
        outline: none;
        border-color: #3182ce;
        box-shadow: 0 0 0 2px rgba(49, 130, 206, 0.2);
    }

    .form-group textarea {
        resize: vertical;
        min-height: 100px;
    }

    .modal-buttons {
        display: flex;
        justify-content: flex-end;
        gap: 0.75rem;
        margin-top: 1.5rem;
    }

    .btn-cancel {
        padding: 0.75rem 1.25rem;
        background: #e2e8f0;
        color: #4a5568;
        border: none;
        border-radius: 6px;
        font-size: 0.95rem;
        font-weight: 500;
        cursor: pointer;
        transition: background 0.2s;
    }

    .btn-cancel:hover:not(:disabled) {
        background: #cbd5e0;
    }

    .btn-submit {
        padding: 0.75rem 1.25rem;
        background: #e53e3e;
        color: white;
        border: none;
        border-radius: 6px;
        font-size: 0.95rem;
        font-weight: 500;
        cursor: pointer;
        transition: background 0.2s;
    }

    .btn-submit:hover:not(:disabled) {
        background: #c53030;
    }

    .btn-submit:disabled,
    .btn-cancel:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }

    /* Detail Modal */
    .detail-content {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .detail-row {
        display: flex;
        gap: 0.75rem;
    }

    .detail-row.full-width {
        flex-direction: column;
    }

    .detail-label {
        font-weight: 600;
        color: #4a5568;
        min-width: 100px;
    }

    .detail-value {
        color: #2d3748;
    }

    .detail-description {
        margin: 0.5rem 0 0 0;
        padding: 1rem;
        background: #f7fafc;
        border-radius: 8px;
        color: #2d3748;
        line-height: 1.6;
        white-space: pre-wrap;
    }

    @media (max-width: 768px) {
        .page-header {
            flex-direction: column;
            gap: 1rem;
        }

        .filters-section {
            flex-direction: column;
        }

        .filter-group {
            width: 100%;
        }

        .btn-reset {
            width: 100%;
        }
    }
</style>
