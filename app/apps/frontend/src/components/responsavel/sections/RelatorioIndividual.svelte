<script lang="ts">
    import { authStore } from "../../../stores/auth";
    import { apiFetch } from "../../../lib/api";
    import Toast from "../../ui/Toast.svelte";

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

    // State
    let periodo = "30";
    let showCustomDates = false;
    let dataInicio = "";
    let dataFim = "";
    let isLoading = false;
    let isLoadingChildren = true;

    // Statistics
    let totalDias = 0;
    let presencas = 0;
    let atrasos = 0;
    let faltas = 0;
    let faltasJustificadas = 0;
    let faltasNaoJustificadas = 0;
    let taxaFrequencia = 0;

    // Child info
    let childInfo = {
        nome: "",
        idade: 0,
        turma: "",
        escola: "",
        condicaoMedica: "",
    };

    // Children list
    let children: Array<{
        id_aluno: number;
        nome_aluno: string;
        turma: { nome_turma: string } | null;
    }> = [];
    let selectedChildId: number | null = null;

    // Attendance history
    let historico: {
        id: string;
        data: string;
        diaSemana: string;
        status: "presente" | "atraso" | "falta" | "ausente";
        justificada: boolean;
    }[] = [];

    $: currentUser = $authStore.currentUser;

    // Track if we've already initiated loading
    let hasInitiatedLoad = false;

    // Watch for currentUser changes and load when available
    $: if (currentUser?.email && !hasInitiatedLoad) {
        hasInitiatedLoad = true;
        loadChildren();
    }

    // Status styling
    const statusColors: Record<string, string> = {
        presente: "bg-green-100 text-green-700",
        atraso: "bg-yellow-100 text-yellow-700",
        falta: "bg-red-100 text-red-700",
        ausente: "bg-red-100 text-red-700",
    };

    const diasSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

    // Dynamic color based on frequency rate
    function getFrequencyColor(rate: number): string {
        if (rate >= 75) return "text-green-600";
        if (rate >= 50) return "text-yellow-600";
        return "text-red-600";
    }

    function handlePeriodoChange() {
        showCustomDates = periodo === "custom";
        if (!showCustomDates && selectedChildId) {
            loadReportData();
        }
    }

    function handleCustomDateChange() {
        if (dataInicio && dataFim && selectedChildId) {
            loadReportData();
        }
    }

    function handleChildChange() {
        if (selectedChildId) {
            loadReportData();
        }
    }

    async function loadChildren() {
        if (!currentUser?.email) {
            isLoadingChildren = false;
            return;
        }

        isLoadingChildren = true;

        try {
            // Get responsável ID by email
            const respResponse = await apiFetch<{
                success: boolean;
                data: { id_responsavel: number };
            }>(
                `/responsaveis/por-email/${encodeURIComponent(currentUser.email)}`,
            );

            if (!respResponse.success || !respResponse.data) {
                displayToast("Responsável não encontrado no sistema", "error");
                isLoadingChildren = false;
                return;
            }

            const responsavelId = (respResponse.data as any).data
                .id_responsavel;

            // Get children
            const childrenResponse = await apiFetch<{
                success: boolean;
                data: Array<{
                    id_aluno: number;
                    nome_aluno: string;
                    turma: { nome_turma: string } | null;
                }>;
            }>(`/responsaveis/meus-filhos/${responsavelId}`);

            if (childrenResponse.success && childrenResponse.data) {
                const responseData = childrenResponse.data as any;
                children = responseData.data || [];

                if (children.length > 0) {
                    selectedChildId = children[0].id_aluno;
                    await loadReportData();
                } else {
                    displayToast(
                        "Nenhum filho vinculado à sua conta",
                        "warning",
                    );
                }
            }
        } catch (error) {
            console.error("Error loading children:", error);
            displayToast("Erro ao carregar dados", "error");
        } finally {
            isLoadingChildren = false;
        }
    }

    async function loadReportData() {
        if (!selectedChildId) return;

        isLoading = true;

        // Calculate date range
        let startDate: string;
        let endDate: string;

        if (periodo === "custom") {
            startDate = dataInicio;
            endDate = dataFim;
        } else {
            const hoje = new Date();
            endDate = hoje.toISOString().slice(0, 10);
            const inicio = new Date(hoje);
            inicio.setDate(inicio.getDate() - parseInt(periodo));
            startDate = inicio.toISOString().slice(0, 10);
        }

        try {
            // Build query params
            const params = new URLSearchParams();
            if (startDate) params.append("from", startDate);
            if (endDate) params.append("to", endDate);

            const response = await apiFetch<{
                success: boolean;
                aluno: {
                    id_aluno: number;
                    nome: string;
                    idade: number;
                    turma: string;
                    escola: string;
                    condicaoMedica: string | null;
                };
                estatisticas: {
                    totalDias: number;
                    presentes: number;
                    atrasos: number;
                    faltas: number;
                    faltasJustificadas: number;
                    faltasNaoJustificadas: number;
                    taxaFrequencia: number;
                };
                historico: Array<{
                    id: string;
                    data: string;
                    diaSemana: string;
                    status: string;
                    justificada: boolean;
                }>;
            }>(
                `/responsaveis/relatorio/${selectedChildId}?${params.toString()}`,
            );

            if (response.success && response.data) {
                const data = response.data as any;

                // Update child info
                if (data.aluno) {
                    childInfo = {
                        nome: data.aluno.nome,
                        idade: data.aluno.idade || 0,
                        turma: data.aluno.turma || "Sem turma",
                        escola: data.aluno.escola || "Não informado",
                        condicaoMedica: data.aluno.condicaoMedica || "",
                    };
                }

                // Update statistics
                if (data.estatisticas) {
                    totalDias = data.estatisticas.totalDias;
                    presencas = data.estatisticas.presentes;
                    atrasos = data.estatisticas.atrasos;
                    faltas = data.estatisticas.faltas;
                    faltasJustificadas =
                        data.estatisticas.faltasJustificadas || 0;
                    faltasNaoJustificadas =
                        data.estatisticas.faltasNaoJustificadas || 0;
                    taxaFrequencia = data.estatisticas.taxaFrequencia;
                }

                // Update historico
                historico = (data.historico || []).map((r: any) => ({
                    id: r.id,
                    data: r.data,
                    diaSemana: r.diaSemana,
                    status: r.status,
                    justificada: r.justificada || false,
                }));
            } else {
                displayToast("Erro ao carregar relatório", "error");
            }
        } catch (error) {
            console.error("Error loading report:", error);
            displayToast("Erro ao carregar relatório", "error");
        } finally {
            isLoading = false;
        }
    }

    function formatDate(dateStr: string): string {
        const date = new Date(dateStr);
        return date.toLocaleDateString("pt-BR");
    }

    function handleExportPDF() {
        // Create a printable version of the report
        const printContent = `
            <html>
            <head>
                <title>Relatório de Frequência - ${childInfo.nome}</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    h1 { color: #E11D48; }
                    .header { margin-bottom: 20px; }
                    .stats { display: flex; gap: 20px; margin-bottom: 20px; }
                    .stat { padding: 10px; border: 1px solid #ddd; border-radius: 8px; }
                    table { width: 100%; border-collapse: collapse; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #f5f5f5; }
                    .presente { color: green; }
                    .atraso { color: orange; }
                    .falta { color: red; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>Relatório Individual de Frequência</h1>
                    <p><strong>Aluno:</strong> ${childInfo.nome}</p>
                    <p><strong>Idade:</strong> ${childInfo.idade} anos</p>
                    <p><strong>Turma:</strong> ${childInfo.turma}</p>
                    <p><strong>Escola:</strong> ${childInfo.escola}</p>
                    ${childInfo.condicaoMedica ? `<p><strong>Condição médica:</strong> ${childInfo.condicaoMedica}</p>` : ""}
                    <p><strong>Data do relatório:</strong> ${new Date().toLocaleDateString("pt-BR")}</p>
                </div>
                
                <h2>Estatísticas do Período</h2>
                <div class="stats">
                    <div class="stat"><strong>Total de dias:</strong> ${totalDias}</div>
                    <div class="stat"><strong>Presenças:</strong> ${presencas}</div>
                    <div class="stat"><strong>Atrasos:</strong> ${atrasos}</div>
                    <div class="stat"><strong>Faltas:</strong> ${faltas}</div>
                    <div class="stat"><strong>Taxa de frequência:</strong> ${taxaFrequencia}%</div>
                </div>
                
                <h2>Histórico Detalhado</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Data</th>
                            <th>Dia da Semana</th>
                            <th>Status</th>
                            <th>Justificada</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${historico
                            .map(
                                (r) => `
                            <tr>
                                <td>${formatDate(r.data)}</td>
                                <td>${r.diaSemana}</td>
                                <td class="${r.status}">${r.status}</td>
                                <td>${r.justificada ? "Sim" : "-"}</td>
                            </tr>
                        `,
                            )
                            .join("")}
                    </tbody>
                </table>
                
                <p style="margin-top: 40px; font-size: 12px; color: #666;">
                    Programa Bombeiro Mirim - Sistema de Gestão
                </p>
            </body>
            </html>
        `;

        // Open print dialog
        const printWindow = window.open("", "_blank");
        if (printWindow) {
            printWindow.document.write(printContent);
            printWindow.document.close();
            printWindow.print();
        } else {
            displayToast(
                "Não foi possível abrir a janela de impressão. Verifique se popups estão bloqueados.",
                "warning",
            );
        }
    }

    // onMount is no longer needed - reactive statement handles loading when currentUser is available
