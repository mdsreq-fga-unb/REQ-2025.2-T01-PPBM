<script lang="ts">
    import { createEventDispatcher, onMount, onDestroy } from "svelte";
    import { Chart, registerables } from "chart.js";

    // Register Chart.js components
    Chart.register(...registerables);

    export let show: boolean = false;
    export let alunoId: number | null = null;
    export let apiUrl: string = "";

    interface AlunoInfo {
        id_aluno: number;
        nome_aluno: string;
        cpf_aluno: string;
        neurodivergente: boolean;
    }

    interface Estatisticas {
        presenca: {
            totalAulas: number;
            presentes: number;
            atrasos: number;
            faltas: number;
            faltasJustificadas?: number;
            faltasNaoJustificadas?: number;
            taxaPresenca: number;
        };
        justificativas: {
            total: number;
            aprovadas: number;
            pendentes: number;
            rejeitadas: number;
        };
        advertencias: {
            total: number;
        };
    }

    interface TimelineEvent {
        tipo: "presenca" | "justificativa" | "advertencia";
        id: number;
        data: string;
        descricao: string;
        docente: string | null;
        detalhes: Record<string, unknown>;
    }

    interface Acompanhamento {
        id_relatorios_acompanhamento: number;
        created_at: string;
        descricao_relatorio_acompanhamento: string;
        data_relatorio_acompanhamento: string;
        tipo_relatorio: string;
        docentes?: { nome_docente: string } | null;
    }

    let aluno: AlunoInfo | null = null;
    let estatisticas: Estatisticas | null = null;
    let timeline: TimelineEvent[] = [];
    let acompanhamentos: Acompanhamento[] = [];
    let loadingAcompanhamentos = false;

    // Chart instances
    let distributionChart: Chart | null = null;
    let trendChart: Chart | null = null;

    // Chart colors
    const chartColors = {
        presente: { bg: "rgba(72, 187, 120, 0.8)", border: "#48BB78" },
        atraso: { bg: "rgba(237, 137, 54, 0.8)", border: "#ED8936" },
        faltaJustificada: { bg: "rgba(128, 90, 213, 0.8)", border: "#805AD5" },
        faltaNaoJustificada: {
            bg: "rgba(229, 62, 62, 0.8)",
            border: "#E53E3E",
        },
        justAprovada: { bg: "rgba(72, 187, 120, 0.8)", border: "#48BB78" },
        justPendente: { bg: "rgba(237, 137, 54, 0.8)", border: "#ED8936" },
        justRejeitada: { bg: "rgba(229, 62, 62, 0.8)", border: "#E53E3E" },
    };

    function destroyCharts() {
        if (distributionChart) {
            distributionChart.destroy();
            distributionChart = null;
        }
        if (trendChart) {
            trendChart.destroy();
            trendChart = null;
        }
    }

    function createDistributionChart(canvasId: string) {
        const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        if (!canvas || !estatisticas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Calculate justified vs non-justified faltas from timeline
        let faltasJustificadas = 0;
        let faltasNaoJustificadas = 0;

        // Count from timeline events
        const presencaEvents = timeline.filter((e) => e.tipo === "presenca");
        presencaEvents.forEach((event) => {
            const status = String(event.detalhes.status || "").toLowerCase();
            if (status === "falta" || status === "ausente") {
                // Check if this absence has a justification
                const hasJustification =
                    event.detalhes.justificativa_id ||
                    timeline.some(
                        (j) =>
                            j.tipo === "justificativa" &&
                            new Date(j.data).toDateString() ===
                                new Date(event.data).toDateString(),
                    );
                if (hasJustification) {
                    faltasJustificadas++;
                } else {
                    faltasNaoJustificadas++;
                }
            }
        });

        // If we couldn't calculate from timeline, use the stats
        if (
            faltasJustificadas === 0 &&
            faltasNaoJustificadas === 0 &&
            estatisticas.presenca.faltas > 0
        ) {
            faltasJustificadas = estatisticas.justificativas.aprovadas;
            faltasNaoJustificadas = Math.max(
                0,
                estatisticas.presenca.faltas - faltasJustificadas,
            );
        }

        distributionChart = new Chart(ctx, {
            type: "doughnut",
            data: {
                labels: [
                    "Presenças",
                    "Atrasos",
                    "Faltas Justificadas",
                    "Faltas Não Justificadas",
                ],
                datasets: [
                    {
                        data: [
                            estatisticas.presenca.presentes,
                            estatisticas.presenca.atrasos,
                            faltasJustificadas,
                            faltasNaoJustificadas,
                        ],
                        backgroundColor: [
                            chartColors.presente.bg,
                            chartColors.atraso.bg,
                            chartColors.faltaJustificada.bg,
                            chartColors.faltaNaoJustificada.bg,
                        ],
                        borderColor: [
                            chartColors.presente.border,
                            chartColors.atraso.border,
                            chartColors.faltaJustificada.border,
                            chartColors.faltaNaoJustificada.border,
                        ],
                        borderWidth: 2,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: "bottom",
                        labels: {
                            padding: 12,
                            usePointStyle: true,
                            font: { size: 11, family: "Inter" },
                        },
                    },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                const total = context.dataset.data.reduce(
                                    (a: number, b: number) => a + b,
                                    0,
                                );
                                const percentage =
                                    total > 0
                                        ? Math.round(
                                              ((context.raw as number) /
                                                  total) *
                                                  100,
                                          )
                                        : 0;
                                return `${context.label}: ${context.raw} (${percentage}%)`;
                            },
                        },
                    },
                },
            },
        });
    }

    function createTrendChart(canvasId: string) {
        const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        if (!canvas || timeline.length === 0) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Group timeline events by date
        const presencaEvents = timeline
            .filter((e) => e.tipo === "presenca")
            .sort(
                (a, b) =>
                    new Date(a.data).getTime() - new Date(b.data).getTime(),
            );

        if (presencaEvents.length === 0) return;

        // Aggregate by date
        const dataByDate: Record<
            string,
            {
                presente: number;
                atraso: number;
                faltaJust: number;
                faltaNaoJust: number;
            }
        > = {};

        presencaEvents.forEach((event) => {
            const dateKey = new Date(event.data).toISOString().split("T")[0];
            if (!dataByDate[dateKey]) {
                dataByDate[dateKey] = {
                    presente: 0,
                    atraso: 0,
                    faltaJust: 0,
                    faltaNaoJust: 0,
                };
            }

            const status = String(event.detalhes.status || "").toLowerCase();
            if (status === "presente") {
                dataByDate[dateKey].presente++;
            } else if (status === "atraso") {
                dataByDate[dateKey].atraso++;
            } else if (status === "falta" || status === "ausente") {
                const hasJustification =
                    event.detalhes.justificativa_id ||
                    timeline.some(
                        (j) =>
                            j.tipo === "justificativa" &&
                            new Date(j.data).toDateString() ===
                                new Date(event.data).toDateString(),
                    );
                if (hasJustification) {
                    dataByDate[dateKey].faltaJust++;
                } else {
                    dataByDate[dateKey].faltaNaoJust++;
                }
            }
        });

        const sortedDates = Object.keys(dataByDate).sort();
        const labels = sortedDates.map((d) => {
            const date = new Date(d);
            return date.toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "2-digit",
            });
        });

        trendChart = new Chart(ctx, {
            type: "line",
            data: {
                labels,
                datasets: [
                    {
                        label: "Presenças",
                        data: sortedDates.map((d) => dataByDate[d].presente),
                        borderColor: chartColors.presente.border,
                        backgroundColor: "rgba(72, 187, 120, 0.1)",
                        fill: true,
                        tension: 0.3,
                        pointRadius: 4,
                        pointHoverRadius: 6,
                    },
                    {
                        label: "Atrasos",
                        data: sortedDates.map((d) => dataByDate[d].atraso),
                        borderColor: chartColors.atraso.border,
                        backgroundColor: "rgba(237, 137, 54, 0.1)",
                        fill: true,
                        tension: 0.3,
                        pointRadius: 4,
                        pointHoverRadius: 6,
                    },
                    {
                        label: "Faltas Justificadas",
                        data: sortedDates.map((d) => dataByDate[d].faltaJust),
                        borderColor: chartColors.faltaJustificada.border,
                        backgroundColor: "rgba(128, 90, 213, 0.1)",
                        fill: true,
                        tension: 0.3,
                        pointRadius: 4,
                        pointHoverRadius: 6,
                    },
                    {
                        label: "Faltas Não Justificadas",
                        data: sortedDates.map(
                            (d) => dataByDate[d].faltaNaoJust,
                        ),
                        borderColor: chartColors.faltaNaoJustificada.border,
                        backgroundColor: "rgba(229, 62, 62, 0.1)",
                        fill: true,
                        tension: 0.3,
                        pointRadius: 4,
                        pointHoverRadius: 6,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    intersect: false,
                    mode: "index",
                },
                plugins: {
                    legend: {
                        position: "top",
                        labels: {
                            padding: 12,
                            usePointStyle: true,
                            font: { size: 11, family: "Inter" },
                        },
                    },
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: {
                            font: { size: 10, family: "Inter" },
                            maxRotation: 45,
                            minRotation: 0,
                        },
                    },
                    y: {
                        beginAtZero: true,
                        grid: { color: "rgba(0, 0, 0, 0.05)" },
                        ticks: {
                            font: { size: 11, family: "Inter" },
                            stepSize: 1,
                        },
                    },
                },
            },
        });
    }

    function initCharts() {
        destroyCharts();
        setTimeout(() => {
            createDistributionChart("distribution-chart-modal");
            createTrendChart("trend-chart-modal");
        }, 100);
    }

    onDestroy(() => {
        destroyCharts();
    });

    // New acompanhamento form
    let showNewAcompForm = false;
    let newAcompDescricao = "";
    let newAcompTipo = "acompanhamento";
    let savingAcomp = false;

    let isLoading = false;
    let errorMessage = "";

    // Date filters
    let dateFrom = "";
    let dateTo = "";

    // Tab state
    let activeTab:
        | "estatisticas"
        | "timeline"
        | "acompanhamento"
        | "documentos" = "estatisticas";

    // Documents state
    interface Documento {
        id: number;
        tipo: string;
        descricao: string;
        url: string;
        data: string;
        docente?: string;
    }
    let documentos: Documento[] = [];
    let loadingDocumentos = false;

    const dispatch = createEventDispatcher<{
        close: void;
    }>();

    async function getAuthToken(): Promise<string | null> {
        return localStorage.getItem("bm_token");
    }

    function formatCPF(cpf: string): string {
        if (!cpf) return "-";
        const cleaned = cpf.replace(/\D/g, "");
        if (cleaned.length !== 11) return cpf;
        return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    }

    function formatDate(dateString: string): string {
        if (!dateString) return "-";
        const date = new Date(dateString);
        return date.toLocaleDateString("pt-BR");
    }

    function formatDateTime(dateString: string): string {
        if (!dateString) return "-";
        const date = new Date(dateString);
        return date.toLocaleString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    }

    async function loadData() {
        if (!alunoId) return;

        isLoading = true;
        errorMessage = "";

        try {
            const token = await getAuthToken();
            const headers = {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            };

            // Build query params
            const params = new URLSearchParams();
            if (dateFrom) params.append("from", dateFrom);
            if (dateTo) params.append("to", dateTo);
            const queryString = params.toString()
                ? `?${params.toString()}`
                : "";

            // Load statistics and timeline in parallel
            const [statsResponse, timelineResponse] = await Promise.all([
                fetch(
                    `${apiUrl}/alunos/estatisticas/${alunoId}${queryString}`,
                    { headers },
                ),
                fetch(`${apiUrl}/alunos/historico/${alunoId}${queryString}`, {
                    headers,
                }),
            ]);

            const statsData = await statsResponse.json();
            const timelineData = await timelineResponse.json();

            // Debug logging
            console.log("[AlunoDetailModal] API URL:", apiUrl);
            console.log(
                "[AlunoDetailModal] Stats response status:",
                statsResponse.status,
            );
            console.log("[AlunoDetailModal] Stats data:", statsData);
            console.log(
                "[AlunoDetailModal] Timeline response status:",
                timelineResponse.status,
            );
            console.log("[AlunoDetailModal] Timeline data:", timelineData);

            if (!statsResponse.ok || !statsData.success) {
                throw new Error(
                    statsData.error || "Erro ao carregar estatísticas",
                );
            }

            if (!timelineResponse.ok || !timelineData.success) {
                throw new Error(
                    timelineData.error || "Erro ao carregar histórico",
                );
            }

            aluno = statsData.aluno;
            estatisticas = statsData.estatisticas;
            timeline = timelineData.timeline || [];

            console.log("[AlunoDetailModal] Assigned aluno:", aluno);
            console.log(
                "[AlunoDetailModal] Assigned estatisticas:",
                estatisticas,
            );
            console.log(
                "[AlunoDetailModal] Assigned timeline length:",
                timeline.length,
            );

            // Load accompaniment plans if student is neurodivergent
            if (statsData.aluno?.neurodivergente) {
                await loadAcompanhamentos();
            }

            // Initialize charts after data is loaded
            if (activeTab === "estatisticas") {
                initCharts();
            }
        } catch (error) {
            console.error("Erro ao carregar dados do aluno:", error);
            errorMessage =
                error instanceof Error
                    ? error.message
                    : "Erro ao carregar dados";
        } finally {
            isLoading = false;
        }
    }

    async function loadAcompanhamentos() {
        if (!alunoId) return;

        loadingAcompanhamentos = true;
        try {
            const token = await getAuthToken();
            const response = await fetch(
                `${apiUrl}/acompanhamentos/por-aluno/${alunoId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                },
            );

            const data = await response.json();

            if (response.ok && data.success) {
                acompanhamentos = data.data || [];
            }
        } catch (error) {
            console.error("Erro ao carregar acompanhamentos:", error);
        } finally {
            loadingAcompanhamentos = false;
        }
    }

    async function loadDocumentos() {
        if (!alunoId) return;

        loadingDocumentos = true;
        try {
            const token = await getAuthToken();
            const response = await fetch(
                `${apiUrl}/documentos/aluno/${alunoId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                },
            );

            const data = await response.json();

            if (response.ok && data.success) {
                documentos = data.data || [];
            }
        } catch (error) {
            console.error("Erro ao carregar documentos:", error);
        } finally {
            loadingDocumentos = false;
        }
    }

    function getTipoDocumentoLabel(tipo: string): string {
        const tipos: Record<string, string> = {
            laudo_medico: "Laudo Médico",
            identificacao: "Documento de Identificação",
            comprovante: "Comprovante",
            atestado: "Atestado",
            outro: "Outro",
            documento: "Documento",
        };
        return tipos[tipo] || tipo;
    }

    function handleViewDocument(url: string) {
        window.open(url, "_blank");
    }

    async function saveNewAcompanhamento() {
        if (!alunoId || !newAcompDescricao.trim()) return;

        savingAcomp = true;
        try {
            const token = await getAuthToken();
            const response = await fetch(`${apiUrl}/acompanhamentos/criar`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    id_aluno: alunoId,
                    descricao_relatorio_acompanhamento: newAcompDescricao,
                    tipo_relatorio: newAcompTipo,
                }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                newAcompDescricao = "";
                newAcompTipo = "acompanhamento";
                showNewAcompForm = false;
                await loadAcompanhamentos();
            } else {
                console.error("Erro ao salvar:", data.error);
            }
        } catch (error) {
            console.error("Erro ao salvar acompanhamento:", error);
        } finally {
            savingAcomp = false;
        }
    }

    function handleClose() {
        dispatch("close");
        show = false;
    }

    function handleKeydown(e: KeyboardEvent) {
        if (e.key === "Escape") {
            handleClose();
        }
    }

    function handleOverlayClick(e: MouseEvent) {
        if (e.target === e.currentTarget) {
            handleClose();
        }
    }

    function handleFilterApply() {
        loadData();
    }

    function handleFilterClear() {
        dateFrom = "";
        dateTo = "";
        loadData();
    }

    function getStatusIcon(status: string): string {
        switch (status) {
            case "presente":
                return "✅";
            case "atraso":
                return "⏰";
            case "falta":
            case "ausente":
                return "❌";
            default:
                return "📝";
        }
    }

    function getEventIcon(tipo: string): string {
        switch (tipo) {
            case "presenca":
                return "📅";
            case "justificativa":
                return "📄";
            case "advertencia":
                return "⚠️";
            default:
                return "📌";
        }
    }

    function getEventColor(tipo: string): string {
        switch (tipo) {
            case "presenca":
                return "#3182ce";
            case "justificativa":
                return "#805ad5";
            case "advertencia":
                return "#e53e3e";
            default:
                return "#718096";
        }
    }

    function exportReport() {
        if (!aluno || !estatisticas) return;

        const dateStr = new Date().toISOString().split("T")[0];
        let csvContent = "";

        // Header
        csvContent += "RELATÓRIO INDIVIDUAL DE FREQUÊNCIA\n";
        csvContent += `Aluno,${aluno.nome_aluno}\n`;
        csvContent += `CPF,${formatCPF(aluno.cpf_aluno)}\n`;
        csvContent += `Neurodivergente,${aluno.neurodivergente ? "Sim" : "Não"}\n`;
        csvContent += `Data do Relatório,${formatDate(new Date().toISOString())}\n`;
        if (dateFrom || dateTo) {
            csvContent += `Período,${dateFrom || "Início"} a ${dateTo || "Atual"}\n`;
        }
        csvContent += "\n";

        // Estatísticas de presença
        csvContent += "ESTATÍSTICAS DE PRESENÇA\n";
        csvContent += `Taxa de Presença,${estatisticas.presenca.taxaPresenca}%\n`;
        csvContent += `Total de Aulas,${estatisticas.presenca.totalAulas}\n`;
        csvContent += `Presenças,${estatisticas.presenca.presentes}\n`;
        csvContent += `Atrasos,${estatisticas.presenca.atrasos}\n`;
        csvContent += `Faltas,${estatisticas.presenca.faltas}\n`;
        csvContent += "\n";

        // Justificativas
        csvContent += "JUSTIFICATIVAS\n";
        csvContent += `Total,${estatisticas.justificativas.total}\n`;
        csvContent += `Aprovadas,${estatisticas.justificativas.aprovadas}\n`;
        csvContent += `Pendentes,${estatisticas.justificativas.pendentes}\n`;
        csvContent += `Rejeitadas,${estatisticas.justificativas.rejeitadas}\n`;
        csvContent += "\n";

        // Advertências
        csvContent += "ADVERTÊNCIAS\n";
        csvContent += `Total,${estatisticas.advertencias.total}\n`;
        csvContent += "\n";

        // Timeline
        if (timeline.length > 0) {
            csvContent += "HISTÓRICO DE EVENTOS\n";
            csvContent += "Data,Tipo,Descrição,Docente\n";
            timeline.forEach((event) => {
                const tipo =
                    event.tipo === "presenca"
                        ? "Presença"
                        : event.tipo === "justificativa"
                          ? "Justificativa"
                          : "Advertência";
                csvContent += `${formatDateTime(event.data)},"${tipo}","${event.descricao?.replace(/"/g, '""') || ""}","${event.docente || ""}"\n`;
            });
        }

        // Create and download file
        const blob = new Blob(["\ufeff" + csvContent], {
            type: "text/csv;charset=utf-8;",
        });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute(
            "download",
            `relatorio_${aluno.nome_aluno.replace(/\s+/g, "_")}_${dateStr}.csv`,
        );
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    $: if (show && alunoId) {
        loadData();
    }

    $: if (!show) {
        destroyCharts();
        aluno = null;
        estatisticas = null;
        timeline = [];
        acompanhamentos = [];
        documentos = [];
        errorMessage = "";
        dateFrom = "";
        dateTo = "";
        activeTab = "estatisticas";
        showNewAcompForm = false;
        newAcompDescricao = "";
        newAcompTipo = "acompanhamento";
    }

    // Re-initialize charts when switching to statistics tab
    $: if (activeTab === "estatisticas" && estatisticas && show) {
        setTimeout(() => initCharts(), 100);
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
                <h3 class="modal-title" id="dialog-title">Detalhes do Aluno</h3>
                <button
                    type="button"
                    class="close-btn"
                    on:click={handleClose}
                    aria-label="Fechar"
                >
                    &times;
                </button>
            </div>

            {#if isLoading}
                <div class="loading-state">
                    <span class="spinner-large"></span>
                    <span>Carregando dados...</span>
                </div>
            {:else if errorMessage}
                <div class="error-message">{errorMessage}</div>
            {:else if aluno}
                <!-- Student Info Header -->
                <div class="aluno-header">
                    <div class="aluno-avatar">
                        {aluno.nome_aluno?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                    <div class="aluno-info">
                        <h4 class="aluno-nome">{aluno.nome_aluno}</h4>
                        <p class="aluno-cpf">
                            CPF: {formatCPF(aluno.cpf_aluno)}
                        </p>
                        {#if aluno.neurodivergente}
                            <span class="badge badge-purple">
                                📚 Acompanhamento Especial
                            </span>
                        {/if}
                    </div>
                </div>

                <!-- Date Filters -->
                <div class="filters-section">
                    <div class="filter-group">
                        <label for="date-from">De</label>
                        <input
                            type="date"
                            id="date-from"
                            bind:value={dateFrom}
                        />
                    </div>
                    <div class="filter-group">
                        <label for="date-to">Até</label>
                        <input type="date" id="date-to" bind:value={dateTo} />
                    </div>
                    <div class="filter-buttons">
                        <button
                            type="button"
                            class="btn-filter"
                            on:click={handleFilterApply}
                        >
                            Aplicar
                        </button>
                        <button
                            type="button"
                            class="btn-filter-clear"
                            on:click={handleFilterClear}
                        >
                            Limpar
                        </button>
                    </div>
                </div>

                <!-- Tabs -->
                <div class="tabs">
                    <button
                        type="button"
                        class="tab"
                        class:active={activeTab === "estatisticas"}
                        on:click={() => (activeTab = "estatisticas")}
                    >
                        📊 Estatísticas
                    </button>
                    <button
                        type="button"
                        class="tab"
                        class:active={activeTab === "timeline"}
                        on:click={() => (activeTab = "timeline")}
                    >
                        📅 Histórico ({timeline.length})
                    </button>
                    {#if aluno?.neurodivergente}
                        <button
                            type="button"
                            class="tab"
                            class:active={activeTab === "acompanhamento"}
                            on:click={() => (activeTab = "acompanhamento")}
                        >
                            📋 Plano ({acompanhamentos.length})
                        </button>
                    {/if}
                    <button
                        type="button"
                        class="tab"
                        class:active={activeTab === "documentos"}
                        on:click={() => {
                            activeTab = "documentos";
                            if (documentos.length === 0) loadDocumentos();
                        }}
                    >
                        📎 Documentos ({documentos.length})
                    </button>
                </div>

                <!-- Tab Content -->
                <div class="tab-content">
                    {#if activeTab === "estatisticas"}
                        {#if estatisticas}
                            <!-- Stats Grid -->
                            <div class="stats-grid">
                                <div class="stat-card presenca">
                                    <div class="stat-header">
                                        <span class="stat-icon">📊</span>
                                        <span class="stat-title"
                                            >Taxa de Presença</span
                                        >
                                    </div>
                                    <div class="stat-value">
                                        {estatisticas?.presenca?.taxaPresenca ??
                                            0}%
                                    </div>
                                    <div class="stat-footer">
                                        de {estatisticas?.presenca
                                            ?.totalAulas ?? 0} aulas
                                    </div>
                                </div>

                                <div class="stat-card presentes">
                                    <div class="stat-header">
                                        <span class="stat-icon">✅</span>
                                        <span class="stat-title">Presenças</span
                                        >
                                    </div>
                                    <div class="stat-value">
                                        {estatisticas?.presenca?.presentes ?? 0}
                                    </div>
                                </div>

                                <div class="stat-card atrasos">
                                    <div class="stat-header">
                                        <span class="stat-icon">⏰</span>
                                        <span class="stat-title">Atrasos</span>
                                    </div>
                                    <div class="stat-value">
                                        {estatisticas?.presenca?.atrasos ?? 0}
                                    </div>
                                </div>

                                <div class="stat-card faltas">
                                    <div class="stat-header">
                                        <span class="stat-icon">❌</span>
                                        <span class="stat-title">Faltas</span>
                                    </div>
                                    <div class="stat-value">
                                        {estatisticas?.presenca?.faltas ?? 0}
                                    </div>
                                </div>
                            </div>

                            <!-- Charts Section -->
                            <div class="charts-section-modal">
                                <div class="chart-container-modal">
                                    <h5>📊 Distribuição de Frequência</h5>
                                    <div class="chart-wrapper-modal">
                                        <canvas id="distribution-chart-modal"
                                        ></canvas>
                                    </div>
                                    <div class="chart-legend-info">
                                        <span class="legend-item">
                                            <span
                                                class="legend-color"
                                                style="background: {chartColors
                                                    .faltaJustificada.border};"
                                            ></span>
                                            Faltas Justificadas
                                        </span>
                                        <span class="legend-item">
                                            <span
                                                class="legend-color"
                                                style="background: {chartColors
                                                    .faltaNaoJustificada
                                                    .border};"
                                            ></span>
                                            Faltas Não Justificadas
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <!-- Trend Chart -->
                            {#if timeline.filter((e) => e.tipo === "presenca").length > 1}
                                <div class="chart-container-modal full-width">
                                    <h5>📈 Linha do Tempo de Frequência</h5>
                                    <div class="chart-wrapper-modal trend">
                                        <canvas id="trend-chart-modal"></canvas>
                                    </div>
                                </div>
                            {/if}

                            <!-- Justificativas & Advertências -->
                            <div class="secondary-stats">
                                <div class="secondary-stat-card">
                                    <h5>📄 Justificativas</h5>
                                    <div class="secondary-stat-items">
                                        <div class="stat-item">
                                            <span>Total</span>
                                            <span class="value"
                                                >{estatisticas?.justificativas
                                                    ?.total ?? 0}</span
                                            >
                                        </div>
                                        <div class="stat-item approved">
                                            <span>Aprovadas</span>
                                            <span class="value"
                                                >{estatisticas?.justificativas
                                                    ?.aprovadas ?? 0}</span
                                            >
                                        </div>
                                        <div class="stat-item pending">
                                            <span>Pendentes</span>
                                            <span class="value"
                                                >{estatisticas?.justificativas
                                                    ?.pendentes ?? 0}</span
                                            >
                                        </div>
                                        <div class="stat-item rejected">
                                            <span>Rejeitadas</span>
                                            <span class="value"
                                                >{estatisticas?.justificativas
                                                    ?.rejeitadas ?? 0}</span
                                            >
                                        </div>
                                    </div>
                                </div>

                                <div class="secondary-stat-card warning">
                                    <h5>⚠️ Advertências</h5>
                                    <div class="advertencias-count">
                                        {estatisticas?.advertencias?.total ?? 0}
                                    </div>
                                </div>
                            </div>
                        {:else}
                            <div class="empty-state">
                                <span class="empty-icon">📊</span>
                                <p>
                                    Nenhum dado de frequência encontrado para
                                    este aluno.
                                </p>
                                <p class="empty-hint">
                                    Os dados aparecerão aqui quando houver
                                    registros de presença.
                                </p>
                            </div>
                        {/if}
                    {:else if activeTab === "timeline"}
                        <!-- Timeline -->
                        {#if timeline.length === 0}
                            <div class="empty-state">
                                <span class="empty-icon">📭</span>
                                <p>
                                    Nenhum registro encontrado no período
                                    selecionado.
                                </p>
                            </div>
                        {:else}
                            <div class="timeline">
                                {#each timeline as event (event.id + event.tipo)}
                                    <div
                                        class="timeline-item"
                                        style="--event-color: {getEventColor(
                                            event.tipo,
                                        )}"
                                    >
                                        <div class="timeline-marker">
                                            <span class="event-icon"
                                                >{getEventIcon(
                                                    event.tipo,
                                                )}</span
                                            >
                                        </div>
                                        <div class="timeline-content">
                                            <div class="timeline-header">
                                                <span class="event-type"
                                                    >{event.tipo === "presenca"
                                                        ? "Presença"
                                                        : event.tipo ===
                                                            "justificativa"
                                                          ? "Justificativa"
                                                          : "Advertência"}</span
                                                >
                                                <span class="event-date"
                                                    >{formatDateTime(
                                                        event.data,
                                                    )}</span
                                                >
                                            </div>
                                            <p class="event-description">
                                                {event.descricao}
                                            </p>
                                            {#if event.docente}
                                                <p class="event-docente">
                                                    Docente: {event.docente}
                                                </p>
                                            {/if}
                                            {#if event.tipo === "presenca" && event.detalhes.turma}
                                                <p class="event-turma">
                                                    Turma: {event.detalhes
                                                        .turma}
                                                </p>
                                            {/if}
                                            {#if event.tipo === "presenca" && event.detalhes.status}
                                                <span
                                                    class="event-status"
                                                    class:presente={event
                                                        .detalhes.status ===
                                                        "presente"}
                                                    class:atraso={event.detalhes
                                                        .status === "atraso"}
                                                    class:falta={event.detalhes
                                                        .status === "falta" ||
                                                        event.detalhes
                                                            .status ===
                                                            "ausente"}
                                                >
                                                    {getStatusIcon(
                                                        String(
                                                            event.detalhes
                                                                .status,
                                                        ),
                                                    )}
                                                    {event.detalhes.status}
                                                </span>
                                            {/if}
                                            {#if event.tipo === "justificativa"}
                                                <span
                                                    class="justificativa-status"
                                                    class:aprovada={event
                                                        .detalhes.aprovada ===
                                                        true}
                                                    class:pendente={event
                                                        .detalhes.aprovada ===
                                                        null}
                                                    class:rejeitada={event
                                                        .detalhes.aprovada ===
                                                        false}
                                                >
                                                    {event.detalhes.aprovada ===
                                                    true
                                                        ? "✅ Aprovada"
                                                        : event.detalhes
                                                                .aprovada ===
                                                            false
                                                          ? "❌ Rejeitada"
                                                          : "⏳ Pendente"}
                                                </span>
                                            {/if}
                                        </div>
                                    </div>
                                {/each}
                            </div>
                        {/if}
                    {:else if activeTab === "acompanhamento"}
                        <!-- Plano de Acompanhamento -->
                        <div class="acompanhamento-section">
                            <div class="acomp-header">
                                <h4>Plano de Acompanhamento Pedagógico</h4>
                                <button
                                    type="button"
                                    class="btn-add-acomp"
                                    on:click={() =>
                                        (showNewAcompForm = !showNewAcompForm)}
                                >
                                    {showNewAcompForm
                                        ? "✕ Cancelar"
                                        : "+ Novo Registro"}
                                </button>
                            </div>

                            {#if showNewAcompForm}
                                <div class="new-acomp-form">
                                    <div class="form-row">
                                        <label for="acomp-tipo">Tipo</label>
                                        <select
                                            id="acomp-tipo"
                                            bind:value={newAcompTipo}
                                        >
                                            <option value="acompanhamento"
                                                >Acompanhamento</option
                                            >
                                            <option value="avaliacao"
                                                >Avaliação</option
                                            >
                                            <option value="observacao"
                                                >Observação</option
                                            >
                                            <option value="plano"
                                                >Plano Individual</option
                                            >
                                            <option value="progresso"
                                                >Registro de Progresso</option
                                            >
                                        </select>
                                    </div>
                                    <div class="form-row">
                                        <label for="acomp-desc">Descrição</label
                                        >
                                        <textarea
                                            id="acomp-desc"
                                            bind:value={newAcompDescricao}
                                            placeholder="Descreva o plano, observação ou progresso..."
                                            rows="4"
                                        ></textarea>
                                    </div>
                                    <div class="form-actions">
                                        <button
                                            type="button"
                                            class="btn-save-acomp"
                                            on:click={saveNewAcompanhamento}
                                            disabled={savingAcomp ||
                                                !newAcompDescricao.trim()}
                                        >
                                            {savingAcomp
                                                ? "Salvando..."
                                                : "Salvar Registro"}
                                        </button>
                                    </div>
                                </div>
                            {/if}

                            {#if loadingAcompanhamentos}
                                <div class="loading-inline">
                                    <span class="spinner-small"></span>
                                    Carregando registros...
                                </div>
                            {:else if acompanhamentos.length === 0}
                                <div class="empty-state">
                                    <span class="empty-icon">📋</span>
                                    <p>
                                        Nenhum registro de acompanhamento
                                        encontrado.
                                    </p>
                                    <p class="empty-hint">
                                        Clique em "Novo Registro" para adicionar
                                        observações e planos pedagógicos.
                                    </p>
                                </div>
                            {:else}
                                <div class="acomp-list">
                                    {#each acompanhamentos as acomp (acomp.id_relatorios_acompanhamento)}
                                        <div class="acomp-card">
                                            <div class="acomp-card-header">
                                                <span class="acomp-tipo">
                                                    {acomp.tipo_relatorio ===
                                                    "acompanhamento"
                                                        ? "📝 Acompanhamento"
                                                        : acomp.tipo_relatorio ===
                                                            "avaliacao"
                                                          ? "📊 Avaliação"
                                                          : acomp.tipo_relatorio ===
                                                              "observacao"
                                                            ? "👁️ Observação"
                                                            : acomp.tipo_relatorio ===
                                                                "plano"
                                                              ? "📋 Plano Individual"
                                                              : acomp.tipo_relatorio ===
                                                                  "progresso"
                                                                ? "📈 Progresso"
                                                                : "📄 " +
                                                                  acomp.tipo_relatorio}
                                                </span>
                                                <span class="acomp-date">
                                                    {formatDate(
                                                        acomp.data_relatorio_acompanhamento ||
                                                            acomp.created_at,
                                                    )}
                                                </span>
                                            </div>
                                            <p class="acomp-desc">
                                                {acomp.descricao_relatorio_acompanhamento}
                                            </p>
                                            {#if acomp.docentes?.nome_docente}
                                                <p class="acomp-docente">
                                                    Registrado por: {acomp
                                                        .docentes.nome_docente}
                                                </p>
                                            {/if}
                                        </div>
                                    {/each}
                                </div>
                            {/if}
                        </div>
                    {:else if activeTab === "documentos"}
                        <!-- Documentos -->
                        <div class="documentos-section">
                            <div class="docs-header">
                                <h4>📎 Documentos do Aluno</h4>
                                <p class="docs-hint">
                                    Laudos médicos, documentos de identificação
                                    e comprovantes.
                                </p>
                            </div>

                            {#if loadingDocumentos}
                                <div class="loading-inline">
                                    <span class="spinner-small"></span>
                                    Carregando documentos...
                                </div>
                            {:else if documentos.length === 0}
                                <div class="empty-state">
                                    <span class="empty-icon">📂</span>
                                    <p>
                                        Nenhum documento cadastrado para este
                                        aluno.
                                    </p>
                                    <p class="empty-hint">
                                        Para adicionar documentos, acesse a
                                        página de edição do aluno.
                                    </p>
                                    <a
                                        href={`/admin/cadastrar-alunos?id=${alunoId}`}
                                        class="btn-edit-link"
                                    >
                                        Editar Aluno
                                    </a>
                                </div>
                            {:else}
                                <div class="docs-list">
                                    {#each documentos as doc (doc.id)}
                                        <div class="doc-card">
                                            <div class="doc-icon">
                                                {doc.tipo === "laudo_medico"
                                                    ? "🏥"
                                                    : doc.tipo ===
                                                        "identificacao"
                                                      ? "🪪"
                                                      : doc.tipo === "atestado"
                                                        ? "📋"
                                                        : "📄"}
                                            </div>
                                            <div class="doc-info">
                                                <span class="doc-tipo">
                                                    {getTipoDocumentoLabel(
                                                        doc.tipo,
                                                    )}
                                                </span>
                                                <p class="doc-descricao">
                                                    {doc.descricao ||
                                                        "Documento"}
                                                </p>
                                                <span class="doc-date">
                                                    Adicionado em {formatDate(
                                                        doc.data,
                                                    )}
                                                </span>
                                            </div>
                                            <button
                                                type="button"
                                                class="btn-view-doc"
                                                on:click={() =>
                                                    handleViewDocument(doc.url)}
                                                title="Visualizar / Download"
                                            >
                                                📥 Ver
                                            </button>
                                        </div>
                                    {/each}
                                </div>

                                <div class="docs-footer">
                                    <a
                                        href={`/admin/cadastrar-alunos?id=${alunoId}`}
                                        class="btn-manage-docs"
                                    >
                                        Gerenciar Documentos
                                    </a>
                                </div>
                            {/if}
                        </div>
                    {/if}
                </div>
            {/if}

            <div class="modal-footer">
                <button
                    type="button"
                    class="btn-export"
                    on:click={exportReport}
                    disabled={!estatisticas}
                >
                    📥 Exportar CSV
                </button>
                <button type="button" class="btn-close" on:click={handleClose}>
                    Fechar
                </button>
            </div>
        </div>
    </div>
{/if}

<style>
    .modal-overlay {
        position: fixed;
        inset: 0;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        padding: 1rem;
    }

    .modal {
        background-color: white;
        border-radius: 12px;
        width: 100%;
        max-width: 700px;
        max-height: 90vh;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    }

    .modal-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1.25rem 1.5rem;
        border-bottom: 1px solid #e2e8f0;
        background: linear-gradient(135deg, #3182ce, #2c5282);
        color: white;
    }

    .modal-title {
        font-size: 1.25rem;
        font-weight: 600;
        margin: 0;
    }

    .close-btn {
        background: rgba(255, 255, 255, 0.2);
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        color: white;
        width: 32px;
        height: 32px;
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.2s;
    }

    .close-btn:hover {
        background: rgba(255, 255, 255, 0.3);
    }

    .loading-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 3rem;
        gap: 1rem;
        color: #718096;
    }

    .spinner-large {
        width: 40px;
        height: 40px;
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

    .error-message {
        padding: 1.5rem;
        background-color: #fed7d7;
        color: #c53030;
        text-align: center;
        margin: 1rem;
        border-radius: 8px;
    }

    .aluno-header {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1.5rem;
        background: #f7fafc;
        border-bottom: 1px solid #e2e8f0;
    }

    .aluno-avatar {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: linear-gradient(135deg, #3182ce, #2c5282);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.5rem;
        font-weight: 700;
        flex-shrink: 0;
    }

    .aluno-info {
        flex: 1;
    }

    .aluno-nome {
        font-size: 1.25rem;
        font-weight: 600;
        color: #2d3748;
        margin: 0 0 0.25rem 0;
    }

    .aluno-cpf {
        font-size: 0.9rem;
        color: #718096;
        margin: 0 0 0.5rem 0;
    }

    .badge {
        display: inline-flex;
        align-items: center;
        padding: 0.25rem 0.75rem;
        border-radius: 9999px;
        font-size: 0.75rem;
        font-weight: 500;
    }

    .badge-purple {
        background: #e9d8fd;
        color: #553c9a;
    }

    .filters-section {
        display: flex;
        gap: 1rem;
        padding: 1rem 1.5rem;
        border-bottom: 1px solid #e2e8f0;
        flex-wrap: wrap;
        align-items: flex-end;
    }

    .filter-group {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
    }

    .filter-group label {
        font-size: 0.75rem;
        color: #718096;
        font-weight: 500;
    }

    .filter-group input {
        padding: 0.5rem;
        border: 1px solid #e2e8f0;
        border-radius: 6px;
        font-size: 0.875rem;
    }

    .filter-buttons {
        display: flex;
        gap: 0.5rem;
    }

    .btn-filter {
        padding: 0.5rem 1rem;
        background: #3182ce;
        color: white;
        border: none;
        border-radius: 6px;
        font-size: 0.875rem;
        cursor: pointer;
        transition: background 0.2s;
    }

    .btn-filter:hover {
        background: #2c5282;
    }

    .btn-filter-clear {
        padding: 0.5rem 1rem;
        background: #e2e8f0;
        color: #4a5568;
        border: none;
        border-radius: 6px;
        font-size: 0.875rem;
        cursor: pointer;
        transition: background 0.2s;
    }

    .btn-filter-clear:hover {
        background: #cbd5e0;
    }

    .tabs {
        display: flex;
        border-bottom: 1px solid #e2e8f0;
        padding: 0 1.5rem;
    }

    .tab {
        padding: 0.75rem 1.5rem;
        background: transparent;
        border: none;
        border-bottom: 2px solid transparent;
        font-size: 0.9rem;
        font-weight: 500;
        color: #718096;
        cursor: pointer;
        transition: all 0.2s;
    }

    .tab:hover {
        color: #3182ce;
    }

    .tab.active {
        color: #3182ce;
        border-bottom-color: #3182ce;
    }

    .tab-content {
        flex: 1;
        overflow-y: auto;
        padding: 1.5rem;
    }

    .stats-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 1rem;
        margin-bottom: 1.5rem;
    }

    .stat-card {
        padding: 1rem;
        border-radius: 8px;
        background: #f7fafc;
        border: 1px solid #e2e8f0;
    }

    .stat-card.presenca {
        grid-column: span 2;
        background: linear-gradient(135deg, #3182ce, #2c5282);
        color: white;
        border: none;
    }

    .stat-card.presentes {
        background: linear-gradient(135deg, #48bb78, #276749);
        color: white;
        border: none;
    }

    .stat-card.atrasos {
        background: linear-gradient(135deg, #ed8936, #c05621);
        color: white;
        border: none;
    }

    .stat-card.faltas {
        background: linear-gradient(135deg, #e53e3e, #9b2c2c);
        color: white;
        border: none;
    }

    .stat-header {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 0.5rem;
    }

    .stat-icon {
        font-size: 1.25rem;
    }

    .stat-title {
        font-size: 0.85rem;
        font-weight: 500;
        opacity: 0.9;
    }

    .stat-value {
        font-size: 2rem;
        font-weight: 700;
    }

    .stat-footer {
        font-size: 0.8rem;
        opacity: 0.8;
        margin-top: 0.25rem;
    }

    .secondary-stats {
        display: grid;
        grid-template-columns: 2fr 1fr;
        gap: 1rem;
    }

    .secondary-stat-card {
        padding: 1rem;
        border-radius: 8px;
        background: #f7fafc;
        border: 1px solid #e2e8f0;
    }

    .secondary-stat-card h5 {
        margin: 0 0 0.75rem 0;
        font-size: 0.9rem;
        color: #4a5568;
    }

    .secondary-stat-card.warning {
        background: linear-gradient(135deg, #faf089, #ecc94b);
        border: none;
    }

    .secondary-stat-items {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 0.5rem;
    }

    .stat-item {
        display: flex;
        justify-content: space-between;
        padding: 0.5rem;
        background: white;
        border-radius: 4px;
        font-size: 0.85rem;
    }

    .stat-item .value {
        font-weight: 600;
    }

    .stat-item.approved .value {
        color: #276749;
    }

    .stat-item.pending .value {
        color: #c05621;
    }

    .stat-item.rejected .value {
        color: #9b2c2c;
    }

    .advertencias-count {
        font-size: 2.5rem;
        font-weight: 700;
        text-align: center;
        color: #744210;
    }

    /* Charts Section Styles */
    .charts-section-modal {
        display: grid;
        grid-template-columns: 1fr;
        gap: 1rem;
        margin-bottom: 1.5rem;
    }

    .chart-container-modal {
        background: #f7fafc;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        padding: 1rem;
    }

    .chart-container-modal h5 {
        margin: 0 0 0.75rem 0;
        font-size: 0.9rem;
        color: #4a5568;
        font-weight: 600;
    }

    .chart-container-modal.full-width {
        margin-bottom: 1.5rem;
    }

    .chart-wrapper-modal {
        position: relative;
        height: 200px;
        width: 100%;
    }

    .chart-wrapper-modal.trend {
        height: 220px;
    }

    .chart-wrapper-modal canvas {
        max-height: 100%;
    }

    .chart-legend-info {
        display: flex;
        justify-content: center;
        gap: 1.5rem;
        margin-top: 0.75rem;
        padding-top: 0.75rem;
        border-top: 1px solid #e2e8f0;
    }

    .legend-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.75rem;
        color: #4a5568;
    }

    .legend-color {
        width: 12px;
        height: 12px;
        border-radius: 3px;
    }

    .empty-state {
        text-align: center;
        padding: 3rem 1rem;
        color: #718096;
    }

    .empty-icon {
        font-size: 3rem;
        display: block;
        margin-bottom: 1rem;
    }

    .timeline {
        position: relative;
        padding-left: 2rem;
    }

    .timeline::before {
        content: "";
        position: absolute;
        left: 0.75rem;
        top: 0;
        bottom: 0;
        width: 2px;
        background: #e2e8f0;
    }

    .timeline-item {
        position: relative;
        margin-bottom: 1.5rem;
        padding-left: 1rem;
    }

    .timeline-marker {
        position: absolute;
        left: -2rem;
        top: 0;
        width: 1.5rem;
        height: 1.5rem;
        background: var(--event-color, #3182ce);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1;
    }

    .event-icon {
        font-size: 0.75rem;
    }

    .timeline-content {
        background: #f7fafc;
        border-radius: 8px;
        padding: 1rem;
        border: 1px solid #e2e8f0;
        border-left: 3px solid var(--event-color, #3182ce);
    }

    .timeline-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.5rem;
    }

    .event-type {
        font-weight: 600;
        color: #2d3748;
        font-size: 0.9rem;
    }

    .event-date {
        font-size: 0.75rem;
        color: #718096;
    }

    .event-description {
        font-size: 0.875rem;
        color: #4a5568;
        margin: 0 0 0.5rem 0;
    }

    .event-docente,
    .event-turma {
        font-size: 0.75rem;
        color: #718096;
        margin: 0;
    }

    .event-status,
    .justificativa-status {
        display: inline-block;
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        font-size: 0.75rem;
        font-weight: 500;
        margin-top: 0.5rem;
    }

    .event-status.presente {
        background: #c6f6d5;
        color: #22543d;
    }

    .event-status.atraso {
        background: #feebc8;
        color: #744210;
    }

    .event-status.falta {
        background: #fed7d7;
        color: #742a2a;
    }

    .justificativa-status.aprovada {
        background: #c6f6d5;
        color: #22543d;
    }

    .justificativa-status.pendente {
        background: #feebc8;
        color: #744210;
    }

    .justificativa-status.rejeitada {
        background: #fed7d7;
        color: #742a2a;
    }

    .modal-footer {
        padding: 1rem 1.5rem;
        border-top: 1px solid #e2e8f0;
        display: flex;
        justify-content: flex-end;
        gap: 0.75rem;
    }

    .btn-export {
        padding: 0.75rem 1.5rem;
        background: #48bb78;
        color: white;
        border: none;
        border-radius: 6px;
        font-size: 0.9rem;
        font-weight: 500;
        cursor: pointer;
        transition: background 0.2s;
    }

    .btn-export:hover:not(:disabled) {
        background: #38a169;
    }

    .btn-export:disabled {
        background: #a0aec0;
        cursor: not-allowed;
    }

    .btn-close {
        padding: 0.75rem 1.5rem;
        background: #4a5568;
        color: white;
        border: none;
        border-radius: 6px;
        font-size: 0.9rem;
        font-weight: 500;
        cursor: pointer;
        transition: background 0.2s;
    }

    .btn-close:hover {
        background: #2d3748;
    }

    /* Acompanhamento section styles */
    .acompanhamento-section {
        width: 100%;
    }

    .acomp-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
    }

    .acomp-header h4 {
        margin: 0;
        font-size: 1rem;
        color: #2d3748;
    }

    .btn-add-acomp {
        padding: 0.5rem 1rem;
        background: #805ad5;
        color: white;
        border: none;
        border-radius: 6px;
        font-size: 0.875rem;
        cursor: pointer;
        transition: background 0.2s;
    }

    .btn-add-acomp:hover {
        background: #6b46c1;
    }

    .new-acomp-form {
        background: #f7fafc;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        padding: 1rem;
        margin-bottom: 1rem;
    }

    .form-row {
        margin-bottom: 1rem;
    }

    .form-row label {
        display: block;
        font-size: 0.875rem;
        font-weight: 500;
        color: #4a5568;
        margin-bottom: 0.25rem;
    }

    .form-row select,
    .form-row textarea {
        width: 100%;
        padding: 0.5rem;
        border: 1px solid #e2e8f0;
        border-radius: 6px;
        font-size: 0.875rem;
        resize: vertical;
    }

    .form-row select:focus,
    .form-row textarea:focus {
        outline: none;
        border-color: #805ad5;
        box-shadow: 0 0 0 2px rgba(128, 90, 213, 0.2);
    }

    .form-actions {
        display: flex;
        justify-content: flex-end;
    }

    .btn-save-acomp {
        padding: 0.5rem 1.5rem;
        background: #48bb78;
        color: white;
        border: none;
        border-radius: 6px;
        font-size: 0.875rem;
        font-weight: 500;
        cursor: pointer;
        transition: background 0.2s;
    }

    .btn-save-acomp:hover:not(:disabled) {
        background: #38a169;
    }

    .btn-save-acomp:disabled {
        background: #a0aec0;
        cursor: not-allowed;
    }

    .loading-inline {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 1rem;
        color: #718096;
        font-size: 0.9rem;
    }

    .spinner-small {
        width: 16px;
        height: 16px;
        border: 2px solid #e2e8f0;
        border-top-color: #805ad5;
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }

    .empty-hint {
        font-size: 0.85rem;
        color: #a0aec0;
        margin-top: 0.5rem;
    }

    .acomp-list {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }

    .acomp-card {
        background: #f7fafc;
        border: 1px solid #e2e8f0;
        border-left: 3px solid #805ad5;
        border-radius: 8px;
        padding: 1rem;
    }

    .acomp-card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.5rem;
    }

    .acomp-tipo {
        font-weight: 600;
        color: #553c9a;
        font-size: 0.875rem;
    }

    .acomp-date {
        font-size: 0.75rem;
        color: #718096;
    }

    .acomp-desc {
        font-size: 0.875rem;
        color: #4a5568;
        margin: 0 0 0.5rem 0;
        white-space: pre-wrap;
    }

    .acomp-docente {
        font-size: 0.75rem;
        color: #718096;
        margin: 0;
    }

    /* Documentos section styles */
    .documentos-section {
        width: 100%;
    }

    .docs-header {
        margin-bottom: 1rem;
    }

    .docs-header h4 {
        margin: 0 0 0.25rem 0;
        font-size: 1rem;
        color: #2d3748;
    }

    .docs-hint {
        font-size: 0.85rem;
        color: #718096;
        margin: 0;
    }

    .docs-list {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }

    .doc-card {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1rem;
        background: #f7fafc;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        transition: border-color 0.2s;
    }

    .doc-card:hover {
        border-color: #3182ce;
    }

    .doc-icon {
        font-size: 1.5rem;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: white;
        border-radius: 8px;
        border: 1px solid #e2e8f0;
    }

    .doc-info {
        flex: 1;
    }

    .doc-tipo {
        font-size: 0.75rem;
        font-weight: 600;
        color: #3182ce;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .doc-descricao {
        font-size: 0.9rem;
        color: #2d3748;
        margin: 0.25rem 0;
    }

    .doc-date {
        font-size: 0.75rem;
        color: #718096;
    }

    .btn-view-doc {
        padding: 0.5rem 1rem;
        background: #3182ce;
        color: white;
        border: none;
        border-radius: 6px;
        font-size: 0.85rem;
        font-weight: 500;
        cursor: pointer;
        transition: background 0.2s;
        white-space: nowrap;
    }

    .btn-view-doc:hover {
        background: #2c5282;
    }

    .docs-footer {
        margin-top: 1.5rem;
        padding-top: 1rem;
        border-top: 1px solid #e2e8f0;
        text-align: center;
    }

    .btn-edit-link,
    .btn-manage-docs {
        display: inline-block;
        padding: 0.75rem 1.5rem;
        background: #805ad5;
        color: white;
        border: none;
        border-radius: 6px;
        font-size: 0.9rem;
        font-weight: 500;
        text-decoration: none;
        transition: background 0.2s;
    }

    .btn-edit-link:hover,
    .btn-manage-docs:hover {
        background: #6b46c1;
    }

    @media (max-width: 640px) {
        .modal {
            max-height: 100vh;
            border-radius: 0;
        }

        .stats-grid {
            grid-template-columns: 1fr;
        }

        .stat-card.presenca {
            grid-column: span 1;
        }

        .secondary-stats {
            grid-template-columns: 1fr;
        }

        .filters-section {
            flex-direction: column;
        }

        .filter-buttons {
            width: 100%;
        }

        .btn-filter,
        .btn-filter-clear {
            flex: 1;
        }

        .chart-wrapper-modal {
            height: 180px;
        }

        .chart-wrapper-modal.trend {
            height: 200px;
        }

        .chart-legend-info {
            flex-direction: column;
            gap: 0.5rem;
            align-items: center;
        }
    }
</style>
