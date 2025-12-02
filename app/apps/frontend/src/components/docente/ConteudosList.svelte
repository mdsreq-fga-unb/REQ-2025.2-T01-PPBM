<script lang="ts">
    import { onMount } from "svelte";
    import { apiFetch } from "../../lib/api";
    import Toast from "../ui/Toast.svelte";
    import ConfirmDialog from "../ui/ConfirmDialog.svelte";

    // Types
    interface Conteudo {
        id_conteudos_institucionais: number;
        created_at: string;
        categoria: string;
        conteudo: string;
        anexo_url: string | null;
        data_time_conteudo: string | null;
        atualizado_conteudo: string | null;
        id_docente: number | null;
        id_unidade: number | null;
        docentes?: { id_docente: number; nome_docente: string } | null;
        unidades?: { id_unidade: number; nome_unidade: string } | null;
    }

    interface Unidade {
        id_unidade: number;
        nome_unidade: string;
    }

    // Toast state
    let toastMessage = "";
    let toastType: "success" | "error" | "warning" | "info" = "info";
    let showToast = false;

    function displayToast(message: string, type: typeof toastType = "info") {
        toastMessage = message;
        toastType = type;
        showToast = true;
    }

    // Data state
    let conteudos: Conteudo[] = [];
    let categorias: string[] = [];
    let unidades: Unidade[] = [];
    let isLoading = true;
    let total = 0;
    let page = 1;
    let pageSize = 10;

    // Filter state
    let searchQuery = "";
    let filterCategoria = "";

    // Form state
    let showForm = false;
    let isEditing = false;
    let editingId: number | null = null;
    let isSaving = false;

    // Form fields
    let formCategoria = "";
    let formConteudo = "";
    let formAnexoUrl = "";
    let formUnidadeId: number | null = null;

    // Confirm dialog
    let showConfirm = false;
    let confirmMessage = "";
    let confirmCallback: (() => void) | null = null;

    // Predefined categories
    const categoriasPredefinidas = [
        "Regras de Vestimenta",
        "Normas Disciplinares",
        "Regulamento Interno",
        "Comunicado Oficial",
        "Calendário",
        "Evento",
        "Informativo",
        "Outro",
    ];

    function formatDate(dateStr: string | null): string {
        if (!dateStr) return "-";
        const date = new Date(dateStr);
        return date.toLocaleDateString("pt-BR");
    }

    function formatDateTime(dateStr: string | null): string {
        if (!dateStr) return "-";
        const date = new Date(dateStr);
        return date.toLocaleString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    }

    function getCategoriaColor(categoria: string): string {
        const colors: Record<string, string> = {
            "Regras de Vestimenta": "bg-blue-100 text-blue-700",
            "Normas Disciplinares": "bg-red-100 text-red-700",
            "Regulamento Interno": "bg-purple-100 text-purple-700",
            "Comunicado Oficial": "bg-yellow-100 text-yellow-700",
            Calendário: "bg-green-100 text-green-700",
            Evento: "bg-pink-100 text-pink-700",
            Informativo: "bg-cyan-100 text-cyan-700",
        };
        return colors[categoria] || "bg-slate-100 text-slate-700";
    }

    async function loadConteudos() {
        isLoading = true;
        try {
            const params = new URLSearchParams();
            params.append("page", page.toString());
            params.append("pageSize", pageSize.toString());
            if (searchQuery) params.append("search", searchQuery);
            if (filterCategoria) params.append("categoria", filterCategoria);

            const response = await apiFetch<{
                success: boolean;
                data: Conteudo[];
                total: number;
            }>(`/conteudos/listar?${params}`);

            if (response.success && response.data) {
                const data = response.data as any;
                conteudos = data.data || data || [];
                total = data.total || conteudos.length;
            }
        } catch (error) {
            console.error("Error loading conteudos:", error);
            displayToast("Erro ao carregar conteúdos", "error");
        } finally {
            isLoading = false;
        }
    }

    async function loadCategorias() {
        try {
            const response = await apiFetch<{
                success: boolean;
                data: string[];
            }>("/conteudos/categorias");

            if (response.success && response.data) {
                const data = response.data as any;
                categorias = data.data || data || [];
            }
        } catch (error) {
            console.error("Error loading categorias:", error);
        }
    }

    async function loadUnidades() {
        try {
            // Try to fetch unidades if endpoint exists
            const response = await apiFetch<{
                success: boolean;
                data: Unidade[];
            }>("/turmas/unidades");

            if (response.success && response.data) {
                const data = response.data as any;
                unidades = data.data || data || [];
            }
        } catch (error) {
            console.log("Unidades endpoint not available");
        }
    }

    function openNewForm() {
        isEditing = false;
        editingId = null;
        formCategoria = "";
        formConteudo = "";
        formAnexoUrl = "";
        formUnidadeId = null;
        showForm = true;
    }

    function openEditForm(conteudo: Conteudo) {
        isEditing = true;
        editingId = conteudo.id_conteudos_institucionais;
        formCategoria = conteudo.categoria || "";
        formConteudo = conteudo.conteudo || "";
        formAnexoUrl = conteudo.anexo_url || "";
        formUnidadeId = conteudo.id_unidade;
        showForm = true;
    }

    function closeForm() {
        showForm = false;
        isEditing = false;
        editingId = null;
    }

    async function handleSubmit() {
        if (!formCategoria.trim() || !formConteudo.trim()) {
            displayToast("Preencha os campos obrigatórios", "warning");
            return;
        }

        isSaving = true;

        try {
            const payload = {
                categoria: formCategoria,
                conteudo: formConteudo,
                anexo_url: formAnexoUrl || null,
                id_unidade: formUnidadeId,
            };

            let response;

            if (isEditing && editingId) {
                response = await apiFetch(`/conteudos/atualizar/${editingId}`, {
                    method: "PUT",
                    body: JSON.stringify(payload),
                });
            } else {
                response = await apiFetch("/conteudos/criar", {
                    method: "POST",
                    body: JSON.stringify(payload),
                });
            }

            if (response.success) {
                displayToast(
                    isEditing
                        ? "Conteúdo atualizado com sucesso!"
                        : "Conteúdo criado com sucesso!",
                    "success",
                );
                closeForm();
                await loadConteudos();
                await loadCategorias();
            } else {
                displayToast(
                    response.error || "Erro ao salvar conteúdo",
                    "error",
                );
            }
        } catch (error) {
            console.error("Error saving conteudo:", error);
            displayToast("Erro ao salvar conteúdo", "error");
        } finally {
            isSaving = false;
        }
    }

    function confirmDelete(id: number) {
        confirmMessage = "Tem certeza que deseja excluir este conteúdo?";
        showConfirm = true;
        confirmCallback = () => deleteConteudo(id);
    }

    async function deleteConteudo(id: number) {
        try {
            const response = await apiFetch(`/conteudos/deletar/${id}`, {
                method: "DELETE",
            });

            if (response.success) {
                displayToast("Conteúdo removido com sucesso", "success");
                await loadConteudos();
            } else {
                displayToast("Erro ao remover conteúdo", "error");
            }
        } catch (error) {
            console.error("Error deleting conteudo:", error);
            displayToast("Erro ao remover conteúdo", "error");
        }
    }

    function handleConfirmClose() {
        showConfirm = false;
        confirmCallback = null;
    }

    function handleConfirmAction() {
        if (confirmCallback) {
            confirmCallback();
        }
        handleConfirmClose();
    }

    function handleSearch() {
        page = 1;
        loadConteudos();
    }

    function handleFilterChange() {
        page = 1;
        loadConteudos();
    }

    function handlePageChange(newPage: number) {
        page = newPage;
        loadConteudos();
    }

    $: totalPages = Math.ceil(total / pageSize);

    onMount(() => {
        Promise.all([loadConteudos(), loadCategorias(), loadUnidades()]);
    });