</script>

<section
    class="bg-white rounded-3xl p-6 border border-slate-200"
    style="box-shadow: 0 10px 30px rgba(0,0,0,.08), 0 6px 10px rgba(0,0,0,.06);"
>
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
        <div>
            <h2 class="text-2xl font-bold text-slate-900 mb-1">
                Relatório Individual
            </h2>
            <p class="text-slate-500">
                {#if childInfo.nome}
                    Relatório de {childInfo.nome}
                {:else}
                    Desempenho e frequência do seu filho
                {/if}
            </p>
        </div>
        <button
            on:click={handleExportPDF}
            disabled={isLoading || children.length === 0}
            class="px-4 py-2 rounded-lg bg-[#E11D48] hover:bg-[#BE123C] text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
            Exportar PDF
        </button>
    </div>

    {#if isLoadingChildren}
        <div class="text-center py-12 text-slate-500">
            <p>Carregando dados...</p>
        </div>
    {:else if children.length === 0}
        <div class="text-center py-12 text-slate-500">
            <p>Nenhum filho vinculado à sua conta.</p>
            <p class="text-sm mt-2">
                Entre em contato com a administração para vincular seus filhos.
            </p>
        </div>
    {:else}
        <!-- Period Selector -->
        <div class="grid md:grid-cols-4 gap-4 mb-6">
            {#if children.length > 1}
                <div>
                    <label
                        for="childSelect"
                        class="block text-sm font-medium mb-1">Filho(a)</label
                    >
                    <select
                        id="childSelect"
                        bind:value={selectedChildId}
                        on:change={handleChildChange}
                        class="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#E11D48]"
                    >
                        {#each children as child}
                            <option value={child.id_aluno}
                                >{child.nome_aluno}</option
                            >
                        {/each}
                    </select>
                </div>
            {/if}
            <div>
                <label
                    for="periodoRelatorio"
                    class="block text-sm font-medium mb-1">Período</label
                >
                <select
                    id="periodoRelatorio"
                    bind:value={periodo}
                    on:change={handlePeriodoChange}
                    class="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#E11D48]"
                >
                    <option value="30">Últimos 30 dias</option>
                    <option value="60">Últimos 60 dias</option>
                    <option value="90">Últimos 90 dias</option>
                    <option value="custom">Período personalizado</option>
                </select>
            </div>
            {#if showCustomDates}
                <div>
                    <label
                        for="dataInicioRel"
                        class="block text-sm font-medium mb-1"
                        >Data inicial</label
                    >
                    <input
                        id="dataInicioRel"
                        type="date"
                        bind:value={dataInicio}
                        on:change={handleCustomDateChange}
                        class="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#E11D48]"
                    />
                </div>
                <div>
                    <label
                        for="dataFimRel"
                        class="block text-sm font-medium mb-1">Data final</label
                    >
                    <input
                        id="dataFimRel"
                        type="date"
                        bind:value={dataFim}
                        on:change={handleCustomDateChange}
                        class="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#E11D48]"
                    />
                </div>
            {/if}
        </div>

        <!-- Two Column Layout: Stats + Child Info -->
        <div class="grid md:grid-cols-2 gap-6 mb-6">
            <!-- Statistics -->
            <div class="bg-slate-50 rounded-xl p-6">
                <h3 class="font-semibold mb-4">Estatísticas do Período</h3>
                {#if isLoading}
                    <div class="text-center text-slate-500 py-4">
                        Carregando...
                    </div>
                {:else}
                    <div class="space-y-3">
                        <div class="flex justify-between">
                            <span>Total de dias letivos:</span>
                            <span class="font-medium">{totalDias}</span>
                        </div>
                        <div class="flex justify-between">
                            <span>Presenças:</span>
                            <span class="font-medium text-green-600"
                                >{presencas}</span
                            >
                        </div>
                        <div class="flex justify-between">
                            <span>Atrasos:</span>
                            <span class="font-medium text-yellow-600"
                                >{atrasos}</span
                            >
                        </div>
                        <div class="flex justify-between">
                            <span>Faltas:</span>
                            <span class="font-medium text-red-600"
                                >{faltas}</span
                            >
                        </div>
                        {#if faltasJustificadas > 0 || faltasNaoJustificadas > 0}
                            <div class="flex justify-between text-sm pl-4">
                                <span>- Justificadas:</span>
                                <span class="font-medium"
                                    >{faltasJustificadas}</span
                                >
                            </div>
                            <div class="flex justify-between text-sm pl-4">
                                <span>- Não justificadas:</span>
                                <span class="font-medium"
                                    >{faltasNaoJustificadas}</span
                                >
                            </div>
                        {/if}
                        <hr class="my-2" />
                        <div class="flex justify-between text-lg">
                            <span class="font-semibold"
                                >Taxa de Frequência:</span
                            >
                            <span
                                class="font-bold {getFrequencyColor(
                                    taxaFrequencia,
                                )}">{taxaFrequencia}%</span
                            >
                        </div>
                    </div>
                {/if}
            </div>

            <!-- Child Info -->
            <div class="bg-slate-50 rounded-xl p-6">
                <h3 class="font-semibold mb-4">Informações da Criança</h3>
                {#if isLoading}
                    <div class="text-center text-slate-500 py-4">
                        Carregando...
                    </div>
                {:else}
                    <div class="space-y-3">
                        <div class="flex justify-between">
                            <span>Nome:</span>
                            <span class="font-medium">{childInfo.nome}</span>
                        </div>
                        <div class="flex justify-between">
                            <span>Idade:</span>
                            <span class="font-medium"
                                >{childInfo.idade} anos</span
                            >
                        </div>
                        <div class="flex justify-between">
                            <span>Turma:</span>
                            <span class="font-medium">{childInfo.turma}</span>
                        </div>
                        <div class="flex justify-between">
                            <span>Escola:</span>
                            <span class="font-medium">{childInfo.escola}</span>
                        </div>
                        {#if childInfo.condicaoMedica}
                            <div class="flex justify-between">
                                <span>Condição médica:</span>
                                <span class="font-medium text-red-600"
                                    >{childInfo.condicaoMedica}</span
                                >
                            </div>
                        {/if}
                    </div>
                {/if}
            </div>
        </div>

        <!-- Weekly Frequency Chart -->
        <div class="bg-slate-50 rounded-xl p-6 mb-6">
            <h3 class="font-semibold mb-4">Frequência por Semana</h3>
            <div class="grid grid-cols-7 gap-2 text-center text-sm">
                {#each diasSemana as dia}
                    <div class="font-medium">{dia}</div>
                {/each}
                <!-- Calculate weekly frequency from historico -->
                {#each diasSemana as dia, index}
                    {@const dayRecords = historico.filter((r) => {
                        const d = new Date(r.data);
                        return d.getDay() === index;
                    })}
                    {@const dayPresent = dayRecords.filter(
                        (r) => r.status === "presente",
                    ).length}
                    {@const dayTotal = dayRecords.length}
                    {@const dayPercentage =
                        dayTotal > 0 ? dayPresent / dayTotal : 0}
                    <div
                        class="h-16 rounded {index === 0 || index === 6
                            ? 'bg-slate-200'
                            : dayTotal > 0
                              ? 'bg-gradient-to-t from-green-500 to-green-400'
                              : 'bg-slate-200'}"
                        style="opacity: {index === 0 || index === 6
                            ? 0.3
                            : dayTotal > 0
                              ? 0.4 + dayPercentage * 0.6
                              : 0.3}"
                        title={dayTotal > 0
                            ? `${dayPresent}/${dayTotal} presenças`
                            : "Sem dados"}
                    ></div>
                {/each}
            </div>
        </div>

        <!-- Detailed History -->
        <div>
            <h3 class="font-semibold mb-4">Histórico Detalhado</h3>
            <div class="overflow-x-auto">
                <table
                    class="w-full border border-slate-200 rounded-xl overflow-hidden"
                >
                    <thead class="bg-slate-50">
                        <tr class="text-left text-sm">
                            <th class="p-3">Data</th>
                            <th class="p-3">Dia da Semana</th>
                            <th class="p-3">Status</th>
                            <th class="p-3">Justificada</th>
                        </tr>
                    </thead>
                    <tbody class="text-sm">
                        {#if isLoading}
                            <tr>
                                <td
                                    colspan="4"
                                    class="p-3 text-center text-slate-500"
                                    >Carregando...</td
                                >
                            </tr>
                        {:else if historico.length === 0}
                            <tr>
                                <td
                                    colspan="4"
                                    class="p-3 text-center text-slate-500"
                                >
                                    Nenhum registro encontrado no período
                                </td>
                            </tr>
                        {:else}
                            {#each historico as registro}
                                <tr class="border-t">
                                    <td class="p-3"
                                        >{formatDate(registro.data)}</td
                                    >
                                    <td class="p-3 capitalize"
                                        >{registro.diaSemana}</td
                                    >
                                    <td class="p-3">
                                        <span
                                            class="px-2 py-1 rounded-full text-xs {statusColors[
                                                registro.status
                                            ] || statusColors['falta']}"
                                        >
                                            {registro.status}
                                        </span>
                                    </td>
                                    <td class="p-3">
                                        {#if registro.status === "falta" || registro.status === "ausente"}
                                            {registro.justificada
                                                ? "✓ Sim"
                                                : "✗ Não"}
                                        {:else}
                                            -
                                        {/if}
                                    </td>
                                </tr>
                            {/each}
                        {/if}
                    </tbody>
                </table>
            </div>
        </div>
    {/if}
</section>

<!-- Toast notifications -->
<Toast bind:show={showToast} message={toastMessage} type={toastType} />
