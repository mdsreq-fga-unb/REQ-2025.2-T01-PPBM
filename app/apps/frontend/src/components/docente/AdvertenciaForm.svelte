<script lang="ts">
    import { onMount, createEventDispatcher } from "svelte";
    import Toast from "../ui/Toast.svelte";
    import ConfirmDialog from "../ui/ConfirmDialog.svelte";
    import { apiFetch } from "../../lib/api";

    export let alunoId: number | null = null;
    export let alunoNome: string = "";
    export let showHistory: boolean = true;

    const dispatch = createEventDispatcher();

    interface Aluno {
        id_aluno: number;
        nome_aluno: string;
    }

    interface Advertencia {
        id_advertencia: number;
        created_at: string;
        id_aluno: number;
        id_docente: number | null;
        descricao_advertencia: string;
        alunos?: Aluno;
        docentes?: { id_docente: number; nome_docente: string };
    }

    let alunos: Aluno[] = [];
    let advertencias: Advertencia[] = [];
    let selectedAlunoId: number | null = alunoId;
    let descricao = "";
    let loading = false;
    let loadingHistory = false;
    let submitting = false;

    // Toast state
    let toastMessage = "";
    let toastType: "success" | "error" | "warning" | "info" = "info";
    let showToast = false;

    // Confirm dialog state
    let showConfirmDialog = false;

    function displayToast(
        message: string,
        type: "success" | "error" | "warning" | "info" = "info",
    ) {
        toastMessage = message;
        toastType = type;
        showToast = true;
    }

    function formatDate(dateStr: string): string {
        if (!dateStr) return "-";
        const date = new Date(dateStr);
        return date.toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    }

    async function loadAlunos() {
        if (alunoId) return; // Skip if aluno is pre-selected

        try {
            loading = true;
            const response = await apiFetch<{ data: Aluno[] }>(
                "/alunos/listar?pageSize=200",
            );
            if (response.success && response.data) {
                alunos = response.data.data || [];
            }
        } catch (error) {
            console.error("Erro ao carregar alunos:", error);
            displayToast("Erro ao carregar lista de alunos", "error");
        } finally {
            loading = false;
        }
    }

    async function loadAdvertencias() {
        if (!selectedAlunoId || !showHistory) return;

        try {
            loadingHistory = true;
            const response = await apiFetch<{ data: Advertencia[] }>(
                `/advertencias/por-aluno/${selectedAlunoId}`,
            );
            if (response.success && response.data) {
                advertencias = response.data.data || [];
            }
        } catch (error) {
            console.error("Erro ao carregar advertências:", error);
        } finally {
            loadingHistory = false;
        }
    }

    function handleAlunoChange() {
        if (selectedAlunoId) {
            loadAdvertencias();
        } else {
            advertencias = [];
        }
    }

    function confirmSubmit() {
        if (!selectedAlunoId) {
            displayToast("Selecione um aluno", "warning");
            return;
        }
        if (!descricao.trim()) {
            displayToast("Digite a descrição da advertência", "warning");
            return;
        }
        showConfirmDialog = true;
    }

    async function submitAdvertencia() {
        showConfirmDialog = false;

        if (!selectedAlunoId || !descricao.trim()) {
            return;
        }

        try {
            submitting = true;

            const payload = {
                id_aluno: selectedAlunoId,
                descricao_advertencia: descricao.trim(),
            };

            const response = await apiFetch("/advertencias/criar", {
                method: "POST",
                body: JSON.stringify(payload),
            });

            if (response.success) {
                displayToast("Advertência registrada com sucesso!", "success");
                descricao = "";
                loadAdvertencias();
                dispatch("created", response.data);
            } else {
                displayToast(
                    response.error || "Erro ao registrar advertência",
                    "error",
                );
            }
        } catch (error) {
            console.error("Erro ao criar advertência:", error);
            displayToast("Erro ao registrar advertência", "error");
        } finally {
            submitting = false;
        }
    }

    $: if (alunoId) {
        selectedAlunoId = alunoId;
    }

    $: if (selectedAlunoId && showHistory) {
        loadAdvertencias();
    }

    onMount(() => {
        loadAlunos();
        if (alunoId) {
            loadAdvertencias();
        }
    });
