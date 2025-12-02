<script lang="ts">
    import { onMount, onDestroy } from "svelte";
    import { apiFetch } from "../../lib/api";
    import Toast from "../ui/Toast.svelte";
    import ConfirmDialog from "../ui/ConfirmDialog.svelte";

    export let alunoId: number = 0;
    export let alunoNome: string = "";

    // Listen for external updates to alunoId
    function handleSetAlunoId(
        event: CustomEvent<{ alunoId: number; alunoNome: string }>,
    ) {
        alunoId = event.detail.alunoId;
        alunoNome = event.detail.alunoNome || "";
        if (alunoId > 0) {
            loadDocumentos();
        }
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

    // State
    let documentos: Array<{
        id: number;
        tipo: string;
        descricao: string;
        url: string;
        data: string;
        docente?: string;
    }> = [];
    let isLoading = true;
    let isUploading = false;

    // Upload form state
    let showUploadForm = false;
    let selectedFile: File | null = null;
    let tipoDocumento = "laudo_medico";
    let descricaoDocumento = "";

    // Confirm dialog
    let showConfirm = false;
    let confirmMessage = "";
    let confirmCallback: (() => void) | null = null;
    let documentoToDelete: number | null = null;

    // Document types
    const tiposDocumento = [
        { value: "laudo_medico", label: "Laudo Médico" },
        { value: "identificacao", label: "Documento de Identificação" },
        { value: "comprovante", label: "Comprovante" },
        { value: "atestado", label: "Atestado" },
        { value: "outro", label: "Outro" },
    ];

    function getTipoLabel(tipo: string): string {
        const found = tiposDocumento.find((t) => t.value === tipo);
        return found?.label || tipo;
    }

    function formatDate(dateStr: string): string {
        if (!dateStr) return "-";
        const date = new Date(dateStr);
        return date.toLocaleDateString("pt-BR");
    }

    async function loadDocumentos() {
        if (!alunoId) return;

        isLoading = true;
        try {
            const response = await apiFetch<{
                success: boolean;
                data: typeof documentos;
            }>(`/documentos/aluno/${alunoId}`);

            if (response.success && response.data) {
                const data = response.data as any;
                documentos = data.data || data || [];
            }
        } catch (error) {
            console.error("Error loading documents:", error);
            displayToast("Erro ao carregar documentos", "error");
        } finally {
            isLoading = false;
        }
    }

    function handleFileSelect(event: Event) {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            selectedFile = input.files[0];

            // Validate file size (10MB max)
            if (selectedFile.size > 10 * 1024 * 1024) {
                displayToast("Arquivo muito grande. Máximo: 10MB", "error");
                selectedFile = null;
                input.value = "";
            }
        }
    }

    async function handleUpload() {
        if (!selectedFile) {
            displayToast("Selecione um arquivo", "warning");
            return;
        }

        isUploading = true;

        try {
            const formData = new FormData();
            formData.append("arquivo", selectedFile);
            formData.append("tipo", tipoDocumento);
            formData.append(
                "descricao",
                descricaoDocumento || selectedFile.name,
            );

            // Use fetch directly for file upload
            const apiUrl =
                (import.meta as any).env?.PUBLIC_API_URL ||
                "http://localhost:3000";
            const token = localStorage.getItem("bm_token");

            const response = await fetch(
                `${apiUrl}/documentos/upload/${alunoId}`,
                {
                    method: "POST",
                    headers: {
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                    body: formData,
                },
            );

            const result = await response.json();

            if (result.success) {
                displayToast("Documento enviado com sucesso!", "success");
                showUploadForm = false;
                selectedFile = null;
                descricaoDocumento = "";
                tipoDocumento = "laudo_medico";
                await loadDocumentos();
            } else {
                displayToast(
                    result.error || "Erro ao enviar documento",
                    "error",
                );
            }
        } catch (error) {
            console.error("Upload error:", error);
            displayToast("Erro ao enviar documento", "error");
        } finally {
            isUploading = false;
        }
    }

    async function handleDownload(docId: number, nome: string) {
        try {
            // Fetch signed URL from backend
            const response = await apiFetch<{
                success: boolean;
                data: { url: string; nome: string; expiresIn: number };
            }>(`/documentos/download/${docId}`);

            console.log("Download response:", response);

            if (response.success && response.data) {
                // Handle nested data structure from apiFetch
                const responseData = response.data as any;
                const downloadUrl = responseData.data?.url || responseData.url;

                console.log("Download URL:", downloadUrl);

                if (downloadUrl && downloadUrl !== "") {
                    // Use a temporary anchor element for more reliable download
                    const link = document.createElement("a");
                    link.href = downloadUrl;
                    link.target = "_blank";
                    link.rel = "noopener noreferrer";
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                } else {
                    displayToast("URL de download não disponível", "error");
                }
            } else {
                displayToast("Erro ao obter link de download", "error");
            }
        } catch (error) {
            console.error("Download error:", error);
            displayToast("Erro ao obter link de download", "error");
        }
    }

    function confirmDelete(id: number) {
        documentoToDelete = id;
        confirmMessage = "Tem certeza que deseja excluir este documento?";
        showConfirm = true;
        confirmCallback = () => deleteDocumento(id);
    }

    async function deleteDocumento(id: number) {
        try {
            const response = await apiFetch(`/documentos/deletar/${id}`, {
                method: "DELETE",
            });

            if (response.success) {
                displayToast("Documento removido com sucesso", "success");
                await loadDocumentos();
            } else {
                displayToast("Erro ao remover documento", "error");
            }
        } catch (error) {
            console.error("Delete error:", error);
            displayToast("Erro ao remover documento", "error");
        }
    }

    function handleConfirmClose() {
        showConfirm = false;
        documentoToDelete = null;
        confirmCallback = null;
    }

    function handleConfirmAction() {
        if (confirmCallback) {
            confirmCallback();
        }
        handleConfirmClose();
    }

    function cancelUpload() {
        showUploadForm = false;
        selectedFile = null;
        descricaoDocumento = "";
        tipoDocumento = "laudo_medico";
    }

    onMount(() => {
        // Listen for external alunoId updates
        window.addEventListener(
            "set-aluno-documentos",
            handleSetAlunoId as EventListener,
        );

        if (alunoId > 0) {
            loadDocumentos();
        }
    });

    onDestroy(() => {
        if (typeof window !== "undefined") {
            window.removeEventListener(
                "set-aluno-documentos",
                handleSetAlunoId as EventListener,
            );
        }
    });
</script>

<section class="documentos-section">
    <div class="section-header">
        <h3>📎 Documentos do Aluno</h3>
        <button
            type="button"
            class="btn-add"
            on:click={() => (showUploadForm = !showUploadForm)}
        >
            {showUploadForm ? "Cancelar" : "+ Novo Documento"}
        </button>
    </div>

    <!-- Upload Form -->
    {#if showUploadForm}
        <div class="upload-form">
            <div class="form-row">
                <div class="form-group">
                    <label for="tipoDoc">Tipo de Documento</label>
                    <select id="tipoDoc" bind:value={tipoDocumento}>
                        {#each tiposDocumento as tipo}
                            <option value={tipo.value}>{tipo.label}</option>
                        {/each}
                    </select>
                </div>
                <div class="form-group">
                    <label for="descDoc">Descrição</label>
                    <input
                        id="descDoc"
                        type="text"
                        bind:value={descricaoDocumento}
                        placeholder="Descrição do documento"
                    />
                </div>
            </div>

            <div class="form-group">
                <label for="fileInput">Arquivo (PDF, JPG, PNG - máx 10MB)</label
                >
                <input
                    id="fileInput"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.webp"
                    on:change={handleFileSelect}
                />
                {#if selectedFile}
                    <p class="file-info">
                        📄 {selectedFile.name} ({(
                            selectedFile.size /
                            1024 /
                            1024
                        ).toFixed(2)} MB)
                    </p>
                {/if}
            </div>

            <div class="form-actions">
                <button
                    type="button"
                    class="btn-cancel"
                    on:click={cancelUpload}
                    disabled={isUploading}
                >
                    Cancelar
                </button>
                <button
                    type="button"
                    class="btn-upload"
                    on:click={handleUpload}
                    disabled={isUploading || !selectedFile}
                >
                    {isUploading ? "Enviando..." : "Enviar Documento"}
                </button>
            </div>
        </div>
    {/if}

    <!-- Documents List -->
    <div class="documentos-list">
        {#if isLoading}
            <p class="loading-text">Carregando documentos...</p>
        {:else if documentos.length === 0}
            <p class="empty-text">
                Nenhum documento cadastrado para este aluno.
            </p>
        {:else}
            <table class="documentos-table">
                <thead>
                    <tr>
                        <th>Tipo</th>
                        <th>Descrição</th>
                        <th>Data</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {#each documentos as doc}
                        <tr>
                            <td>
                                <span class="tipo-badge">
                                    {getTipoLabel(doc.tipo)}
                                </span>
                            </td>
                            <td>{doc.descricao || "-"}</td>
                            <td>{formatDate(doc.data)}</td>
                            <td class="actions">
                                <button
                                    type="button"
                                    class="btn-action btn-view"
                                    on:click={() =>
                                        handleDownload(doc.id, doc.descricao)}
                                    title="Visualizar/Download"
                                >
                                    📥
                                </button>
                                <button
                                    type="button"
                                    class="btn-action btn-delete"
                                    on:click={() => confirmDelete(doc.id)}
                                    title="Excluir"
                                >
                                    🗑️
                                </button>
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        {/if}
    </div>
</section>

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
    .documentos-section {
        margin-top: 2rem;
        padding: 1.5rem;
        background: #f7fafc;
        border-radius: 12px;
        border: 1px solid #e2e8f0;
    }

    .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
        padding-bottom: 0.75rem;
        border-bottom: 1px solid #e2e8f0;
    }

    .section-header h3 {
        margin: 0;
        font-size: 1.1rem;
        color: #2d3748;
    }

    .btn-add {
        padding: 0.5rem 1rem;
        background: #3182ce;
        color: white;
        border: none;
        border-radius: 6px;
        font-size: 0.9rem;
        font-weight: 500;
        cursor: pointer;
        transition: background 0.2s;
    }

    .btn-add:hover {
        background: #2c5282;
    }

    .upload-form {
        background: white;
        padding: 1.25rem;
        border-radius: 8px;
        margin-bottom: 1rem;
        border: 1px solid #e2e8f0;
    }

    .form-row {
        display: grid;
        grid-template-columns: 1fr 2fr;
        gap: 1rem;
        margin-bottom: 1rem;
    }

    .form-group {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .form-group label {
        font-size: 0.85rem;
        font-weight: 500;
        color: #4a5568;
    }

    .form-group input,
    .form-group select {
        padding: 0.6rem;
        border: 1px solid #cbd5e0;
        border-radius: 6px;
        font-size: 0.95rem;
    }

    .form-group input:focus,
    .form-group select:focus {
        outline: none;
        border-color: #3182ce;
        box-shadow: 0 0 0 2px rgba(49, 130, 206, 0.2);
    }

    .file-info {
        margin: 0.5rem 0 0;
        font-size: 0.85rem;
        color: #4a5568;
    }

    .form-actions {
        display: flex;
        gap: 0.75rem;
        justify-content: flex-end;
        margin-top: 1rem;
        padding-top: 1rem;
        border-top: 1px solid #e2e8f0;
    }

    .btn-cancel,
    .btn-upload {
        padding: 0.6rem 1.25rem;
        border: none;
        border-radius: 6px;
        font-size: 0.9rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
    }

    .btn-cancel {
        background: #e2e8f0;
        color: #4a5568;
    }

    .btn-cancel:hover {
        background: #cbd5e0;
    }

    .btn-upload {
        background: #48bb78;
        color: white;
    }

    .btn-upload:hover:not(:disabled) {
        background: #38a169;
    }

    .btn-upload:disabled {
        background: #a0aec0;
        cursor: not-allowed;
    }

    .documentos-list {
        min-height: 100px;
    }

    .loading-text,
    .empty-text {
        text-align: center;
        color: #718096;
        padding: 2rem;
        font-size: 0.95rem;
    }

    .documentos-table {
        width: 100%;
        border-collapse: collapse;
        background: white;
        border-radius: 8px;
        overflow: hidden;
    }

    .documentos-table th {
        text-align: left;
        padding: 0.75rem;
        background: #edf2f7;
        font-size: 0.85rem;
        font-weight: 600;
        color: #4a5568;
    }

    .documentos-table td {
        padding: 0.75rem;
        border-bottom: 1px solid #e2e8f0;
        font-size: 0.9rem;
    }

    .documentos-table tr:last-child td {
        border-bottom: none;
    }

    .tipo-badge {
        display: inline-block;
        padding: 0.25rem 0.5rem;
        background: #ebf8ff;
        color: #2b6cb0;
        border-radius: 4px;
        font-size: 0.8rem;
        font-weight: 500;
    }

    .actions {
        display: flex;
        gap: 0.5rem;
    }

    .btn-action {
        padding: 0.4rem 0.6rem;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 1rem;
        transition: all 0.2s;
    }

    .btn-view {
        background: #ebf8ff;
    }

    .btn-view:hover {
        background: #bee3f8;
    }

    .btn-delete {
        background: #fed7d7;
    }

    .btn-delete:hover {
        background: #feb2b2;
    }

    @media (max-width: 640px) {
        .form-row {
            grid-template-columns: 1fr;
        }

        .section-header {
            flex-direction: column;
            gap: 0.75rem;
            align-items: flex-start;
        }

        .documentos-table {
            font-size: 0.85rem;
        }

        .documentos-table th,
        .documentos-table td {
            padding: 0.5rem;
        }
    }
</style>