</script>

<div class="conteudos-container">
    <!-- Header -->
    <div class="header">
        <div class="header-title">
            <h2>📚 Conteúdos Institucionais</h2>
            <p>Gerencie regras, normas e documentos oficiais</p>
        </div>
        <button type="button" class="btn-new" on:click={openNewForm}>
            + Novo Conteúdo
        </button>
    </div>

    <!-- Filters -->
    <div class="filters">
        <div class="filter-group">
            <input
                type="text"
                bind:value={searchQuery}
                on:keyup={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Buscar conteúdo..."
                class="search-input"
            />
            <button type="button" class="btn-search" on:click={handleSearch}>
                🔍
            </button>
        </div>
        <div class="filter-group">
            <select bind:value={filterCategoria} on:change={handleFilterChange}>
                <option value="">Todas as categorias</option>
                {#each categoriasPredefinidas as cat}
                    <option value={cat}>{cat}</option>
                {/each}
            </select>
        </div>
    </div>

    <!-- Content List -->
    {#if isLoading}
        <div class="loading">
            <span class="spinner"></span>
            Carregando conteúdos...
        </div>
    {:else if conteudos.length === 0}
        <div class="empty-state">
            <span class="empty-icon">📂</span>
            <p>Nenhum conteúdo encontrado.</p>
            <p class="empty-hint">Clique em "Novo Conteúdo" para adicionar.</p>
        </div>
    {:else}
        <div class="conteudos-list">
            {#each conteudos as conteudo (conteudo.id_conteudos_institucionais)}
                <article class="conteudo-card">
                    <div class="conteudo-header">
                        <span
                            class="categoria-badge {getCategoriaColor(
                                conteudo.categoria,
                            )}"
                        >
                            {conteudo.categoria}
                        </span>
                        <span class="date">
                            {formatDate(
                                conteudo.atualizado_conteudo ||
                                    conteudo.created_at,
                            )}
                        </span>
                    </div>
                    <div class="conteudo-body">
                        <p class="conteudo-text">{conteudo.conteudo}</p>
                        {#if conteudo.anexo_url}
                            <a
                                href={conteudo.anexo_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                class="anexo-link"
                            >
                                📎 Ver anexo
                            </a>
                        {/if}
                    </div>
                    <div class="conteudo-footer">
                        <div class="meta">
                            {#if conteudo.docentes?.nome_docente}
                                <span
                                    >Por: {conteudo.docentes.nome_docente}</span
                                >
                            {/if}
                            {#if conteudo.unidades?.nome_unidade}
                                <span>• {conteudo.unidades.nome_unidade}</span>
                            {/if}
                        </div>
                        <div class="actions">
                            <button
                                type="button"
                                class="btn-action btn-edit"
                                on:click={() => openEditForm(conteudo)}
                                title="Editar"
                            >
                                ✏️
                            </button>
                            <button
                                type="button"
                                class="btn-action btn-delete"
                                on:click={() =>
                                    confirmDelete(
                                        conteudo.id_conteudos_institucionais,
                                    )}
                                title="Excluir"
                            >
                                🗑️
                            </button>
                        </div>
                    </div>
                </article>
            {/each}
        </div>

        <!-- Pagination -->
        {#if totalPages > 1}
            <div class="pagination">
                <button
                    type="button"
                    class="btn-page"
                    disabled={page === 1}
                    on:click={() => handlePageChange(page - 1)}
                >
                    ← Anterior
                </button>
                <span class="page-info">
                    Página {page} de {totalPages}
                </span>
                <button
                    type="button"
                    class="btn-page"
                    disabled={page === totalPages}
                    on:click={() => handlePageChange(page + 1)}
                >
                    Próxima →
                </button>
            </div>
        {/if}
    {/if}
</div>

<!-- Form Modal -->
{#if showForm}
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <div class="modal-overlay" on:click={closeForm}>
        <div class="modal" on:click|stopPropagation>
            <div class="modal-header">
                <h3>{isEditing ? "Editar Conteúdo" : "Novo Conteúdo"}</h3>
                <button type="button" class="close-btn" on:click={closeForm}>
                    &times;
                </button>
            </div>
            <form on:submit|preventDefault={handleSubmit}>
                <div class="form-group">
                    <label for="categoria"
                        >Categoria <span class="required">*</span></label
                    >
                    <select id="categoria" bind:value={formCategoria} required>
                        <option value="">Selecione uma categoria</option>
                        {#each categoriasPredefinidas as cat}
                            <option value={cat}>{cat}</option>
                        {/each}
                    </select>
                </div>

                <div class="form-group">
                    <label for="conteudo"
                        >Conteúdo <span class="required">*</span></label
                    >
                    <textarea
                        id="conteudo"
                        bind:value={formConteudo}
                        rows="6"
                        placeholder="Digite o conteúdo aqui..."
                        required
                    ></textarea>
                </div>

                <div class="form-group">
                    <label for="anexo">URL do Anexo (opcional)</label>
                    <input
                        id="anexo"
                        type="url"
                        bind:value={formAnexoUrl}
                        placeholder="https://exemplo.com/documento.pdf"
                    />
                </div>

                {#if unidades.length > 0}
                    <div class="form-group">
                        <label for="unidade">Unidade (opcional)</label>
                        <select id="unidade" bind:value={formUnidadeId}>
                            <option value={null}>Todas as unidades</option>
                            {#each unidades as unidade}
                                <option value={unidade.id_unidade}>
                                    {unidade.nome_unidade}
                                </option>
                            {/each}
                        </select>
                    </div>
                {/if}

                <div class="form-actions">
                    <button
                        type="button"
                        class="btn-cancel"
                        on:click={closeForm}
                        disabled={isSaving}
                    >
                        Cancelar
                    </button>
                    <button type="submit" class="btn-save" disabled={isSaving}>
                        {isSaving
                            ? "Salvando..."
                            : isEditing
                              ? "Salvar Alterações"
                              : "Criar Conteúdo"}
                    </button>
                </div>
            </form>
        </div>
    </div>
{/if}

<!-- Toast -->
<Toast bind:show={showToast} message={toastMessage} type={toastType} />

<!-- Confirm Dialog -->
<ConfirmDialog
    bind:show={showConfirm}
    title="Confirmar Exclusão"
    message={confirmMessage}
    confirmText="Excluir"
    cancelText="Cancelar"
    on:confirm={handleConfirmAction}
    on:cancel={handleConfirmClose}
/>

<style>
    .conteudos-container {
        width: 100%;
    }

    .header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 1.5rem;
        padding-bottom: 1rem;
        border-bottom: 2px solid #e2e8f0;
    }

    .header-title h2 {
        margin: 0 0 0.25rem 0;
        font-size: 1.5rem;
        color: #2d3748;
    }

    .header-title p {
        margin: 0;
        font-size: 0.9rem;
        color: #718096;
    }

    .btn-new {
        padding: 0.75rem 1.5rem;
        background: #e53e3e;
        color: white;
        border: none;
        border-radius: 8px;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.2s;
    }

    .btn-new:hover {
        background: #c53030;
    }

    .filters {
        display: flex;
        gap: 1rem;
        margin-bottom: 1.5rem;
        flex-wrap: wrap;
    }

    .filter-group {
        display: flex;
        gap: 0.5rem;
    }

    .search-input {
        padding: 0.75rem 1rem;
        border: 1px solid #cbd5e0;
        border-radius: 8px;
        font-size: 0.95rem;
        min-width: 250px;
    }

    .search-input:focus {
        outline: none;
        border-color: #3182ce;
        box-shadow: 0 0 0 2px rgba(49, 130, 206, 0.2);
    }

    .btn-search {
        padding: 0.75rem;
        background: #3182ce;
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        transition: background 0.2s;
    }

    .btn-search:hover {
        background: #2c5282;
    }

    .filter-group select {
        padding: 0.75rem 1rem;
        border: 1px solid #cbd5e0;
        border-radius: 8px;
        font-size: 0.95rem;
        min-width: 180px;
        background: white;
    }

    .filter-group select:focus {
        outline: none;
        border-color: #3182ce;
    }

    .loading {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.75rem;
        padding: 3rem;
        color: #718096;
    }

    .spinner {
        width: 24px;
        height: 24px;
        border: 3px solid #e2e8f0;
        border-top-color: #3182ce;
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }

    .empty-state {
        text-align: center;
        padding: 4rem 2rem;
        color: #718096;
    }

    .empty-icon {
        font-size: 4rem;
        display: block;
        margin-bottom: 1rem;
    }

    .empty-hint {
        font-size: 0.9rem;
        color: #a0aec0;
    }

    .conteudos-list {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .conteudo-card {
        background: white;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 1.25rem;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
        transition: box-shadow 0.2s;
    }

    .conteudo-card:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    }

    .conteudo-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.75rem;
    }

    .categoria-badge {
        padding: 0.25rem 0.75rem;
        border-radius: 9999px;
        font-size: 0.8rem;
        font-weight: 600;
    }

    .date {
        font-size: 0.8rem;
        color: #718096;
    }

    .conteudo-body {
        margin-bottom: 1rem;
    }

    .conteudo-text {
        font-size: 0.95rem;
        color: #4a5568;
        line-height: 1.6;
        margin: 0;
        white-space: pre-wrap;
    }

    .anexo-link {
        display: inline-block;
        margin-top: 0.75rem;
        padding: 0.5rem 1rem;
        background: #edf2f7;
        color: #3182ce;
        border-radius: 6px;
        font-size: 0.85rem;
        text-decoration: none;
        transition: background 0.2s;
    }

    .anexo-link:hover {
        background: #e2e8f0;
    }

    .conteudo-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-top: 0.75rem;
        border-top: 1px solid #e2e8f0;
    }

    .meta {
        font-size: 0.8rem;
        color: #718096;
    }

    .actions {
        display: flex;
        gap: 0.5rem;
    }

    .btn-action {
        padding: 0.5rem;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-size: 1rem;
        transition: all 0.2s;
    }

    .btn-edit {
        background: #ebf8ff;
    }

    .btn-edit:hover {
        background: #bee3f8;
    }

    .btn-delete {
        background: #fed7d7;
    }

    .btn-delete:hover {
        background: #feb2b2;
    }

    .pagination {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 1rem;
        margin-top: 2rem;
        padding-top: 1.5rem;
        border-top: 1px solid #e2e8f0;
    }

    .btn-page {
        padding: 0.5rem 1rem;
        background: #edf2f7;
        border: none;
        border-radius: 6px;
        font-size: 0.9rem;
        cursor: pointer;
        transition: all 0.2s;
    }

    .btn-page:hover:not(:disabled) {
        background: #e2e8f0;
    }

    .btn-page:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .page-info {
        font-size: 0.9rem;
        color: #718096;
    }

    /* Modal styles */
    .modal-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        padding: 1rem;
    }

    .modal {
        background: white;
        border-radius: 12px;
        width: 100%;
        max-width: 600px;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    }

    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1.25rem 1.5rem;
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
        transition: color 0.2s;
    }

    .close-btn:hover {
        color: #2d3748;
    }

    form {
        padding: 1.5rem;
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

    .required {
        color: #e53e3e;
    }

    .form-group input,
    .form-group select,
    .form-group textarea {
        width: 100%;
        padding: 0.75rem;
        border: 1px solid #cbd5e0;
        border-radius: 8px;
        font-size: 0.95rem;
        font-family: inherit;
    }

    .form-group input:focus,
    .form-group select:focus,
    .form-group textarea:focus {
        outline: none;
        border-color: #3182ce;
        box-shadow: 0 0 0 2px rgba(49, 130, 206, 0.2);
    }

    .form-group textarea {
        resize: vertical;
        min-height: 120px;
    }

    .form-actions {
        display: flex;
        gap: 0.75rem;
        justify-content: flex-end;
        padding-top: 1rem;
        border-top: 1px solid #e2e8f0;
    }

    .btn-cancel,
    .btn-save {
        padding: 0.75rem 1.5rem;
        border: none;
        border-radius: 8px;
        font-size: 0.95rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
    }

    .btn-cancel {
        background: #e2e8f0;
        color: #4a5568;
    }

    .btn-cancel:hover:not(:disabled) {
        background: #cbd5e0;
    }

    .btn-save {
        background: #3182ce;
        color: white;
    }

    .btn-save:hover:not(:disabled) {
        background: #2c5282;
    }

    .btn-save:disabled,
    .btn-cancel:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }

    @media (max-width: 640px) {
        .header {
            flex-direction: column;
            gap: 1rem;
        }

        .btn-new {
            width: 100%;
        }

        .filters {
            flex-direction: column;
        }

        .filter-group {
            width: 100%;
        }

        .search-input {
            min-width: 0;
            flex: 1;
        }

        .filter-group select {
            width: 100%;
            min-width: 0;
        }

        .conteudo-footer {
            flex-direction: column;
            gap: 0.75rem;
            align-items: flex-start;
        }
    }
</style>
