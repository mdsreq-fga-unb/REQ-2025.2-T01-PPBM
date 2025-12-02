<script lang="ts">
    import { onMount } from "svelte";
    import ConfirmDialog from "../ui/ConfirmDialog.svelte";

    export let apiUrl: string;
    export let docenteId: number | null = null;

    interface Responsavel {
        id_responsavel: number;
        nome_responsavel: string;
        telefone_responsavel: string;
        email_responsavel: string;
    }

    interface Aluno {
        id_aluno: number;
        nome_aluno: string;
    }

    interface Notificacao {
        id_notificacoes: number;
        created_at: string;
        id_responsavel: number;
        id_aluno: number | null;
        id_docente: number | null;
        tipo_notifi: string;
        canal_notifi: string;
        mensagem_notifi: string;
        entregue_notif: boolean;
        data_envio: string;
        responsaveis?: Responsavel;
        alunos?: Aluno;
    }

    let notificacoes: Notificacao[] = [];
    let alunos: Aluno[] = [];
    let loading = true;
    let sending = false;
    let activeTab: "mensagens" | "nova" = "mensagens";

    // Filters
    let filterTipo = "";
    let filterCanal = "";
    let filterEntregue = "";

    // New message form
    let selectedAlunoId: number | null = null;
    let selectedResponsavelId: number | null = null;
    let responsaveisDoAluno: Responsavel[] = [];
    let loadingResponsaveis = false;
    let tipoNotificacao = "comunicado";
    let canalNotificacao = "sistema";
    let mensagem = "";

    // Toast
    let showToast = false;
    let toastMessage = "";
    let toastType: "success" | "error" = "success";

    // Modal
    let showModal = false;
    let modalNotificacao: Notificacao | null = null;

    // Confirm dialog state
    let showConfirmDialog = false;
    let confirmDialogTitle = "";
    let confirmDialogMessage = "";
    let confirmDialogAction: (() => Promise<void>) | null = null;
    let confirmLoading = false;

    const tiposNotificacao = [
        { value: "comunicado", label: "Comunicado Geral", icon: "📢" },
        { value: "falta", label: "Aviso de Falta", icon: "❌" },
        { value: "advertencia", label: "Advertência", icon: "⚠️" },
        { value: "justificativa", label: "Justificativa", icon: "📝" },
        { value: "geral", label: "Outro", icon: "💬" },
    ];

    const canaisNotificacao = [
        { value: "sistema", label: "Sistema (interno)", icon: "🔔" },
        { value: "whatsapp", label: "WhatsApp", icon: "📱" },
        { value: "email", label: "E-mail", icon: "✉️" },
    ];

    function displayToast(
        message: string,
        type: "success" | "error" = "success",
    ) {
        toastMessage = message;
        toastType = type;
        showToast = true;
        setTimeout(() => {
            showToast = false;
        }, 4000);
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

    function formatPhone(phone: string): string {
        if (!phone) return "";
        const cleaned = phone.replace(/\D/g, "");
        // Remove country code if present
        const phoneNumber = cleaned.startsWith("55")
            ? cleaned.slice(2)
            : cleaned;
        return phoneNumber;
    }

    function generateWhatsAppLink(phone: string, message: string): string {
        const cleanedPhone = "55" + formatPhone(phone);
        const encodedMessage = encodeURIComponent(message);
        return `https://wa.me/${cleanedPhone}?text=${encodedMessage}`;
    }

    async function loadNotificacoes() {
        try {
            loading = true;
            const params = new URLSearchParams();
            params.append("pageSize", "50");

            if (docenteId) {
                params.append("docenteId", docenteId.toString());
            }
            if (filterTipo) {
                params.append("tipo", filterTipo);
            }
            if (filterCanal) {
                params.append("canal", filterCanal);
            }
            if (filterEntregue) {
                params.append("entregue", filterEntregue);
            }

            const response = await fetch(
                `${apiUrl}/notificacoes/listar?${params}`,
            );
            if (!response.ok) throw new Error("Erro ao carregar notificações");

            const data = await response.json();
            notificacoes = data.data || [];
        } catch (err) {
            console.error("Erro ao carregar notificações:", err);
            displayToast("Erro ao carregar notificações", "error");
        } finally {
            loading = false;
        }
    }

    async function loadAlunos() {
        try {
            const response = await fetch(
                `${apiUrl}/alunos/listar?pageSize=100`,
            );
            if (!response.ok) throw new Error("Erro ao carregar alunos");

            const data = await response.json();
            alunos = data.data || [];
        } catch (err) {
            console.error("Erro ao carregar alunos:", err);
        }
    }

    async function loadResponsaveisDoAluno(alunoId: number) {
        try {
            loadingResponsaveis = true;
            responsaveisDoAluno = [];
            selectedResponsavelId = null;

            const response = await fetch(
                `${apiUrl}/notificacoes/responsaveis-aluno/${alunoId}`,
            );
            if (!response.ok) throw new Error("Erro ao carregar responsáveis");

            const data = await response.json();
            responsaveisDoAluno = data.data || [];

            if (responsaveisDoAluno.length === 1) {
                selectedResponsavelId = responsaveisDoAluno[0].id_responsavel;
            }
        } catch (err) {
            console.error("Erro ao carregar responsáveis:", err);
            displayToast("Erro ao carregar responsáveis do aluno", "error");
        } finally {
            loadingResponsaveis = false;
        }
    }

    function handleAlunoChange() {
        if (selectedAlunoId) {
            loadResponsaveisDoAluno(selectedAlunoId);
        } else {
            responsaveisDoAluno = [];
            selectedResponsavelId = null;
        }
    }

    async function enviarNotificacao() {
        if (!selectedResponsavelId || !mensagem.trim()) {
            displayToast(
                "Selecione um responsável e escreva uma mensagem",
                "error",
            );
            return;
        }

        try {
            sending = true;

            const payload = {
                id_responsavel: selectedResponsavelId,
                id_aluno: selectedAlunoId,
                id_docente: docenteId,
                tipo_notifi: tipoNotificacao,
                canal_notifi: canalNotificacao,
                mensagem_notifi: mensagem.trim(),
            };

            // For WhatsApp, open the link and mark as sent
            if (canalNotificacao === "whatsapp") {
                const responsavel = responsaveisDoAluno.find(
                    (r) => r.id_responsavel === selectedResponsavelId,
                );
                if (responsavel?.telefone_responsavel) {
                    const whatsappLink = generateWhatsAppLink(
                        responsavel.telefone_responsavel,
                        mensagem,
                    );
                    window.open(whatsappLink, "_blank");
                } else {
                    displayToast(
                        "Responsável não possui telefone cadastrado",
                        "error",
                    );
                    sending = false;
                    return;
                }
            }

            // For email, we would integrate with an email service
            // For now, just save the notification
            if (canalNotificacao === "email") {
                const responsavel = responsaveisDoAluno.find(
                    (r) => r.id_responsavel === selectedResponsavelId,
                );
                if (!responsavel?.email_responsavel) {
                    displayToast(
                        "Responsável não possui e-mail cadastrado",
                        "error",
                    );
                    sending = false;
                    return;
                }
                // TODO: Integrate with email service
                displayToast(
                    "Funcionalidade de e-mail será implementada em breve. Notificação salva no sistema.",
                    "success",
                );
            }

            // Save notification to database
            const response = await fetch(`${apiUrl}/notificacoes/criar`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.error || "Erro ao enviar notificação",
                );
            }

            displayToast("Notificação enviada com sucesso!", "success");

            // Reset form
            selectedAlunoId = null;
            selectedResponsavelId = null;
            responsaveisDoAluno = [];
            mensagem = "";
            tipoNotificacao = "comunicado";
            canalNotificacao = "sistema";

            // Switch to messages tab and reload
            activeTab = "mensagens";
            await loadNotificacoes();
        } catch (err) {
            console.error("Erro ao enviar notificação:", err);
            displayToast(
                (err as Error).message || "Erro ao enviar notificação",
                "error",
            );
        } finally {
            sending = false;
        }
    }

    async function deleteNotificacao(id: number) {
        confirmDialogTitle = "Excluir Notificação";
        confirmDialogMessage =
            "Tem certeza que deseja excluir esta notificação?";
        confirmDialogAction = async () => {
            confirmLoading = true;
            try {
                const response = await fetch(
                    `${apiUrl}/notificacoes/deletar/${id}`,
                    {
                        method: "DELETE",
                    },
                );

                if (!response.ok)
                    throw new Error("Erro ao excluir notificação");

                showConfirmDialog = false;
                displayToast("Notificação excluída com sucesso", "success");
                await loadNotificacoes();
            } catch (err) {
                console.error("Erro ao excluir notificação:", err);
                displayToast("Erro ao excluir notificação", "error");
            } finally {
                confirmLoading = false;
            }
        };
        showConfirmDialog = true;
    }

    function openModal(notificacao: Notificacao) {
        modalNotificacao = notificacao;
        showModal = true;
    }

    function closeModal() {
        showModal = false;
        modalNotificacao = null;
    }

    function getTipoIcon(tipo: string): string {
        const found = tiposNotificacao.find((t) => t.value === tipo);
        return found?.icon || "💬";
    }

    function getTipoLabel(tipo: string): string {
        const found = tiposNotificacao.find((t) => t.value === tipo);
        return found?.label || tipo;
    }

    function getCanalIcon(canal: string): string {
        const found = canaisNotificacao.find((c) => c.value === canal);
        return found?.icon || "🔔";
    }

    function getCanalLabel(canal: string): string {
        const found = canaisNotificacao.find((c) => c.value === canal);
        return found?.label || canal;
    }

    onMount(async () => {
        await Promise.all([loadNotificacoes(), loadAlunos()]);
    });

    // Handle filter changes with debounce
    function handleFilterChange() {
        loadNotificacoes();
    }
