<script lang="ts">
    import { onMount } from "svelte";
    import Toast from "../ui/Toast.svelte";
    import { apiFetch } from "../../lib/api";

    interface Turma {
        id_turma: number;
        nome_turma: string;
        alunos_count: number;
    }

    interface Notificacao {
        id_notificacoes: number;
        created_at: string;
        tipo_notifi: string;
        mensagem_notifi: string;
        entregue_notif: boolean;
        responsaveis?: { nome_responsavel: string };
        alunos?: { nome_aluno: string };
    }

    interface DashboardStats {
        totalTurmas: number;
        totalAlunos: number;
        taxaPresencaMedia: number;
        totalAdvertencias: number;
    }

    let stats: DashboardStats = {
        totalTurmas: 0,
        totalAlunos: 0,
        taxaPresencaMedia: 0,
        totalAdvertencias: 0,
    };

    let turmas: Turma[] = [];
    let recentNotifications: Notificacao[] = [];
    let loading = true;
    let refreshing = false;

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

    function formatDate(dateStr: string): string {
        if (!dateStr) return "-";
        const date = new Date(dateStr);
        return date.toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        });
    }

    function getTipoNotificacaoLabel(tipo: string): string {
        const labels: Record<string, string> = {
            comunicado: "📢 Comunicado",
            falta: "❌ Aviso de Falta",
            advertencia: "⚠️ Advertência",
            justificativa: "📝 Justificativa",
            geral: "💬 Geral",
        };
        return labels[tipo] || "💬 " + tipo;
    }

    async function loadDashboardData() {
        try {
            // Load turmas
            const turmasResponse = await apiFetch<{
                data: Turma[];
                total: number;
            }>("/turmas/listar?pageSize=100");
            if (turmasResponse.success && turmasResponse.data) {
                turmas = turmasResponse.data.data || [];
                stats.totalTurmas = turmasResponse.data.total || turmas.length;
                stats.totalAlunos = turmas.reduce(
                    (acc, t) => acc + (t.alunos_count || 0),
                    0,
                );
            }

            // Load recent notifications
            const notifsResponse = await apiFetch<{ data: Notificacao[] }>(
                "/notificacoes/listar?pageSize=5",
            );
            if (notifsResponse.success && notifsResponse.data) {
                recentNotifications = notifsResponse.data.data || [];
            }

            // Load advertencias count
            const advertenciasResponse = await apiFetch<{ total: number }>(
                "/advertencias/listar?pageSize=1",
            );
            if (advertenciasResponse.success && advertenciasResponse.data) {
                stats.totalAdvertencias = advertenciasResponse.data.total || 0;
            }

            // Calculate average attendance (sample from a few students)
            if (stats.totalAlunos > 0) {
                // Try to get stats from first turma's students
                if (turmas.length > 0) {
                    const alunosResponse = await apiFetch<{
                        alunos: { id_aluno: number }[];
                    }>(`/turmas/${turmas[0].id_turma}/alunos`);
                    if (
                        alunosResponse.success &&
                        alunosResponse.data &&
                        alunosResponse.data.alunos.length > 0
                    ) {
                        // Get stats for first few students
                        const sampleSize = Math.min(
                            5,
                            alunosResponse.data.alunos.length,
                        );
                        let totalTaxa = 0;
                        let count = 0;

                        for (let i = 0; i < sampleSize; i++) {
                            const statsResponse = await apiFetch<{
                                estatisticas: {
                                    presenca: { taxaPresenca: number };
                                };
                            }>(
                                `/alunos/estatisticas/${alunosResponse.data.alunos[i].id_aluno}`,
                            );
                            if (statsResponse.success && statsResponse.data) {
                                totalTaxa +=
                                    statsResponse.data.estatisticas.presenca
                                        .taxaPresenca;
                                count++;
                            }
                        }

                        if (count > 0) {
                            stats.taxaPresencaMedia = Math.round(
                                totalTaxa / count,
                            );
                        }
                    }
                }
            }

            stats = stats; // Trigger reactivity
        } catch (error) {
            console.error("Erro ao carregar dashboard:", error);
            displayToast("Erro ao carregar dados do dashboard", "error");
        }
    }

    async function refreshDashboard() {
        refreshing = true;
        await loadDashboardData();
        refreshing = false;
        displayToast("Dashboard atualizado!", "success");
    }

    function navigateTo(path: string) {
        window.location.href = path;
    }

    onMount(async () => {
        await loadDashboardData();
        loading = false;
    });
