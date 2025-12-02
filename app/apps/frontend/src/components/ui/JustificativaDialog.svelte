<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { apiFetch } from "../../lib/api";

    export let show: boolean = false;
    export let justificativaId: number | null = null;
    export let alunoId: number | null = null;
    export let alunoNome: string = "";
    export let presencaId: number | null = null;
    export let readOnly: boolean = false;

    interface Justificativa {
        id_justificativa: number;
        id_aluno: number;
        id_docente: number | null;
        motivo_justificativa: string;
        anexo_url: string | null;
        aprovado_por_docente_justificativa: boolean | null;
        created_at: string;
    }

    let motivo = "";
    let anexoUrl = "";
    let aprovado: boolean | null = null;
    let loading = false;
    let saving = false;
    let error = "";

    const dispatch = createEventDispatcher<{
        save: { justificativaId: number };
        close: void;
    }>();

    $: if (show) {
        if (justificativaId) {
            loadJustificativa();
        } else {
            resetForm();
        }
    }

    function resetForm() {
        motivo = "";
        anexoUrl = "";
        aprovado = null;
        error = "";
        loading = false;
        saving = false;
    }

    async function loadJustificativa() {
        if (!justificativaId) return;

        loading = true;
        error = "";

        try {
            const response = await apiFetch<{ data: Justificativa }>(
                `/justificativas/detalhe/${justificativaId}`,
            );

            if (!response.success) {
                throw new Error(
                    response.error || "Erro ao carregar justificativa",
                );
            }

            const data = response.data?.data;
            if (data) {
                motivo = data.motivo_justificativa || "";
                anexoUrl = data.anexo_url || "";
                aprovado = data.aprovado_por_docente_justificativa;
            }
        } catch (err) {
            console.error("Erro ao carregar justificativa:", err);
            error = "Erro ao carregar justificativa";
        } finally {
            loading = false;
        }
    }

    async function handleSave() {
        if (!motivo.trim()) {
            error = "O motivo da justificativa é obrigatório";
            return;
        }

        if (!alunoId) {
            error = "Aluno não identificado";
            return;
        }

        saving = true;
        error = "";

        try {
            const payload = {
                id_aluno: alunoId,
                motivo_justificativa: motivo.trim(),
                anexo_url: anexoUrl.trim() || null,
                aprovado_por_docente_justificativa: aprovado,
            };

            let response;
            let newJustificativaId: number;

            if (justificativaId) {
                // Update existing
                response = await apiFetch<{ data: Justificativa }>(
                    `/justificativas/atualizar/${justificativaId}`,
                    {
                        method: "PUT",
                        body: JSON.stringify(payload),
                    },
                );
                newJustificativaId = justificativaId;
            } else {
                // Create new
                response = await apiFetch<{ data: Justificativa }>(
                    `/justificativas/criar`,
                    {
                        method: "POST",
                        body: JSON.stringify(payload),
                    },
                );
                newJustificativaId = response.data?.data?.id_justificativa || 0;
            }

            if (!response.success) {
                throw new Error(
                    response.error || "Erro ao salvar justificativa",
                );
            }

            // If we have a presencaId and created a new justificativa, link them
            if (presencaId && newJustificativaId && !justificativaId) {
                await apiFetch(`/presencas/atualizar/${presencaId}`, {
                    method: "PUT",
                    body: JSON.stringify({
                        id_justificativa: newJustificativaId,
                    }),
                });
            }

            dispatch("save", { justificativaId: newJustificativaId });
            handleClose();
        } catch (err) {
            console.error("Erro ao salvar justificativa:", err);
            error =
                err instanceof Error
                    ? err.message
                    : "Erro ao salvar justificativa";
        } finally {
            saving = false;
        }
    }

    function handleClose() {
        resetForm();
        show = false;
        dispatch("close");
    }

    function handleKeydown(e: KeyboardEvent) {
        if (e.key === "Escape" && !saving) {
            handleClose();
        }
    }

    function handleOverlayClick(e: MouseEvent) {
        if (e.target === e.currentTarget && !saving) {
            handleClose();
        }
    }

    function getAprovadoLabel(value: boolean | null): string {
        if (value === null) return "Pendente";
        return value ? "Aprovada" : "Rejeitada";
    }

    function getAprovadoClass(value: boolean | null): string {
        if (value === null) return "pendente";
        return value ? "aprovada" : "rejeitada";
    }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if show}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
        class="modal-overlay"
        on:click={handleOverlayClick}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        tabindex="-1"
    >
        <div class="modal">
            <div class="modal-header">
                <h3 class="modal-title" id="dialog-title">
                    {justificativaId
                        ? "Detalhes da Justificativa"
                        : "Nova Justificativa"}
                </h3>
                <button
                    type="button"
                    class="close-btn"
                    on:click={handleClose}
                    disabled={saving}
                    aria-label="Fechar"
                >
                    ✕
                </button>
            </div>

            {#if loading}
                <div class="loading-state">
                    <span class="loading-spinner"></span>
                    Carregando...
                </div>
            {:else}
                <div class="modal-body">
                    <div class="aluno-info">
                        <span class="label">Aluno:</span>
                        <span class="value">{alunoNome || "N/A"}</span>
                    </div>

                    {#if error}
                        <div class="error-message">
                            {error}
                        </div>
                    {/if}

                    <div class="form-group">
                        <label for="motivo">Motivo da Justificativa *</label>
                        <textarea
                            id="motivo"
                            bind:value={motivo}
                            placeholder="Descreva o motivo da falta..."
                            rows="4"
                            disabled={readOnly || saving}
                            class:readonly={readOnly}
                        ></textarea>
                    </div>

                    <div class="form-group">
                        <label for="anexo">URL do Anexo (opcional)</label>
                        <input
                            type="url"
                            id="anexo"
                            bind:value={anexoUrl}
                            placeholder="https://exemplo.com/documento.pdf"
                            disabled={readOnly || saving}
                            class:readonly={readOnly}
                        />
                        <span class="hint"
                            >Link para documento comprobatório (atestado,
                            declaração, etc.)</span
                        >
                    </div>

                    <div class="form-group">
                        <label for="aprovado">Status da Aprovação</label>
                        {#if readOnly}
                            <div
                                class="status-badge {getAprovadoClass(
                                    aprovado,
                                )}"
                            >
                                {getAprovadoLabel(aprovado)}
                            </div>
                        {:else}
                            <select
                                id="aprovado"
                                bind:value={aprovado}
                                disabled={saving}
                            >
                                <option value={null}>Pendente</option>
                                <option value={true}>Aprovada</option>
                                <option value={false}>Rejeitada</option>
                            </select>
                        {/if}
                    </div>
                </div>

                <div class="modal-footer">
                    <button
                        type="button"
                        class="btn btn-cancel"
                        on:click={handleClose}
                        disabled={saving}
                    >
                        {readOnly ? "Fechar" : "Cancelar"}
                    </button>
                    {#if !readOnly}
                        <button
                            type="button"
                            class="btn btn-save"
                            on:click={handleSave}
                            disabled={saving}
                        >
                            {#if saving}
                                <span class="spinner"></span>
                                Salvando...
                            {:else}
                                {justificativaId ? "Atualizar" : "Salvar"}
                            {/if}
                        </button>
                    {/if}
                </div>
            {/if}
        </div>
    </div>
{/if}

<style>
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
        border-radius: 12px;
        max-width: 500px;
        width: 90%;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
        animation: scaleIn 0.2s ease-out;
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
        padding: 1.25rem 1.5rem;
        border-bottom: 1px solid #e2e8f0;
    }

    .modal-title {
        margin: 0;
        font-size: 1.25rem;
        color: #2d3748;
    }

    .close-btn {
        background: none;
        border: none;
        font-size: 1.25rem;
        color: #718096;
        cursor: pointer;
        padding: 0.25rem;
        line-height: 1;
        transition: color 0.2s;
    }

    .close-btn:hover:not(:disabled) {
        color: #2d3748;
    }

    .close-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .modal-body {
        padding: 1.5rem;
    }

    .aluno-info {
        background: #f7fafc;
        padding: 0.75rem 1rem;
        border-radius: 8px;
        margin-bottom: 1.25rem;
        display: flex;
        gap: 0.5rem;
    }

    .aluno-info .label {
        color: #718096;
        font-weight: 500;
    }

    .aluno-info .value {
        color: #2d3748;
        font-weight: 600;
    }

    .error-message {
        background: #fed7d7;
        color: #c53030;
        padding: 0.75rem 1rem;
        border-radius: 6px;
        margin-bottom: 1rem;
        font-size: 0.9rem;
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

    .form-group textarea,
    .form-group input,
    .form-group select {
        width: 100%;
        padding: 0.75rem;
        border: 1px solid #cbd5e0;
        border-radius: 6px;
        font-size: 1rem;
        color: #2d3748;
        background-color: #fdfdfd;
        font-family: inherit;
        transition:
            border-color 0.2s,
            box-shadow 0.2s;
    }

    .form-group textarea {
        resize: vertical;
        min-height: 100px;
    }

    .form-group textarea:focus,
    .form-group input:focus,
    .form-group select:focus {
        outline: none;
        border-color: #3182ce;
        box-shadow: 0 0 0 2px rgba(49, 130, 206, 0.2);
    }

    .form-group textarea.readonly,
    .form-group input.readonly {
        background-color: #edf2f7;
        cursor: not-allowed;
    }

    .form-group .hint {
        display: block;
        font-size: 0.8rem;
        color: #718096;
        margin-top: 0.35rem;
    }

    .status-badge {
        display: inline-block;
        padding: 0.5rem 1rem;
        border-radius: 6px;
        font-weight: 600;
        font-size: 0.9rem;
    }

    .status-badge.pendente {
        background: #feebc8;
        color: #c05621;
    }

    .status-badge.aprovada {
        background: #c6f6d5;
        color: #2f855a;
    }

    .status-badge.rejeitada {
        background: #fed7d7;
        color: #c53030;
    }

    .modal-footer {
        display: flex;
        justify-content: flex-end;
        gap: 0.75rem;
        padding: 1rem 1.5rem;
        border-top: 1px solid #e2e8f0;
        background: #f7fafc;
        border-radius: 0 0 12px 12px;
    }

    .btn {
        padding: 0.65rem 1.25rem;
        border-radius: 6px;
        border: none;
        font-size: 0.95rem;
        font-weight: 600;
        cursor: pointer;
        transition:
            background-color 0.2s,
            opacity 0.2s;
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
    }

    .btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
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
        background: #2b6cb0;
    }

    .loading-state {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.75rem;
        padding: 3rem;
        color: #718096;
    }

    .loading-spinner,
    .spinner {
        display: inline-block;
        width: 20px;
        height: 20px;
        border: 2px solid #e2e8f0;
        border-top-color: #3182ce;
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }

    .spinner {
        width: 16px;
        height: 16px;
        border-width: 2px;
        border-top-color: white;
    }

    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }

    @media (max-width: 480px) {
        .modal {
            width: 95%;
            margin: 1rem;
        }

        .modal-header,
        .modal-body,
        .modal-footer {
            padding: 1rem;
        }

        .modal-footer {
            flex-direction: column-reverse;
        }

        .btn {
            width: 100%;
            justify-content: center;
        }
    }
</style>
