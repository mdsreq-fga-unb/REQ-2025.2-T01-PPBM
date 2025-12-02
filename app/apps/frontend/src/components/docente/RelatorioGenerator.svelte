<script lang="ts">
    import { onMount } from "svelte";
    import Toast from "../ui/Toast.svelte";
    import FormSelect from "../ui/FormSelect.svelte";
    import { apiFetch } from "../../lib/api";

    interface Turma {
        id_turma: number;
        nome_turma: string;
        unidade_turma: string;
    }

    interface Aluno {
        id_aluno: number;
        nome_aluno: string;
        cpf_aluno: string;
    }

    interface Estatisticas {
        presenca: {
            totalAulas: number;
            presentes: number;
            atrasos: number;
            faltas: number;
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

    interface ReportData {
        aluno: Aluno;
        estatisticas: Estatisticas;
    }

    let turmas: Turma[] = [];
    let alunos: Aluno[] = [];
    let loading = false;
    let loadingReport = false;

    // Filter state
    let tipoRelatorio = "individual";
    let selectedTurmaId: number | null = null;
    let selectedAlunoId: number | null = null;
    let dataInicio = "";
    let dataFim = "";

    // Report data
    let reportData: ReportData[] = [];
    let reportGenerated = false;

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

    function formatCPF(cpf: string | null): string {
        if (!cpf) return "-";
        const cleaned = cpf.replace(/\D/g, "");
        if (cleaned.length !== 11) return cpf;
        return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    }

    function formatDate(dateStr: string): string {
        if (!dateStr) return "-";
        const date = new Date(dateStr);
        return date.toLocaleDateString("pt-BR");
    }

    async function loadTurmas() {
        try {
            const response = await apiFetch<{ data: Turma[] }>(
                "/turmas/listar?pageSize=100",
            );
            if (response.success && response.data) {
                turmas = response.data.data || [];
            }
        } catch (error) {
            console.error("Erro ao carregar turmas:", error);
        }
    }

    async function loadAlunosByTurma() {
        if (!selectedTurmaId) {
            alunos = [];
            return;
        }

        try {
            const response = await apiFetch<{ alunos: Aluno[] }>(
                `/turmas/${selectedTurmaId}/alunos`,
            );
            if (response.success && response.data) {
                alunos = response.data.alunos || [];
            }
        } catch (error) {
            console.error("Erro ao carregar alunos:", error);
            alunos = [];
        }
    }

    async function loadAllAlunos() {
        try {
            const response = await apiFetch<{ data: Aluno[] }>(
                "/alunos/listar?pageSize=200",
            );
            if (response.success && response.data) {
                alunos = response.data.data || [];
            }
        } catch (error) {
            console.error("Erro ao carregar alunos:", error);
        }
    }

    async function generateReport() {
        reportData = [];
        reportGenerated = false;

        if (tipoRelatorio === "individual" && !selectedAlunoId) {
            displayToast(
                "Selecione um aluno para gerar o relatório individual",
                "warning",
            );
            return;
        }

        if (tipoRelatorio === "turma" && !selectedTurmaId) {
            displayToast(
                "Selecione uma turma para gerar o relatório",
                "warning",
            );
            return;
        }

        loadingReport = true;

        try {
            let alunosParaRelatorio: Aluno[] = [];

            if (tipoRelatorio === "individual" && selectedAlunoId) {
                const aluno = alunos.find(
                    (a) => a.id_aluno === selectedAlunoId,
                );
                if (aluno) alunosParaRelatorio = [aluno];
            } else if (tipoRelatorio === "turma" && selectedTurmaId) {
                alunosParaRelatorio = alunos;
            } else if (tipoRelatorio === "geral") {
                await loadAllAlunos();
                alunosParaRelatorio = alunos;
            }

            if (alunosParaRelatorio.length === 0) {
                displayToast(
                    "Nenhum aluno encontrado para gerar relatório",
                    "warning",
                );
                loadingReport = false;
                return;
            }

            // Fetch statistics for each student
            const results: ReportData[] = [];

            for (const aluno of alunosParaRelatorio) {
                let url = `/alunos/estatisticas/${aluno.id_aluno}`;
                const params = new URLSearchParams();
                if (dataInicio) params.append("from", dataInicio);
                if (dataFim) params.append("to", dataFim);
                if (params.toString()) url += `?${params}`;

                const response = await apiFetch<{
                    aluno: Aluno;
                    estatisticas: Estatisticas;
                }>(url);
                if (response.success && response.data) {
                    results.push({
                        aluno: response.data.aluno,
                        estatisticas: response.data.estatisticas,
                    });
                }
            }

            reportData = results;
            reportGenerated = true;
            displayToast(
                `Relatório gerado com ${results.length} aluno(s)`,
                "success",
            );
        } catch (error) {
            console.error("Erro ao gerar relatório:", error);
            displayToast("Erro ao gerar relatório", "error");
        } finally {
            loadingReport = false;
        }
    }

    function exportToCSV() {
        if (reportData.length === 0) {
            displayToast("Gere um relatório antes de exportar", "warning");
            return;
        }

        const headers = [
            "Nome",
            "CPF",
            "Total Aulas",
            "Presenças",
            "Atrasos",
            "Faltas",
            "Taxa Presença (%)",
            "Justificativas",
            "Advertências",
        ];

        const rows = reportData.map((r) => [
            r.aluno.nome_aluno,
            formatCPF(r.aluno.cpf_aluno),
            r.estatisticas.presenca.totalAulas,
            r.estatisticas.presenca.presentes,
            r.estatisticas.presenca.atrasos,
            r.estatisticas.presenca.faltas,
            r.estatisticas.presenca.taxaPresenca,
            r.estatisticas.justificativas.total,
            r.estatisticas.advertencias.total,
        ]);

        const csvContent = [
            headers.join(";"),
            ...rows.map((row) => row.join(";")),
        ].join("\n");

        const blob = new Blob(["\ufeff" + csvContent], {
            type: "text/csv;charset=utf-8;",
        });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute(
            "download",
            `relatorio_frequencia_${new Date().toISOString().split("T")[0]}.csv`,
        );
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        displayToast("Relatório exportado em CSV!", "success");
    }

    function printReport() {
        if (reportData.length === 0) {
            displayToast("Gere um relatório antes de imprimir", "warning");
            return;
        }
        window.print();
    }

    $: if (selectedTurmaId) {
        loadAlunosByTurma();
    }

    $: if (tipoRelatorio === "individual" && !selectedTurmaId) {
        loadAllAlunos();
    }

    onMount(() => {
        loadTurmas();
        // Set default dates (last 30 days)
        const hoje = new Date();
        const trintaDiasAtras = new Date();
        trintaDiasAtras.setDate(hoje.getDate() - 30);
        dataFim = hoje.toISOString().split("T")[0];
        dataInicio = trintaDiasAtras.toISOString().split("T")[0];
    });
</script>

<div class="relatorio-generator">
    <div class="page-header">
        <div class="title">
            <h1>📋 Relatórios</h1>
            <p>Gere relatórios de frequência e desempenho</p>
        </div>
    </div>

    <!-- Filters -->
    <div class="filters-section">
        <div class="filter-row">
            <div class="filter-group">
                <label for="tipo">Tipo de Relatório</label>
                <select id="tipo" bind:value={tipoRelatorio}>
                    <option value="individual">Relatório Individual</option>
                    <option value="turma">Relatório por Turma</option>
                    <option value="geral">Relatório Geral</option>
                </select>
            </div>

            {#if tipoRelatorio !== "geral"}
                <div class="filter-group">
                    <label for="turma">Turma</label>
                    <select id="turma" bind:value={selectedTurmaId}>
                        <option value={null}>
                            {tipoRelatorio === "individual"
                                ? "Todas as turmas"
                                : "-- Selecione --"}
                        </option>
                        {#each turmas as turma}
                            <option value={turma.id_turma}
                                >{turma.nome_turma}</option
                            >
                        {/each}
                    </select>
                </div>
            {/if}

            {#if tipoRelatorio === "individual"}
                <div class="filter-group">
                    <label for="aluno">Aluno</label>
                    <select id="aluno" bind:value={selectedAlunoId}>
                        <option value={null}>-- Selecione um aluno --</option>
                        {#each alunos as aluno}
                            <option value={aluno.id_aluno}
                                >{aluno.nome_aluno}</option
                            >
                        {/each}
                    </select>
                </div>
            {/if}
        </div>

        <div class="filter-row">
            <div class="filter-group">
                <label for="data-inicio">Data Inicial</label>
                <input type="date" id="data-inicio" bind:value={dataInicio} />
            </div>
            <div class="filter-group">
                <label for="data-fim">Data Final</label>
                <input type="date" id="data-fim" bind:value={dataFim} />
            </div>
            <div class="filter-group btn-group">
                <button
                    class="btn-generate"
                    on:click={generateReport}
                    disabled={loadingReport}
                >
                    {#if loadingReport}
                        <span class="spinner-small"></span> Gerando...
                    {:else}
                        📊 Gerar Relatório
                    {/if}
                </button>
            </div>
        </div>
    </div>

    <!-- Report Area -->
    <div class="report-area" class:print-area={reportGenerated}>
        {#if !reportGenerated}
            <div class="empty-report">
                <span class="empty-icon">📄</span>
                <p>
                    Selecione os filtros e clique em "Gerar Relatório" para
                    visualizar os dados
                </p>
            </div>
        {:else if reportData.length === 0}
            <div class="empty-report">
                <span class="empty-icon">📭</span>
                <p>Nenhum dado encontrado para o período selecionado</p>
            </div>
        {:else}
            <!-- Export Buttons -->
            <div class="export-buttons no-print">
                <button class="btn-export" on:click={exportToCSV}>
                    📥 Exportar CSV/Excel
                </button>
                <button class="btn-export" on:click={printReport}>
                    🖨️ Imprimir / PDF
                </button>
            </div>

            <!-- Report Header -->
            <div class="report-header">
                <h2>Relatório de Frequência</h2>
                <p class="report-meta">
                    Período: {formatDate(dataInicio)} a {formatDate(dataFim)}
                    {#if tipoRelatorio === "turma" && selectedTurmaId}
                        | Turma: {turmas.find(
                            (t) => t.id_turma === selectedTurmaId,
                        )?.nome_turma}
                    {/if}
                </p>
                <p class="report-meta">
                    Gerado em: {new Date().toLocaleString("pt-BR")}
                </p>
            </div>

            <!-- Summary Stats -->
            {#if reportData.length > 1}
                <div class="summary-section">
                    <h3>Resumo Geral</h3>
                    <div class="summary-grid">
                        <div class="summary-card">
                            <span class="summary-value"
                                >{reportData.length}</span
                            >
                            <span class="summary-label">Total de Alunos</span>
                        </div>
                        <div class="summary-card">
                            <span class="summary-value">
                                {Math.round(
                                    reportData.reduce(
                                        (acc, r) =>
                                            acc +
                                            r.estatisticas.presenca
                                                .taxaPresenca,
                                        0,
                                    ) / reportData.length,
                                )}%
                            </span>
                            <span class="summary-label"
                                >Taxa Média de Presença</span
                            >
                        </div>
                        <div class="summary-card">
                            <span class="summary-value">
                                {reportData.reduce(
                                    (acc, r) =>
                                        acc + r.estatisticas.advertencias.total,
                                    0,
                                )}
                            </span>
                            <span class="summary-label"
                                >Total de Advertências</span
                            >
                        </div>
                    </div>
                </div>
            {/if}

            <!-- Individual Reports -->
            <div class="reports-list">
                {#each reportData as report}
                    <div class="report-card">
                        <div class="student-header">
                            <h3>{report.aluno.nome_aluno}</h3>
                            <span class="student-cpf"
                                >{formatCPF(report.aluno.cpf_aluno)}</span
                            >
                        </div>

                        <div class="stats-grid">
                            <div class="stat-item">
                                <span class="stat-label">Total de Aulas</span>
                                <span class="stat-value"
                                    >{report.estatisticas.presenca
                                        .totalAulas}</span
                                >
                            </div>
                            <div class="stat-item success">
                                <span class="stat-label">Presenças</span>
                                <span class="stat-value"
                                    >{report.estatisticas.presenca
                                        .presentes}</span
                                >
                            </div>
                            <div class="stat-item warning">
                                <span class="stat-label">Atrasos</span>
                                <span class="stat-value"
                                    >{report.estatisticas.presenca
                                        .atrasos}</span
                                >
                            </div>
                            <div class="stat-item danger">
                                <span class="stat-label">Faltas</span>
                                <span class="stat-value"
                                    >{report.estatisticas.presenca.faltas}</span
                                >
                            </div>
                            <div class="stat-item highlight">
                                <span class="stat-label">Taxa de Presença</span>
                                <span class="stat-value"
                                    >{report.estatisticas.presenca
                                        .taxaPresenca}%</span
                                >
                            </div>
                        </div>

                        <div class="additional-stats">
                            <div class="additional-item">
                                <span>📝 Justificativas:</span>
                                <span
                                    >{report.estatisticas.justificativas.total}
                                    ({report.estatisticas.justificativas
                                        .aprovadas} aprovadas,
                                    {report.estatisticas.justificativas
                                        .pendentes} pendentes)
                                </span>
                            </div>
                            <div class="additional-item">
                                <span>⚠️ Advertências:</span>
                                <span
                                    >{report.estatisticas.advertencias
                                        .total}</span
                                >
                            </div>
                        </div>
                    </div>
                {/each}
            </div>
        {/if}
    </div>
</div>

<!-- Toast Notification -->
<Toast bind:show={showToast} message={toastMessage} type={toastType} />

<style>
    .relatorio-generator {
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

    .filters-section {
        background: #fff;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 1.5rem;
        margin-bottom: 2rem;
    }

    .filter-row {
        display: flex;
        gap: 1rem;
        margin-bottom: 1rem;
        flex-wrap: wrap;
    }

    .filter-row:last-child {
        margin-bottom: 0;
    }

    .filter-group {
        display: flex;
        flex-direction: column;
        flex: 1;
        min-width: 180px;
    }

    .filter-group.btn-group {
        justify-content: flex-end;
    }

    .filter-group label {
        font-size: 0.9rem;
        margin-bottom: 0.5rem;
        color: #718096;
        font-weight: 500;
    }

    .filter-group select,
    .filter-group input {
        padding: 0.75rem;
        border: 1px solid #cbd5e0;
        border-radius: 6px;
        font-size: 1rem;
        color: #2d3748;
        background-color: #fdfdfd;
    }

    .filter-group select:focus,
    .filter-group input:focus {
        outline: none;
        border-color: #3182ce;
        box-shadow: 0 0 0 2px rgba(49, 130, 206, 0.2);
    }

    .btn-generate {
        padding: 0.75rem 1.5rem;
        background: linear-gradient(135deg, #e53e3e 0%, #c53030 100%);
        color: white;
        border: none;
        border-radius: 6px;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        transition: all 0.3s;
        white-space: nowrap;
    }

    .btn-generate:hover:not(:disabled) {
        background: linear-gradient(135deg, #c53030 0%, #9b2c2c 100%);
    }

    .btn-generate:disabled {
        opacity: 0.6;
        cursor: not-allowed;
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

    .report-area {
        background: #fff;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 1.5rem;
        min-height: 400px;
    }

    .empty-report {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 300px;
        color: #718096;
    }

    .empty-icon {
        font-size: 3rem;
        margin-bottom: 1rem;
    }

    .empty-report p {
        text-align: center;
        max-width: 300px;
    }

    .export-buttons {
        display: flex;
        gap: 1rem;
        margin-bottom: 1.5rem;
        justify-content: flex-end;
    }

    .btn-export {
        padding: 0.5rem 1rem;
        background-color: #4a5568;
        color: white;
        border: none;
        border-radius: 6px;
        font-size: 0.9rem;
        cursor: pointer;
        transition: background-color 0.3s;
    }

    .btn-export:hover {
        background-color: #2d3748;
    }

    .report-header {
        text-align: center;
        margin-bottom: 2rem;
        padding-bottom: 1rem;
        border-bottom: 2px solid #e2e8f0;
    }

    .report-header h2 {
        font-size: 1.5rem;
        margin: 0 0 0.5rem 0;
        color: #2d3748;
    }

    .report-meta {
        font-size: 0.9rem;
        color: #718096;
        margin: 0.25rem 0;
    }

    .summary-section {
        margin-bottom: 2rem;
    }

    .summary-section h3 {
        font-size: 1.1rem;
        color: #2d3748;
        margin: 0 0 1rem 0;
    }

    .summary-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
    }

    .summary-card {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 1.25rem;
        border-radius: 12px;
        text-align: center;
    }

    .summary-value {
        display: block;
        font-size: 2rem;
        font-weight: 700;
        margin-bottom: 0.25rem;
    }

    .summary-label {
        font-size: 0.85rem;
        opacity: 0.9;
    }

    .reports-list {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
    }

    .report-card {
        background: #f7fafc;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 1.5rem;
    }

    .student-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
        padding-bottom: 0.75rem;
        border-bottom: 1px solid #e2e8f0;
    }

    .student-header h3 {
        font-size: 1.1rem;
        margin: 0;
        color: #2d3748;
    }

    .student-cpf {
        font-size: 0.9rem;
        color: #718096;
    }

    .stats-grid {
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        gap: 1rem;
        margin-bottom: 1rem;
    }

    .stat-item {
        text-align: center;
        padding: 0.75rem;
        background: white;
        border-radius: 8px;
        border: 1px solid #e2e8f0;
    }

    .stat-item.success {
        background: #c6f6d5;
        border-color: #9ae6b4;
    }

    .stat-item.warning {
        background: #feebc8;
        border-color: #fbd38d;
    }

    .stat-item.danger {
        background: #fed7d7;
        border-color: #feb2b2;
    }

    .stat-item.highlight {
        background: linear-gradient(135deg, #ebf8ff 0%, #bee3f8 100%);
        border-color: #90cdf4;
    }

    .stat-item .stat-label {
        display: block;
        font-size: 0.75rem;
        color: #718096;
        margin-bottom: 0.25rem;
    }

    .stat-item .stat-value {
        display: block;
        font-size: 1.25rem;
        font-weight: 700;
        color: #2d3748;
    }

    .additional-stats {
        display: flex;
        gap: 2rem;
        font-size: 0.9rem;
        color: #4a5568;
    }

    .additional-item {
        display: flex;
        gap: 0.5rem;
    }

    /* Print Styles */
    @media print {
        .no-print {
            display: none !important;
        }

        .relatorio-generator {
            padding: 0;
        }

        .page-header,
        .filters-section {
            display: none;
        }

        .report-area {
            border: none;
            box-shadow: none;
            padding: 0;
        }

        .report-card {
            break-inside: avoid;
            page-break-inside: avoid;
        }

        .summary-card {
            background: #f0f0f0 !important;
            color: #333 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }
    }

    @media (max-width: 768px) {
        .filter-row {
            flex-direction: column;
        }

        .filter-group {
            width: 100%;
        }

        .stats-grid {
            grid-template-columns: repeat(2, 1fr);
        }

        .summary-grid {
            grid-template-columns: 1fr;
        }

        .student-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
        }

        .additional-stats {
            flex-direction: column;
            gap: 0.5rem;
        }

        .export-buttons {
            flex-direction: column;
        }

        .btn-export {
            width: 100%;
        }
    }
</style>