</script>

<div class="advertencia-form">
    <div class="form-header">
        <h2>⚠️ Registrar Advertência</h2>
        <p>Registre comportamentos negativos dos alunos</p>
    </div>

    <div class="form-content">
        <!-- Aluno Selection -->
        <div class="form-group">
            <label for="aluno">Aluno</label>
            {#if alunoId && alunoNome}
                <div class="selected-aluno">
                    <span class="aluno-badge">{alunoNome}</span>
                </div>
            {:else}
                <select
                    id="aluno"
                    bind:value={selectedAlunoId}
                    on:change={handleAlunoChange}
                    disabled={loading}
                >
                    <option value={null}>-- Selecione um aluno --</option>
                    {#each alunos as aluno}
                        <option value={aluno.id_aluno}
                            >{aluno.nome_aluno}</option
                        >
                    {/each}
                </select>
            {/if}
        </div>

        <!-- Descrição -->
        <div class="form-group">
            <label for="descricao">Descrição da Advertência</label>
            <textarea
                id="descricao"
                bind:value={descricao}
                placeholder="Descreva o comportamento ou ocorrência..."
                rows="4"
            ></textarea>
            <span class="char-count">{descricao.length} caracteres</span>
        </div>

        <!-- Submit Button -->
        <div class="form-actions">
            <button
                class="btn-submit"
                on:click={confirmSubmit}
                disabled={submitting || !selectedAlunoId || !descricao.trim()}
            >
                {#if submitting}
                    <span class="spinner-small"></span> Registrando...
                {:else}
                    ⚠️ Registrar Advertência
                {/if}
            </button>
        </div>
    </div>

    <!-- Histórico de Advertências -->
    {#if showHistory && selectedAlunoId}
        <div class="history-section">
            <h3>Histórico de Advertências</h3>

            {#if loadingHistory}
                <div class="loading-history">
                    <div class="spinner-small"></div>
                    <span>Carregando histórico...</span>
                </div>
            {:else if advertencias.length === 0}
                <div class="empty-history">
                    <span class="empty-icon">📋</span>
                    <p>Nenhuma advertência registrada para este aluno</p>
                </div>
            {:else}
                <div class="advertencias-list">
                    {#each advertencias as adv}
                        <div class="advertencia-card">
                            <div class="advertencia-header">
                                <span class="advertencia-date"
                                    >{formatDate(adv.created_at)}</span
                                >
                                {#if adv.docentes?.nome_docente}
                                    <span class="advertencia-author"
                                        >por {adv.docentes.nome_docente}</span
                                    >
                                {/if}
                            </div>
                            <p class="advertencia-descricao">
                                {adv.descricao_advertencia}
                            </p>
                        </div>
                    {/each}
                </div>
            {/if}
        </div>
    {/if}
</div>

<!-- Confirm Dialog -->
<ConfirmDialog
    bind:show={showConfirmDialog}
    title="Confirmar Advertência"
    message="Tem certeza que deseja registrar esta advertência? Esta ação não pode ser desfeita."
    confirmText="Confirmar"
    cancelText="Cancelar"
    variant="warning"
    on:confirm={submitAdvertencia}
    on:cancel={() => (showConfirmDialog = false)}
/>

<!-- Toast Notification -->
<Toast bind:show={showToast} message={toastMessage} type={toastType} />

<style>
    .advertencia-form {
        width: 100%;
    }

    .form-header {
        margin-bottom: 1.5rem;
        padding-bottom: 1rem;
        border-bottom: 2px solid #e2e8f0;
    }

    .form-header h2 {
        font-size: 1.5rem;
        margin: 0 0 0.5rem 0;
        color: #2d3748;
    }

    .form-header p {
        font-size: 0.95rem;
        margin: 0;
        color: #718096;
    }

    .form-content {
        background: #fff;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 1.5rem;
        margin-bottom: 2rem;
    }

    .form-group {
        margin-bottom: 1.25rem;
    }

    .form-group:last-child {
        margin-bottom: 0;
    }

    .form-group label {
        display: block;
        font-size: 0.9rem;
        font-weight: 600;
        color: #4a5568;
        margin-bottom: 0.5rem;
    }

    .form-group select,
    .form-group textarea {
        width: 100%;
        padding: 0.75rem 1rem;
        border: 1px solid #cbd5e0;
        border-radius: 8px;
        font-size: 1rem;
        font-family: inherit;
        background-color: #fdfdfd;
        transition:
            border-color 0.3s,
            box-shadow 0.3s;
    }

    .form-group select:focus,
    .form-group textarea:focus {
        outline: none;
        border-color: #ed8936;
        box-shadow: 0 0 0 2px rgba(237, 137, 54, 0.2);
    }

    .form-group textarea {
        resize: vertical;
        min-height: 100px;
    }

    .selected-aluno {
        padding: 0.75rem;
        background: #f7fafc;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
    }

    .aluno-badge {
        font-weight: 600;
        color: #2d3748;
    }

    .char-count {
        display: block;
        text-align: right;
        font-size: 0.8rem;
        color: #718096;
        margin-top: 0.25rem;
    }

    .form-actions {
        margin-top: 1.5rem;
        display: flex;
        justify-content: flex-end;
    }

    .btn-submit {
        padding: 0.75rem 1.5rem;
        background: linear-gradient(135deg, #ed8936 0%, #dd6b20 100%);
        color: white;
        border: none;
        border-radius: 8px;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        transition: all 0.3s;
    }

    .btn-submit:hover:not(:disabled) {
        background: linear-gradient(135deg, #dd6b20 0%, #c05621 100%);
        transform: translateY(-1px);
    }

    .btn-submit:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
    }

    .spinner-small {
        width: 16px;
        height: 16px;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-top-color: white;
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }

    /* History Section */
    .history-section {
        margin-top: 2rem;
    }

    .history-section h3 {
        font-size: 1.1rem;
        color: #2d3748;
        margin: 0 0 1rem 0;
        padding-bottom: 0.5rem;
        border-bottom: 1px solid #e2e8f0;
    }

    .loading-history {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 1rem;
        color: #718096;
    }

    .empty-history {
        text-align: center;
        padding: 2rem;
        background: #f7fafc;
        border-radius: 8px;
        color: #718096;
    }

    .empty-icon {
        font-size: 2rem;
        display: block;
        margin-bottom: 0.5rem;
    }

    .empty-history p {
        margin: 0;
    }

    .advertencias-list {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        max-height: 400px;
        overflow-y: auto;
    }

    .advertencia-card {
        background: #fffaf0;
        border: 1px solid #fbd38d;
        border-left: 4px solid #ed8936;
        border-radius: 8px;
        padding: 1rem;
    }

    .advertencia-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.5rem;
        flex-wrap: wrap;
        gap: 0.5rem;
    }

    .advertencia-date {
        font-size: 0.85rem;
        font-weight: 600;
        color: #c05621;
    }

    .advertencia-author {
        font-size: 0.8rem;
        color: #718096;
    }

    .advertencia-descricao {
        font-size: 0.95rem;
        color: #2d3748;
        margin: 0;
        line-height: 1.5;
        white-space: pre-wrap;
    }

    @media (max-width: 768px) {
        .form-content {
            padding: 1rem;
        }

        .form-actions {
            justify-content: stretch;
        }

        .btn-submit {
            width: 100%;
            justify-content: center;
        }
    }
</style>
