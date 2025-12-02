<script lang="ts">
    import { onMount } from "svelte";

    // State
    let periodo = "30";
    let showCustomDates = false;
    let dataInicio = "";
    let dataFim = "";
    let isLoading = false;

    // Statistics
    let totalDias = 0;
    let presencas = 0;
    let atrasos = 0;
    let faltas = 0;
    let taxaFrequencia = 0;

    // Child info
    let childInfo = {
        nome: "",
        idade: 0,
        turma: "",
        escola: "",
        condicaoMedica: "",
    };

    // Attendance history
    let historico: {
        id: string;
        data: string;
        diaSemana: string;
        status: "presente" | "atraso" | "falta";
        observacoes?: string;
    }[] = [];

    // Status styling
    const statusColors: Record<string, string> = {
        presente: "bg-green-100 text-green-700",
        atraso: "bg-yellow-100 text-yellow-700",
        falta: "bg-red-100 text-red-700",
    };

    const diasSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

    function handlePeriodoChange() {
        showCustomDates = periodo === "custom";
        if (!showCustomDates) {
            loadReportData();
        }
    }

    function handleCustomDateChange() {
        if (dataInicio && dataFim) {
            loadReportData();
        }
    }

    async function loadReportData() {
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

        // TODO: Replace with actual API call
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Mock child info
        childInfo = {
            nome: "Ana Pereira Silva",
            idade: 12,
            turma: "Turma A - Manhã",
            escola: "EMEF Vila Rosa",
            condicaoMedica: "asma",
        };

        // Generate mock history
        historico = generateMockHistory(startDate, endDate);

        // Calculate statistics
        totalDias = historico.length;
        presencas = historico.filter((r) => r.status === "presente").length;
        atrasos = historico.filter((r) => r.status === "atraso").length;
        faltas = historico.filter((r) => r.status === "falta").length;
        taxaFrequencia =
            totalDias > 0 ? Math.round((presencas / totalDias) * 100) : 0;

        isLoading = false;
    }

    function generateMockHistory(startDate: string, endDate: string) {
        const records: typeof historico = [];
        const start = new Date(startDate);
        const end = new Date(endDate);

        for (let d = new Date(end); d >= start; d.setDate(d.getDate() - 1)) {
            // Skip weekends
            if (d.getDay() === 0 || d.getDay() === 6) continue;

            const rand = Math.random();
            let status: "presente" | "atraso" | "falta";
            let observacoes = "";

            if (rand > 0.15) {
                status = "presente";
            } else if (rand > 0.05) {
                status = "atraso";
                observacoes = "Chegou alguns minutos atrasado";
            } else {
                status = "falta";
            }

            const diaSemanaName = new Date(d).toLocaleDateString("pt-BR", {
                weekday: "long",
            });

            records.push({
                id: `hist-${d.getTime()}`,
                data: d.toISOString().slice(0, 10),
                diaSemana: diaSemanaName,
                status,
                observacoes,
            });
        }

        return records;
    }

    function formatDate(dateStr: string): string {
        const date = new Date(dateStr + "T00:00:00");
        return date.toLocaleDateString("pt-BR");
    }

    function handleExportPDF() {
        alert(
            "Funcionalidade de exportação em desenvolvimento.\n\nEm breve você poderá baixar o relatório em PDF.",
        );
    }

    onMount(() => {
        loadReportData();
    });
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
            class="px-4 py-2 rounded-lg bg-[#E11D48] hover:bg-[#BE123C] text-white transition"
        >
            Exportar PDF
        </button>
    </div>

    <!-- Period Selector -->
    <div class="grid md:grid-cols-3 gap-4 mb-6">
        <div>
            <label for="periodoRelatorio" class="block text-sm font-medium mb-1"
                >Período</label
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
                    class="block text-sm font-medium mb-1">Data inicial</label
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
                <label for="dataFimRel" class="block text-sm font-medium mb-1"
                    >Data final</label
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
            <div class="space-y-3">
                <div class="flex justify-between">
                    <span>Total de dias letivos:</span>
                    <span class="font-medium">{totalDias}</span>
                </div>
                <div class="flex justify-between">
                    <span>Presenças:</span>
                    <span class="font-medium text-green-600">{presencas}</span>
                </div>
                <div class="flex justify-between">
                    <span>Atrasos:</span>
                    <span class="font-medium text-yellow-600">{atrasos}</span>
                </div>
                <div class="flex justify-between">
                    <span>Faltas:</span>
                    <span class="font-medium text-red-600">{faltas}</span>
                </div>
                <hr class="my-2" />
                <div class="flex justify-between text-lg">
                    <span class="font-semibold">Taxa de Frequência:</span>
                    <span class="font-bold text-[#E11D48]"
                        >{taxaFrequencia}%</span
                    >
                </div>
            </div>
        </div>

        <!-- Child Info -->
        <div class="bg-slate-50 rounded-xl p-6">
            <h3 class="font-semibold mb-4">Informações da Criança</h3>
            {#if isLoading}
                <div class="text-center text-slate-500 py-4">Carregando...</div>
            {:else}
                <div class="space-y-3">
                    <div class="flex justify-between">
                        <span>Nome:</span>
                        <span class="font-medium">{childInfo.nome}</span>
                    </div>
                    <div class="flex justify-between">
                        <span>Idade:</span>
                        <span class="font-medium">{childInfo.idade} anos</span>
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
            <!-- Placeholder bars -->
            {#each diasSemana as dia, index}
                <div
                    class="h-16 rounded {index === 0 || index === 6
                        ? 'bg-slate-200'
                        : 'bg-gradient-to-t from-green-500 to-green-400'}"
                    style="opacity: {index === 0 || index === 6
                        ? 0.3
                        : 0.7 + Math.random() * 0.3}"
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
                        <th class="p-3">Observações</th>
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
                                <td class="p-3">{formatDate(registro.data)}</td>
                                <td class="p-3 capitalize"
                                    >{registro.diaSemana}</td
                                >
                                <td class="p-3">
                                    <span
                                        class="px-2 py-1 rounded-full text-xs {statusColors[
                                            registro.status
                                        ]}"
                                    >
                                        {registro.status}
                                    </span>
                                </td>
                                <td class="p-3"
                                    >{registro.observacoes || "-"}</td
                                >
                            </tr>
                        {/each}
                    {/if}
                </tbody>
            </table>
        </div>
    </div>
</section>