</script>

<div class="dashboard">
    <div class="page-header">
        <div class="title">
            <h1>📊 Dashboard</h1>
            <p>Visão geral das suas atividades</p>
        </div>
        <button
            class="btn-refresh"
            on:click={refreshDashboard}
            disabled={refreshing}
        >
            {#if refreshing}
                <span class="spinner-small"></span> Atualizando...
            {:else}
                🔄 Atualizar
            {/if}
        </button>
    </div>

    {#if loading}
        <div class="loading-state">
            <div class="spinner"></div>
            <span>Carregando dashboard...</span>
        </div>
    {:else}
        <!-- Metrics Grid -->
        <div class="metrics-grid">
            <div
                class="metric-card blue"
                on:click={() => navigateTo("/docente/turmas")}
                role="button"
                tabindex="0"
            >
                <div class="metric-icon">👥</div>
                <div class="metric-content">
                    <span class="metric-value">{stats.totalTurmas}</span>
                    <span class="metric-label">Turmas Ativas</span>
                </div>
            </div>

            <div
                class="metric-card green"
                on:click={() => navigateTo("/docente/alunos")}
                role="button"
                tabindex="0"
            >
                <div class="metric-icon">🎒</div>
                <div class="metric-content">
                    <span class="metric-value">{stats.totalAlunos}</span>
                    <span class="metric-label">Alunos Matriculados</span>
                </div>
            </div>

            <div
                class="metric-card purple"
                on:click={() => navigateTo("/docente/relatorios")}
                role="button"
                tabindex="0"
            >
                <div class="metric-icon">📈</div>
                <div class="metric-content">
                    <span class="metric-value">{stats.taxaPresencaMedia}%</span>
                    <span class="metric-label">Taxa de Presença</span>
                </div>
            </div>

            <div
                class="metric-card orange"
                on:click={() => navigateTo("/docente/advertencias")}
                role="button"
                tabindex="0"
            >
                <div class="metric-icon">⚠️</div>
                <div class="metric-content">
                    <span class="metric-value">{stats.totalAdvertencias}</span>
                    <span class="metric-label">Advertências</span>
                </div>
            </div>
        </div>

        <!-- Content Grid -->
        <div class="content-grid">
            <!-- Turmas Section -->
            <div class="section-card">
                <div class="section-header">
                    <h2>Minhas Turmas</h2>
                    <button
                        class="btn-link"
                        on:click={() => navigateTo("/docente/turmas")}
                    >
                        Ver todas →
                    </button>
                </div>
                <div class="section-content">
                    {#if turmas.length === 0}
                        <div class="empty-section">
                            <span>📚</span>
                            <p>Nenhuma turma encontrada</p>
                        </div>
                    {:else}
                        <div class="turmas-list">
                            {#each turmas.slice(0, 4) as turma}
                                <div
                                    class="turma-item"
                                    on:click={() =>
                                        navigateTo("/docente/turmas")}
                                    role="button"
                                    tabindex="0"
                                >
                                    <div class="turma-info">
                                        <span class="turma-nome"
                                            >{turma.nome_turma}</span
                                        >
                                        <span class="turma-alunos"
                                            >{turma.alunos_count} alunos</span
                                        >
                                    </div>
                                    <span class="turma-arrow">→</span>
                                </div>
                            {/each}
                        </div>
                    {/if}
                </div>
            </div>

            <!-- Quick Actions Section -->
            <div class="section-card">
                <div class="section-header">
                    <h2>Ações Rápidas</h2>
                </div>
                <div class="section-content">
                    <div class="quick-actions">
                        <button
                            class="action-btn"
                            on:click={() => navigateTo("/docente/controle")}
                        >
                            <span class="action-icon">📅</span>
                            <span class="action-text">Registrar Presenças</span>
                        </button>
                        <button
                            class="action-btn"
                            on:click={() => navigateTo("/docente/advertencias")}
                        >
                            <span class="action-icon">⚠️</span>
                            <span class="action-text">Nova Advertência</span>
                        </button>
                        <button
                            class="action-btn"
                            on:click={() => navigateTo("/docente/comunicacao")}
                        >
                            <span class="action-icon">💬</span>
                            <span class="action-text">Enviar Mensagem</span>
                        </button>
                        <button
                            class="action-btn"
                            on:click={() => navigateTo("/docente/relatorios")}
                        >
                            <span class="action-icon">📋</span>
                            <span class="action-text">Gerar Relatório</span>
                        </button>
                    </div>
                </div>
            </div>

            <!-- Recent Notifications Section -->
            <div class="section-card full-width">
                <div class="section-header">
                    <h2>Notificações Recentes</h2>
                    <button
                        class="btn-link"
                        on:click={() => navigateTo("/docente/comunicacao")}
                    >
                        Ver todas →
                    </button>
                </div>
                <div class="section-content">
                    {#if recentNotifications.length === 0}
                        <div class="empty-section">
                            <span>📭</span>
                            <p>Nenhuma notificação recente</p>
                        </div>
                    {:else}
                        <div class="notifications-list">
                            {#each recentNotifications as notif}
                                <div class="notification-item">
                                    <div class="notif-type">
                                        {getTipoNotificacaoLabel(
                                            notif.tipo_notifi,
                                        )}
                                    </div>
                                    <div class="notif-content">
                                        <p class="notif-message">
                                            {notif.mensagem_notifi.substring(
                                                0,
                                                100,
                                            )}{notif.mensagem_notifi.length >
                                            100
                                                ? "..."
                                                : ""}
                                        </p>
                                        <div class="notif-meta">
                                            <span class="notif-dest">
                                                {notif.responsaveis
                                                    ?.nome_responsavel ||
                                                    "Responsável"}
                                                {#if notif.alunos?.nome_aluno}
                                                    - {notif.alunos.nome_aluno}
                                                {/if}
                                            </span>
                                            <span class="notif-date"
                                                >{formatDate(
                                                    notif.created_at,
                                                )}</span
                                            >
                                        </div>
                                    </div>
                                    <div
                                        class="notif-status"
                                        class:delivered={notif.entregue_notif}
                                    >
                                        {notif.entregue_notif ? "✅" : "⏳"}
                                    </div>
                                </div>
                            {/each}
                        </div>
                    {/if}
                </div>
            </div>
        </div>
    {/if}
</div>

<!-- Toast Notification -->
<Toast bind:show={showToast} message={toastMessage} type={toastType} />

<style>
    .dashboard {
        width: 100%;
    }

    .page-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
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

    .btn-refresh {
        padding: 0.75rem 1.5rem;
        background-color: #4a5568;
        color: white;
        border: none;
        border-radius: 6px;
        font-size: 0.95rem;
        font-weight: 600;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        transition: background-color 0.3s;
    }

    .btn-refresh:hover:not(:disabled) {
        background-color: #2d3748;
    }

    .btn-refresh:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }

    .loading-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 4rem;
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

    /* Metrics Grid */
    .metrics-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 1.5rem;
        margin-bottom: 2rem;
    }

    .metric-card {
        padding: 1.5rem;
        border-radius: 16px;
        display: flex;
        align-items: center;
        gap: 1rem;
        cursor: pointer;
        transition:
            transform 0.2s,
            box-shadow 0.2s;
        color: white;
    }

    .metric-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
    }

    .metric-card.blue {
        background: linear-gradient(135deg, #4299e1 0%, #2b6cb0 100%);
    }

    .metric-card.green {
        background: linear-gradient(135deg, #48bb78 0%, #2f855a 100%);
    }

    .metric-card.purple {
        background: linear-gradient(135deg, #9f7aea 0%, #6b46c1 100%);
    }

    .metric-card.orange {
        background: linear-gradient(135deg, #ed8936 0%, #c05621 100%);
    }

    .metric-icon {
        font-size: 2.5rem;
    }

    .metric-content {
        display: flex;
        flex-direction: column;
    }

    .metric-value {
        font-size: 2rem;
        font-weight: 700;
    }

    .metric-label {
        font-size: 0.9rem;
        opacity: 0.9;
    }

    /* Content Grid */
    .content-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 1.5rem;
    }

    .section-card {
        background: #fff;
        border: 1px solid #e2e8f0;
        border-radius: 16px;
        overflow: hidden;
    }

    .section-card.full-width {
        grid-column: 1 / -1;
    }

    .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1.25rem 1.5rem;
        border-bottom: 1px solid #e2e8f0;
        background: #f7fafc;
    }

    .section-header h2 {
        font-size: 1.1rem;
        margin: 0;
        color: #2d3748;
    }

    .btn-link {
        background: none;
        border: none;
        color: #3182ce;
        font-size: 0.9rem;
        cursor: pointer;
        padding: 0;
    }

    .btn-link:hover {
        text-decoration: underline;
    }

    .section-content {
        padding: 1.5rem;
    }

    .empty-section {
        text-align: center;
        padding: 2rem;
        color: #718096;
    }

    .empty-section span {
        font-size: 2rem;
        display: block;
        margin-bottom: 0.5rem;
    }

    .empty-section p {
        margin: 0;
    }

    /* Turmas List */
    .turmas-list {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }

    .turma-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem;
        background: #f7fafc;
        border-radius: 8px;
        cursor: pointer;
        transition: background-color 0.2s;
    }

    .turma-item:hover {
        background: #edf2f7;
    }

    .turma-info {
        display: flex;
        flex-direction: column;
    }

    .turma-nome {
        font-weight: 600;
        color: #2d3748;
    }

    .turma-alunos {
        font-size: 0.85rem;
        color: #718096;
    }

    .turma-arrow {
        color: #718096;
    }

    /* Quick Actions */
    .quick-actions {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 1rem;
    }

    .action-btn {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 1.25rem;
        background: #f7fafc;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        cursor: pointer;
        transition: all 0.2s;
    }

    .action-btn:hover {
        background: #edf2f7;
        border-color: #cbd5e0;
        transform: translateY(-2px);
    }

    .action-icon {
        font-size: 1.5rem;
        margin-bottom: 0.5rem;
    }

    .action-text {
        font-size: 0.9rem;
        font-weight: 500;
        color: #2d3748;
    }

    /* Notifications List */
    .notifications-list {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .notification-item {
        display: flex;
        gap: 1rem;
        padding: 1rem;
        background: #f7fafc;
        border-radius: 8px;
        align-items: flex-start;
    }

    .notif-type {
        font-size: 0.85rem;
        white-space: nowrap;
    }

    .notif-content {
        flex: 1;
    }

    .notif-message {
        font-size: 0.95rem;
        color: #2d3748;
        margin: 0 0 0.5rem 0;
        line-height: 1.4;
    }

    .notif-meta {
        display: flex;
        justify-content: space-between;
        font-size: 0.8rem;
        color: #718096;
    }

    .notif-status {
        font-size: 1.1rem;
    }

    @media (max-width: 1024px) {
        .metrics-grid {
            grid-template-columns: repeat(2, 1fr);
        }
    }

    @media (max-width: 768px) {
        .page-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
        }

        .btn-refresh {
            width: 100%;
        }

        .metrics-grid {
            grid-template-columns: 1fr;
        }

        .content-grid {
            grid-template-columns: 1fr;
        }

        .quick-actions {
            grid-template-columns: 1fr;
        }

        .notif-meta {
            flex-direction: column;
            gap: 0.25rem;
        }
    }
</style>
