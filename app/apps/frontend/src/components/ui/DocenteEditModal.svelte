<script lang="ts">
    import { createEventDispatcher } from "svelte";

    export let show: boolean = false;
    export let docenteId: number | null = null;
    export let docenteNome: string = "";
    export let docenteEmail: string = "";
    export let apiUrl: string = "";

    interface DocenteData {
        cpf_docente: string;
        unidade_docente: string;
        cidade_docente: string;
    }

    let formData: DocenteData = {
        cpf_docente: "",
        unidade_docente: "",
        cidade_docente: "",
    };

    let isLoading = false;
    let isSaving = false;
    let errorMessage = "";

    const dispatch = createEventDispatcher<{
        save: void;
        cancel: void;
    }>();

    async function getAuthToken(): Promise<string | null> {
        return localStorage.getItem("bm_token");
    }

    function formatCPF(value: string): string {
        const digits = value.replace(/\D/g, "").slice(0, 11);
        if (digits.length <= 3) return digits;
        if (digits.length <= 6)
            return `${digits.slice(0, 3)}.${digits.slice(3)}`;
        if (digits.length <= 9)
            return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
        return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
    }

    function handleCPFInput(e: Event) {
        const input = e.target as HTMLInputElement;
        formData.cpf_docente = formatCPF(input.value);
    }

    async function loadDocenteData() {
        if (!docenteId) return;

        isLoading = true;
        errorMessage = "";

        try {
            const token = await getAuthToken();
            const response = await fetch(
                `${apiUrl}/docentes/detalhe/${docenteId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                },
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.error || "Erro ao carregar dados do docente",
                );
            }

            formData = {
                cpf_docente: data.data.cpf_docente
                    ? formatCPF(data.data.cpf_docente)
                    : "",
                unidade_docente: data.data.unidade_docente || "",
                cidade_docente: data.data.cidade_docente || "",
            };
        } catch (error) {
            console.error("Erro ao carregar docente:", error);
            errorMessage =
                error instanceof Error
                    ? error.message
                    : "Erro ao carregar dados";
        } finally {
            isLoading = false;
        }
    }

    async function handleSave() {
        if (!docenteId) return;

        isSaving = true;
        errorMessage = "";

        try {
            const token = await getAuthToken();
            const payload = {
                cpf_docente: formData.cpf_docente.replace(/\D/g, ""),
                unidade_docente: formData.unidade_docente || null,
                cidade_docente: formData.cidade_docente || null,
            };

            const response = await fetch(
                `${apiUrl}/docentes/atualizar/${docenteId}`,
                {
                    method: "PUT",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(payload),
                },
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.error || "Erro ao salvar dados do docente",
                );
            }

            dispatch("save");
            show = false;
        } catch (error) {
            console.error("Erro ao salvar docente:", error);
            errorMessage =
                error instanceof Error ? error.message : "Erro ao salvar dados";
        } finally {
            isSaving = false;
        }
    }

    function handleCancel() {
        dispatch("cancel");
        show = false;
    }

    function handleKeydown(e: KeyboardEvent) {
        if (e.key === "Escape" && !isSaving) {
            handleCancel();
        }
    }

    function handleOverlayClick(e: MouseEvent) {
        if (e.target === e.currentTarget && !isSaving) {
            handleCancel();
        }
    }

    // Load data when modal opens
    $: if (show && docenteId) {
        loadDocenteData();
    }

    // Reset form when modal closes
    $: if (!show) {
        formData = {
            cpf_docente: "",
            unidade_docente: "",
            cidade_docente: "",
        };
        errorMessage = "";
    }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if show}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <!-- svelte-ignore a11y_interactive_supports_focus -->
    <div
        class="modal-overlay"
        on:click={handleOverlayClick}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
    >
        <div class="modal">
            <div class="modal-header">
                <h3 class="modal-title" id="dialog-title">
                    Editar Dados do Docente
                </h3>
                <button
                    type="button"
                    class="close-btn"
                    on:click={handleCancel}
                    disabled={isSaving}
                    aria-label="Fechar"
                >
                    &times;
                </button>
            </div>

            <div class="docente-info">
                <span class="docente-name">{docenteNome}</span>
                <span class="docente-email">{docenteEmail}</span>
            </div>

            {#if isLoading}
                <div class="loading-state">
                    <span class="spinner-large"></span>
                    <span>Carregando dados...</span>
                </div>
            {:else}
                {#if errorMessage}
                    <div class="error-message">{errorMessage}</div>
                {/if}

                <form on:submit|preventDefault={handleSave}>
                    <div class="form-group">
                        <label for="cpf">CPF</label>
                        <input
                            type="text"
                            id="cpf"
                            value={formData.cpf_docente}
                            on:input={handleCPFInput}
                            placeholder="000.000.000-00"
                            maxlength="14"
                        />
                    </div>

                    <div class="form-group">
                        <label for="unidade">Unidade</label>
                        <input
                            type="text"
                            id="unidade"
                            bind:value={formData.unidade_docente}
                            placeholder="Nome da unidade"
                        />
                    </div>

                    <div class="form-group">
                        <label for="cidade">Cidade</label>
                        <input
                            type="text"
                            id="cidade"
                            bind:value={formData.cidade_docente}
                            placeholder="Nome da cidade"
                        />
                    </div>

                    <div class="modal-buttons">
                        <button
                            type="button"
                            class="modal-btn modal-btn-cancel"
                            on:click={handleCancel}
                            disabled={isSaving}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            class="modal-btn modal-btn-confirm"
                            disabled={isSaving}
                        >
                            {#if isSaving}
                                <span class="spinner"></span>
                                Salvando...
                            {:else}
                                Salvar
                            {/if}
                        </button>
                    </div>
                </form>
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
        padding: 1.5rem;
        border-radius: 12px;
        max-width: 480px;
        width: 90%;
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
        margin-bottom: 1rem;
        padding-bottom: 0.75rem;
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
        font-size: 1.5rem;
        color: #718096;
        cursor: pointer;
        padding: 0;
        line-height: 1;
        transition: color 0.2s;
    }

    .close-btn:hover:not(:disabled) {
        color: #2d3748;
    }

    .close-btn:disabled {
        cursor: not-allowed;
        opacity: 0.5;
    }

    .docente-info {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        padding: 0.75rem;
        background: #f7fafc;
        border-radius: 8px;
        margin-bottom: 1.25rem;
    }

    .docente-name {
        font-weight: 600;
        color: #2d3748;
        font-size: 1rem;
    }

    .docente-email {
        font-size: 0.875rem;
        color: #718096;
    }

    .loading-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 2rem;
        gap: 1rem;
        color: #718096;
    }

    .error-message {
        background: #fed7d7;
        color: #c53030;
        padding: 0.75rem;
        border-radius: 6px;
        margin-bottom: 1rem;
        font-size: 0.9rem;
    }

    .form-group {
        margin-bottom: 1rem;
    }

    .form-group label {
        display: block;
        font-size: 0.9rem;
        font-weight: 500;
        color: #4a5568;
        margin-bottom: 0.5rem;
    }

    .form-group input {
        width: 100%;
        padding: 0.75rem;
        border: 1px solid #cbd5e0;
        border-radius: 6px;
        font-size: 1rem;
        color: #2d3748;
        background: #fdfdfd;
        transition:
            border-color 0.2s,
            box-shadow 0.2s;
        box-sizing: border-box;
    }

    .form-group input:focus {
        outline: none;
        border-color: #3182ce;
        box-shadow: 0 0 0 2px rgba(49, 130, 206, 0.2);
    }

    .form-group input::placeholder {
        color: #a0aec0;
    }

    .modal-buttons {
        display: flex;
        justify-content: flex-end;
        gap: 0.75rem;
        margin-top: 1.5rem;
    }

    .modal-btn {
        padding: 0.625rem 1.25rem;
        border-radius: 6px;
        font-size: 0.95rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
        border: none;
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
    }

    .modal-btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }

    .modal-btn-cancel {
        background: #e2e8f0;
        color: #4a5568;
    }

    .modal-btn-cancel:hover:not(:disabled) {
        background: #cbd5e0;
    }

    .modal-btn-confirm {
        background: #3182ce;
        color: white;
    }

    .modal-btn-confirm:hover:not(:disabled) {
        background: #2c5282;
    }

    .spinner {
        width: 14px;
        height: 14px;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-top-color: white;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
    }

    .spinner-large {
        width: 24px;
        height: 24px;
        border: 3px solid #e2e8f0;
        border-top-color: #3182ce;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }
</style>