</script>

<div class="comunicacao-panel">
    <!-- Toast -->
    {#if showToast}
        <div class="toast {toastType}" role="alert">
            <span class="toast-icon">{toastType === "success" ? "✓" : "✕"}</span
            >
            <span>{toastMessage}</span>
        </div>
    {/if}

    <!-- Confirm Dialog -->
    <ConfirmDialog
        bind:show={showConfirmDialog}
        title={confirmDialogTitle}
        message={confirmDialogMessage}
        confirmText="Confirmar"
        cancelText="Cancelar"
        variant="danger"
        loading={confirmLoading}
        on:confirm={async () => {
            if (confirmDialogAction) {
                await confirmDialogAction();
            }
        }}
        on:cancel={() => {
            showConfirmDialog = false;
            confirmDialogAction = null;
        }}
    />

    <!-- Tabs -->
    <div class="tabs">
        <button
            class="tab {activeTab === 'mensagens' ? 'active' : ''}"
            on:click={() => (activeTab = "mensagens")}
        >
            📨 Mensagens Enviadas
        </button>
        <button
            class="tab {activeTab === 'nova' ? 'active' : ''}"
            on:click={() => (activeTab = "nova")}
        >
            ✏️ Nova Mensagem
        </button>
    </div>

    <!-- Messages Tab -->
    {#if activeTab === "mensagens"}
        <div class="filters">
            <div class="filter-group">
                <label for="filter-tipo">Tipo</label>
                <select
                    id="filter-tipo"
                    bind:value={filterTipo}
                    on:change={handleFilterChange}
                >
                    <option value="">Todos</option>
                    {#each tiposNotificacao as tipo}
                        <option value={tipo.value}
                            >{tipo.icon} {tipo.label}</option
                        >
                    {/each}
                </select>
            </div>
            <div class="filter-group">
                <label for="filter-canal">Canal</label>
                <select
                    id="filter-canal"
                    bind:value={filterCanal}
                    on:change={handleFilterChange}
                >
                    <option value="">Todos</option>
                    {#each canaisNotificacao as canal}
                        <option value={canal.value}
                            >{canal.icon} {canal.label}</option
                        >
                    {/each}
                </select>
            </div>
            <div class="filter-group">
                <label for="filter-entregue">Status</label>
                <select
                    id="filter-entregue"
                    bind:value={filterEntregue}
                    on:change={handleFilterChange}
                >
                    <option value="">Todos</option>
                    <option value="true">✅ Entregue</option>
                    <option value="false">⏳ Pendente</option>
                </select>
            </div>
        </div>

        {#if loading}
            <div class="loading">
                <div class="spinner"></div>
                <span>Carregando mensagens...</span>
            </div>
        {:else if notificacoes.length === 0}
            <div class="empty-state">
                <span class="empty-icon">📭</span>
                <p>Nenhuma mensagem encontrada</p>
                <button
                    class="btn-primary"
                    on:click={() => (activeTab = "nova")}
                >
                    Enviar primeira mensagem
                </button>
            </div>
        {:else}
            <div class="messages-list">
                {#each notificacoes as notificacao}
                    <div class="message-card">
                        <div class="message-header">
                            <div class="message-tipo">
                                <span class="tipo-icon"
                                    >{getTipoIcon(
                                        notificacao.tipo_notifi,
                                    )}</span
                                >
                                <span class="tipo-label"
                                    >{getTipoLabel(
                                        notificacao.tipo_notifi,
                                    )}</span
                                >
                            </div>
                            <div class="message-canal">
                                <span
                                    class="canal-badge {notificacao.canal_notifi}"
                                >
                                    {getCanalIcon(notificacao.canal_notifi)}
                                    {getCanalLabel(notificacao.canal_notifi)}
                                </span>
                            </div>
                        </div>

                        <div class="message-body">
                            <p class="message-text">
                                {notificacao.mensagem_notifi}
                            </p>
                        </div>

                        <div class="message-meta">
                            <div class="meta-left">
                                <span class="meta-item">
                                    👤 {notificacao.responsaveis
                                        ?.nome_responsavel || "Responsável"}
                                </span>
                                {#if notificacao.alunos?.nome_aluno}
                                    <span class="meta-item">
                                        🎒 {notificacao.alunos.nome_aluno}
                                    </span>
                                {/if}
                            </div>
                            <div class="meta-right">
                                <span class="meta-date"
                                    >{formatDate(notificacao.created_at)}</span
                                >
                                <span
                                    class="status-badge {notificacao.entregue_notif
                                        ? 'delivered'
                                        : 'pending'}"
                                >
                                    {notificacao.entregue_notif
                                        ? "✅ Entregue"
                                        : "⏳ Pendente"}
                                </span>
                            </div>
                        </div>

                        <div class="message-actions">
                            <button
                                class="btn-icon"
                                on:click={() => openModal(notificacao)}
                                title="Ver detalhes"
                            >
                                👁️
                            </button>
                            <button
                                class="btn-icon danger"
                                on:click={() =>
                                    deleteNotificacao(
                                        notificacao.id_notificacoes,
                                    )}
                                title="Excluir"
                            >
                                🗑️
                            </button>
                        </div>
                    </div>
                {/each}
            </div>
        {/if}
    {/if}

    <!-- New Message Tab -->
    {#if activeTab === "nova"}
        <div class="new-message-form">
            <div class="form-section">
                <h3>📬 Destinatário</h3>

                <div class="form-group">
                    <label for="select-aluno">Selecione o Aluno</label>
                    <select
                        id="select-aluno"
                        bind:value={selectedAlunoId}
                        on:change={handleAlunoChange}
                    >
                        <option value={null}>-- Selecione um aluno --</option>
                        {#each alunos as aluno}
                            <option value={aluno.id_aluno}
                                >{aluno.nome_aluno}</option
                            >
                        {/each}
                    </select>
                </div>

                {#if loadingResponsaveis}
                    <div class="loading-small">
                        <div class="spinner-small"></div>
                        <span>Carregando responsáveis...</span>
                    </div>
                {:else if selectedAlunoId && responsaveisDoAluno.length === 0}
                    <div class="warning-box">
                        ⚠️ Este aluno não possui responsáveis cadastrados.
                    </div>
                {:else if responsaveisDoAluno.length > 0}
                    <div class="form-group">
                        <label for="select-responsavel">Responsável</label>
                        <select
                            id="select-responsavel"
                            bind:value={selectedResponsavelId}
                        >
                            <option value={null}
                                >-- Selecione o responsável --</option
                            >
                            {#each responsaveisDoAluno as resp}
                                <option value={resp.id_responsavel}>
                                    {resp.nome_responsavel}
                                    {resp.telefone_responsavel
                                        ? ` (📱 ${resp.telefone_responsavel})`
                                        : ""}
                                    {resp.email_responsavel
                                        ? ` (✉️ ${resp.email_responsavel})`
                                        : ""}
                                </option>
                            {/each}
                        </select>
                    </div>
                {/if}
            </div>

            <div class="form-section">
                <h3>📝 Mensagem</h3>

                <div class="form-row">
                    <div class="form-group">
                        <label for="tipo-notificacao">Tipo de Notificação</label
                        >
                        <select
                            id="tipo-notificacao"
                            bind:value={tipoNotificacao}
                        >
                            {#each tiposNotificacao as tipo}
                                <option value={tipo.value}
                                    >{tipo.icon} {tipo.label}</option
                                >
                            {/each}
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="canal-notificacao">Canal de Envio</label>
                        <select
                            id="canal-notificacao"
                            bind:value={canalNotificacao}
                        >
                            {#each canaisNotificacao as canal}
                                <option value={canal.value}
                                    >{canal.icon} {canal.label}</option
                                >
                            {/each}
                        </select>
                    </div>
                </div>

                {#if canalNotificacao === "whatsapp"}
                    <div class="info-box">
                        📱 Ao enviar, será aberto o WhatsApp Web com a mensagem
                        pronta para enviar.
                    </div>
                {:else if canalNotificacao === "email"}
                    <div class="info-box">
                        ✉️ A funcionalidade de e-mail será implementada em
                        breve. Por enquanto, a mensagem será salva no sistema.
                    </div>
                {/if}

                <div class="form-group">
                    <label for="mensagem">Mensagem</label>
                    <textarea
                        id="mensagem"
                        bind:value={mensagem}
                        placeholder="Digite sua mensagem aqui..."
                        rows="5"
                    ></textarea>
                    <span class="char-count">{mensagem.length} caracteres</span>
                </div>
            </div>

            <div class="form-actions">
                <button
                    class="btn-secondary"
                    on:click={() => {
                        selectedAlunoId = null;
                        selectedResponsavelId = null;
                        responsaveisDoAluno = [];
                        mensagem = "";
                    }}
                >
                    Limpar
                </button>
                <button
                    class="btn-primary"
                    on:click={enviarNotificacao}
                    disabled={sending ||
                        !selectedResponsavelId ||
                        !mensagem.trim()}
                >
                    {#if sending}
                        <span class="spinner-small"></span> Enviando...
                    {:else}
                        {getCanalIcon(canalNotificacao)} Enviar Mensagem
                    {/if}
                </button>
            </div>
        </div>
    {/if}

    <!-- Modal -->
    {#if showModal && modalNotificacao}
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
                    <h2 id="modal-title">
                        {getTipoIcon(modalNotificacao.tipo_notifi)} Detalhes da Notificação
                    </h2>
                    <button
                        class="modal-close"
                        on:click={closeModal}
                        aria-label="Fechar">×</button
                    >
                </div>
                <div class="modal-body">
                    <div class="detail-row">
                        <span class="detail-label">Tipo:</span>
                        <span class="detail-value"
                            >{getTipoLabel(modalNotificacao.tipo_notifi)}</span
                        >
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Canal:</span>
                        <span class="detail-value"
                            >{getCanalIcon(modalNotificacao.canal_notifi)}
                            {getCanalLabel(modalNotificacao.canal_notifi)}</span
                        >
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Responsável:</span>
                        <span class="detail-value"
                            >{modalNotificacao.responsaveis?.nome_responsavel ||
                                "-"}</span
                        >
                    </div>
                    {#if modalNotificacao.alunos?.nome_aluno}
                        <div class="detail-row">
                            <span class="detail-label">Aluno:</span>
                            <span class="detail-value"
                                >{modalNotificacao.alunos.nome_aluno}</span
                            >
                        </div>
                    {/if}
                    <div class="detail-row">
                        <span class="detail-label">Status:</span>
                        <span
                            class="detail-value status-badge {modalNotificacao.entregue_notif
                                ? 'delivered'
                                : 'pending'}"
                        >
                            {modalNotificacao.entregue_notif
                                ? "✅ Entregue"
                                : "⏳ Pendente"}
                        </span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Data de Envio:</span>
                        <span class="detail-value"
                            >{formatDate(
                                modalNotificacao.data_envio ||
                                    modalNotificacao.created_at,
                            )}</span
                        >
                    </div>
                    <div class="detail-row full">
                        <span class="detail-label">Mensagem:</span>
                        <p class="detail-message">
                            {modalNotificacao.mensagem_notifi}
                        </p>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" on:click={closeModal}
                        >Fechar</button
                    >
                </div>
            </div>
        </div>
    {/if}
</div>

<style>
    .comunicacao-panel {
        font-family: "Inter", sans-serif;
    }

    /* Toast */
    .toast {
        position: fixed;
        top: 100px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        z-index: 1000;
        animation: slideIn 0.3s ease;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .toast.success {
        background-color: #48bb78;
        color: white;
    }

    .toast.error {
        background-color: #e53e3e;
        color: white;
    }

    .toast-icon {
        font-weight: bold;
        font-size: 1.1rem;
    }

    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    /* Tabs */
    .tabs {
        display: flex;
        gap: 0;
        border-bottom: 2px solid #e2e8f0;
        margin-bottom: 1.5rem;
    }

    .tab {
        padding: 1rem 1.5rem;
        border: none;
        background: none;
        font-size: 1rem;
        font-weight: 600;
        color: #718096;
        cursor: pointer;
        position: relative;
        transition: color 0.3s;
    }

    .tab:hover {
        color: #2d3748;
    }

    .tab.active {
        color: #e53e3e;
    }

    .tab.active::after {
        content: "";
        position: absolute;
        bottom: -2px;
        left: 0;
        right: 0;
        height: 3px;
        background: #e53e3e;
        border-radius: 3px 3px 0 0;
    }

    /* Filters */
    .filters {
        display: flex;
        gap: 1rem;
        margin-bottom: 1.5rem;
        flex-wrap: wrap;
    }

    .filter-group {
        display: flex;
        flex-direction: column;
        min-width: 150px;
    }

    .filter-group label {
        font-size: 0.85rem;
        font-weight: 500;
        color: #718096;
        margin-bottom: 0.5rem;
    }

    .filter-group select {
        padding: 0.6rem 1rem;
        border: 1px solid #cbd5e0;
        border-radius: 6px;
        font-size: 0.95rem;
        background-color: #fff;
    }

    .filter-group select:focus {
        outline: none;
        border-color: #3182ce;
        box-shadow: 0 0 0 2px rgba(49, 130, 206, 0.2);
    }

    /* Loading */
    .loading {
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

    .loading-small {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: #718096;
        font-size: 0.9rem;
        padding: 0.5rem 0;
    }

    .spinner-small {
        width: 16px;
        height: 16px;
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

    /* Empty State */
    .empty-state {
        text-align: center;
        padding: 3rem;
        color: #718096;
    }

    .empty-icon {
        font-size: 3rem;
        display: block;
        margin-bottom: 1rem;
    }

    .empty-state p {
        margin-bottom: 1.5rem;
    }

    /* Messages List */
    .messages-list {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .message-card {
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 1.25rem;
        background-color: #fff;
        transition: box-shadow 0.3s;
    }

    .message-card:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    }

    .message-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.75rem;
    }

    .message-tipo {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .tipo-icon {
        font-size: 1.25rem;
    }

    .tipo-label {
        font-weight: 600;
        color: #2d3748;
    }

    .canal-badge {
        padding: 0.25rem 0.75rem;
        border-radius: 20px;
        font-size: 0.8rem;
        font-weight: 500;
    }

    .canal-badge.sistema {
        background-color: #ebf8ff;
        color: #2b6cb0;
    }

    .canal-badge.whatsapp {
        background-color: #c6f6d5;
        color: #22543d;
    }

    .canal-badge.email {
        background-color: #fed7e2;
        color: #97266d;
    }

    .message-body {
        margin-bottom: 0.75rem;
    }

    .message-text {
        color: #4a5568;
        line-height: 1.5;
        margin: 0;
        white-space: pre-wrap;
    }

    .message-meta {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 0.85rem;
        color: #718096;
        flex-wrap: wrap;
        gap: 0.5rem;
    }

    .meta-left {
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;
    }

    .meta-right {
        display: flex;
        gap: 1rem;
        align-items: center;
    }

    .status-badge {
        padding: 0.2rem 0.6rem;
        border-radius: 12px;
        font-size: 0.75rem;
        font-weight: 500;
    }

    .status-badge.delivered {
        background-color: #c6f6d5;
        color: #22543d;
    }

    .status-badge.pending {
        background-color: #feebc8;
        color: #c05621;
    }

    .message-actions {
        display: flex;
        gap: 0.5rem;
        justify-content: flex-end;
        margin-top: 0.75rem;
        padding-top: 0.75rem;
        border-top: 1px solid #e2e8f0;
    }

    .btn-icon {
        padding: 0.5rem;
        border: none;
        background: #f7fafc;
        border-radius: 6px;
        cursor: pointer;
        font-size: 1rem;
        transition: background-color 0.3s;
    }

    .btn-icon:hover {
        background-color: #e2e8f0;
    }

    .btn-icon.danger:hover {
        background-color: #fed7d7;
    }

    /* New Message Form */
    .new-message-form {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
    }

    .form-section {
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 1.5rem;
        background-color: #fff;
    }

    .form-section h3 {
        margin: 0 0 1rem 0;
        font-size: 1.1rem;
        color: #2d3748;
    }

    .form-group {
        margin-bottom: 1rem;
    }

    .form-group:last-child {
        margin-bottom: 0;
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
        padding: 0.75rem 1rem;
        border: 1px solid #cbd5e0;
        border-radius: 6px;
        font-size: 1rem;
        font-family: inherit;
        background-color: #fdfdfd;
    }

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

    .char-count {
        display: block;
        text-align: right;
        font-size: 0.8rem;
        color: #718096;
        margin-top: 0.25rem;
    }

    .form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
    }

    .info-box {
        background-color: #ebf8ff;
        border: 1px solid #90cdf4;
        border-radius: 8px;
        padding: 0.75rem 1rem;
        font-size: 0.9rem;
        color: #2b6cb0;
        margin-bottom: 1rem;
    }

    .warning-box {
        background-color: #fffaf0;
        border: 1px solid #f6ad55;
        border-radius: 8px;
        padding: 0.75rem 1rem;
        font-size: 0.9rem;
        color: #c05621;
    }

    .form-actions {
        display: flex;
        justify-content: flex-end;
        gap: 1rem;
    }

    .btn-primary,
    .btn-secondary {
        padding: 0.75rem 1.5rem;
        border-radius: 6px;
        border: none;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        transition: all 0.3s;
    }

    .btn-primary {
        background-color: #e53e3e;
        color: white;
    }

    .btn-primary:hover:not(:disabled) {
        background-color: #c53030;
    }

    .btn-primary:disabled {
        background-color: #cbd5e0;
        cursor: not-allowed;
    }

    .btn-secondary {
        background-color: #e2e8f0;
        color: #4a5568;
    }

    .btn-secondary:hover {
        background-color: #cbd5e0;
    }

    /* Modal */
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
        max-width: 500px;
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

    .detail-row {
        display: flex;
        margin-bottom: 1rem;
    }

    .detail-row.full {
        flex-direction: column;
    }

    .detail-label {
        font-weight: 600;
        color: #4a5568;
        min-width: 120px;
    }

    .detail-value {
        color: #2d3748;
    }

    .detail-message {
        background-color: #f7fafc;
        padding: 1rem;
        border-radius: 8px;
        margin-top: 0.5rem;
        white-space: pre-wrap;
        line-height: 1.6;
    }

    .modal-footer {
        padding: 1rem 1.5rem;
        border-top: 1px solid #e2e8f0;
        display: flex;
        justify-content: flex-end;
    }

    /* Responsive */
    @media (max-width: 768px) {
        .tabs {
            flex-direction: column;
        }

        .tab {
            text-align: left;
        }

        .tab.active::after {
            display: none;
        }

        .tab.active {
            background-color: #fff5f5;
            border-radius: 8px;
        }

        .filters {
            flex-direction: column;
        }

        .filter-group {
            width: 100%;
        }

        .form-row {
            grid-template-columns: 1fr;
        }

        .message-meta {
            flex-direction: column;
            align-items: flex-start;
        }

        .form-actions {
            flex-direction: column;
        }

        .btn-primary,
        .btn-secondary {
            width: 100%;
            justify-content: center;
        }
    }
</style>
